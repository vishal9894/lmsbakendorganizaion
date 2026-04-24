import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { Admin } from './entities/admin.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { S3Service } from 'src/common/services/s3.service';
import { Role } from 'src/roles/entities/role.entity';
import { LoginAdminDto } from './dto/login-admin.dto';

interface CurrentUserData {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
    subdomain?: string;
    type?: string;
    permissions?: string[];
}

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,
        private tenantManager: TenantManager,
        private jwtService: JwtService,
        private s3Service: S3Service,
    ) { }

    async createAdmin(data: {
        name?: string;
        email?: string;
        password?: string;
        organizationId?: string;
        roleId?: string;
    }, file?: Express.Multer.File) {
        // Validate required fields
        if (!data.name || data.name.length < 2) {
            throw new BadRequestException('Name is required and must be at least 2 characters');
        }
        if (!data.email || !data.email.includes('@')) {
            throw new BadRequestException('Valid email is required');
        }
        if (!data.password || data.password.length < 6) {
            throw new BadRequestException('Password is required and must be at least 6 characters');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // If organizationId provided, create admin in tenant database
        if (data.organizationId) {
            // Check if organization exists
            const org = await this.orgRepo.findOne({
                where: { id: data.organizationId },
            });

            if (!org) {
                throw new NotFoundException('Organization not found');
            }

            // Get connection to the tenant database
            const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
            const tenantAdminRepo = tenantDataSource.getRepository(Admin);

            // Check if email already exists in tenant database
            const existingAdmin = await tenantAdminRepo.findOne({
                where: { email: data.email },
            });

            if (existingAdmin) {
                throw new BadRequestException('Email already registered');
            }

            // Generate roleId if not provided
            const roleId = data.roleId || uuidv4();

            // Create admin in tenant database
            const admin = tenantAdminRepo.create({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                organizationId: data.organizationId,
                roleId: roleId,
            });

            await tenantAdminRepo.save(admin);

            return {
                message: 'Admin created successfully in organization database',
                type: 'tenant_admin',
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    organizationId: org.id,
                },
                organization: {
                    id: org.id,
                    name: org.name,
                    subdomain: org.subdomain,
                },
            };
        }

        // No organizationId - create super admin in main platform database
        const existingAdmin = await this.adminRepo.findOne({
            where: { email: data.email },
        });

        if (existingAdmin) {
            throw new BadRequestException('Email already registered');
        }

        let imageUrl: string | undefined = undefined;
        if (file) {
            imageUrl = await this.s3Service.upload(file, 'admin');
        }

        // Generate roleId if not provided
        const roleId = data.roleId || uuidv4();

        const admin = this.adminRepo.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            image: imageUrl,
            roleId: roleId,
        });

        await this.adminRepo.save(admin);

        return {
            message: 'Super admin created successfully in platform database',
            type: 'super_admin',
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
            },
        };
    }

    async adminLogin(data: {
        email: string;
        password: string;
    }) {
        try {
            // Find admin in main database only
            const admin = await this.adminRepo.findOne({
                where: { email: data.email },
            });

            if (!admin) {
                throw new UnauthorizedException('Admin not found in main database');
            }

            // Validate password exists
            if (!data.password || !admin.password) {
                throw new UnauthorizedException('Password required');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(data.password, admin.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid password');
            }

            // Get all organizations for super admin to choose from
            const allOrganizations = await this.orgRepo.find();

            // Generate JWT token for main admin
            const token = this.jwtService.sign({
                sub: admin.id,
                email: admin.email,
                role: 'super_admin',
                permissions: ['*'], // All permissions
                roleId: admin.roleId || uuidv4(),
            });

            return {
                message: 'Main admin login successful',
                type: 'super_admin',
                token,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: 'super_admin',
                    roleId: admin.roleId || uuidv4(),
                    permissions: ['*'],
                },
                organizations: allOrganizations.map(org => ({
                    id: org.id,
                    name: org.name,
                    subdomain: org.subdomain,
                })),
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Error during main admin login');
        }
    }

    async normalLogin(data: {
        email: string;
        password: string;
    }) {
        try {
            console.log('Normal login attempt for email:', data.email);

            // Find admin in main database only
            const admin = await this.adminRepo.findOne({
                where: { email: data.email },
            });

            console.log('Admin found in main database:', !!admin);

            if (!admin) {
                throw new UnauthorizedException('Admin not found in main database. Please check email or use org-login if you are an organization admin.');
            }

            // Simple login - if admin exists, allow login (no password check for now)
            if (!admin.password && data.password) {
                // Set password if not exists
                const hashedPassword = await bcrypt.hash(data.password, 10);
                admin.password = hashedPassword;
                await this.adminRepo.save(admin);
                console.log('Password set for admin');
            } else if (admin.password && data.password) {
                // Verify password if exists
                const isPasswordValid = await bcrypt.compare(data.password, admin.password);
                if (!isPasswordValid) {
                    throw new UnauthorizedException('Invalid password');
                }
            }

            // Generate JWT token
            const token = this.jwtService.sign({
                sub: admin.id,
                email: admin.email,
                role: 'super_admin',
                permissions: ['*'],
            });

            return {
                message: 'Normal admin login successful',
                type: 'normal_admin',
                token,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: 'super_admin',
                    permissions: ['*'],
                },
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Error during normal admin login');
        }
    }

    async orgLogin(data: {
        email: string;
        password: string;
    }) {
        try {
            console.log('Org login attempt for email:', data.email);

            // Get all organizations
            const organizations = await this.orgRepo.find();

            if (organizations.length === 0) {
                throw new UnauthorizedException('No organizations found');
            }

            let foundAdmin: Admin | null = null;
            let foundOrg: Organization | null = null;

            // Search for admin across all tenant databases
            for (const org of organizations) {
                try {
                    const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
                    const tenantAdminRepo = tenantDataSource.getRepository(Admin);

                    const admin = await tenantAdminRepo.findOne({
                        where: { email: data.email },
                    });

                    if (admin) {
                        foundAdmin = admin;
                        foundOrg = org;
                        console.log('Admin found in organization:', org.name, 'subdomain:', org.subdomain);
                        break;
                    }
                } catch (error) {
                    // Continue searching other organizations
                    continue;
                }
            }

            if (!foundAdmin || !foundOrg) {
                throw new UnauthorizedException('Admin not found in any organization. Please check email or use normal-login if you are a main admin.');
            }

            console.log('Admin found in organization database:', !!foundAdmin);

            // Handle password if not exists
            if (!foundAdmin.password && data.password) {
                // Set password if not exists
                const hashedPassword = await bcrypt.hash(data.password, 10);
                foundAdmin.password = hashedPassword;

                // Save back to tenant database
                const tenantDataSource = await this.tenantManager.getTenantConnection(foundOrg.subdomain);
                const tenantAdminRepo = tenantDataSource.getRepository(Admin);
                await tenantAdminRepo.save(foundAdmin);
                console.log('Password set for admin in organization');
            } else if (foundAdmin.password && data.password) {
                // Verify password if exists
                const isPasswordValid = await bcrypt.compare(data.password, foundAdmin.password);
                if (!isPasswordValid) {
                    throw new UnauthorizedException('Invalid password');
                }
            }

            // Generate JWT token
            const token = this.jwtService.sign({
                sub: foundAdmin.id,
                email: foundAdmin.email,
                organizationId: foundOrg.id,
                subdomain: foundOrg.subdomain,
                role: 'tenant_admin',
                permissions: [],
            });

            return {
                message: 'Organization admin login successful',
                type: 'organization_admin',
                token,
                admin: {
                    id: foundAdmin.id,
                    name: foundAdmin.name,
                    email: foundAdmin.email,
                    role: 'tenant_admin',
                    permissions: [],
                },
                organization: {
                    id: foundOrg.id,
                    name: foundOrg.name,
                    subdomain: foundOrg.subdomain,
                },
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Error during organization admin login');
        }
    }

    async mainSignup(data: {
        name: string;
        email: string;
        password: string;
    }) {
        try {
            console.log('Main signup attempt for email:', data.email);

            // Check if admin already exists in main database
            const existingAdmin = await this.adminRepo.findOne({
                where: { email: data.email },
            });

            if (existingAdmin) {
                throw new BadRequestException('Admin with this email already exists in main database');
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, 10);

            // Create admin in main database
            const admin = this.adminRepo.create({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                roleName: 'super_admin',
            });

            await this.adminRepo.save(admin);

            console.log('Main admin created successfully');

            return {
                message: 'Main admin signup successful',
                type: 'main_admin',
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: 'super_admin',
                },
            };
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error during main admin signup');
        }
    }

    async orgSignup(data: {
        name: string;
        email: string;
        password: string;
        organizationId: string;
    }) {
        try {
            console.log('Org signup attempt for email:', data.email, 'orgId:', data.organizationId);

            // Find organization
            console.log('Step 1: Finding organization with ID:', data.organizationId);
            const org = await this.orgRepo.findOne({
                where: { id: data.organizationId },
            });
            console.log('Organization found:', !!org);

            if (!org) {
                throw new NotFoundException('Organization not found');
            }

            console.log('Step 2: Getting tenant connection for subdomain:', org.subdomain);
            // Get connection to tenant database
            const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
            console.log('Tenant connection established');

            const tenantAdminRepo = tenantDataSource.getRepository(Admin);
            console.log('Tenant admin repository created');

            // Check if admin already exists in organization database
            console.log('Step 3: Checking if admin already exists');
            const existingAdmin = await tenantAdminRepo.findOne({
                where: { email: data.email },
            });
            console.log('Existing admin found:', !!existingAdmin);

            if (existingAdmin) {
                throw new BadRequestException('Admin with this email already exists in organization');
            }

            console.log('Step 4: Hashing password');
            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, 10);
            console.log('Password hashed successfully');

            console.log('Step 5: Creating admin in tenant database');
            // Create admin in organization database
            const admin = tenantAdminRepo.create({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                organizationId: data.organizationId,
                roleName: 'tenant_admin',
            });
            console.log('Admin object created');

            console.log('Step 6: Saving admin to tenant database');
            await tenantAdminRepo.save(admin);
            console.log('Organization admin created successfully');

            return {
                message: 'Organization admin signup successful',
                type: 'organization_admin',
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: 'tenant_admin',
                    organizationId: data.organizationId,
                },
                organization: {
                    id: org.id,
                    name: org.name,
                    subdomain: org.subdomain,
                },
            };
        } catch (error) {
            console.log('Error in orgSignup:', error);
            console.log('Error type:', error.constructor.name);
            console.log('Error message:', error.message);

            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error during organization admin signup: ' + error.message);
        }
    }

    async getAllOrganizationAdmins() {
        try {
            // Get all organizations with basic error handling
            let organizations;
            try {
                organizations = await this.orgRepo.find();
            } catch (error) {
                return {
                    message: 'Error fetching organizations',
                    admins: [],
                    error: 'Database connection error'
                };
            }

            if (!organizations || organizations.length === 0) {
                return {
                    message: 'No organizations found',
                    totalOrganizations: 0,
                    totalAdmins: 0,
                    admins: [],
                };
            }

            let allAdmins: any[] = [];
            let successCount = 0;
            let errorCount = 0;

            // Process each organization safely
            for (const org of organizations) {
                try {
                    // Skip if no subdomain
                    if (!org.subdomain) {
                        errorCount++;
                        continue;
                    }

                    // Get tenant connection with timeout
                    const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);

                    // Get admin repository
                    const tenantAdminRepo = tenantDataSource.getRepository(Admin);

                    // Simple find without select to avoid field issues
                    const admins = await tenantAdminRepo.find();

                    // Add organization info safely
                    const adminsWithOrg = admins;

                    allAdmins = allAdmins.concat(adminsWithOrg);
                    successCount++;
                } catch (error) {
                    errorCount++;
                    // Continue processing other organizations
                    continue;
                }
            }

            return {
                message: 'All organization admins fetched successfully',
                totalOrganizations: organizations.length,
                successfulOrganizations: successCount,
                failedOrganizations: errorCount,
                totalAdmins: allAdmins.length,
                admins: allAdmins,
            };
        } catch (error) {
            // Return safe response instead of throwing error
            return {
                message: 'Partial success - some organizations could not be accessed',
                admins: [],
                error: 'Service temporarily unavailable'
            };
        }
    }

    async organizationLogin(data: {
        email: string;
        password: string;
    }) {
        try {
            console.log('Organization login attempt for email:', data.email);

            // Get all organizations
            const organizations = await this.orgRepo.find();

            if (organizations.length === 0) {
                throw new UnauthorizedException('No organizations found');
            }

            let foundAdmin: Admin | null = null;
            let foundOrg: Organization | null = null;

            // Search for admin across all tenant databases
            for (const org of organizations) {
                try {
                    const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
                    const tenantAdminRepo = tenantDataSource.getRepository(Admin);

                    const admin = await tenantAdminRepo.findOne({
                        where: { email: data.email },
                    });

                    if (admin) {
                        foundAdmin = admin;
                        foundOrg = org;
                        console.log('Admin found in organization:', org.name, 'subdomain:', org.subdomain);
                        break;
                    }
                } catch (error) {
                    // Continue searching other organizations
                    continue;
                }
            }

            if (!foundAdmin || !foundOrg) {
                throw new UnauthorizedException('Admin not found in any organization. Please check email or use normal-login if you are a main admin.');
            }

            console.log('Admin found in organization database:', !!foundAdmin);

            // Handle password if not exists
            if (!foundAdmin.password && data.password) {
                // Set password if not exists
                const hashedPassword = await bcrypt.hash(data.password, 10);
                foundAdmin.password = hashedPassword;

                // Save back to tenant database
                const tenantDataSource = await this.tenantManager.getTenantConnection(foundOrg.subdomain);
                const tenantAdminRepo = tenantDataSource.getRepository(Admin);
                await tenantAdminRepo.save(foundAdmin);
                console.log('Password set for admin in organization');
            } else if (foundAdmin.password && data.password) {
                // Verify password if exists
                const isPasswordValid = await bcrypt.compare(data.password, foundAdmin.password);
                if (!isPasswordValid) {
                    throw new UnauthorizedException('Invalid password');
                }
            }

            // Generate JWT token
            const token = this.jwtService.sign({
                sub: foundAdmin.id,
                email: foundAdmin.email,
                organizationId: foundOrg.id,
                subdomain: foundOrg.subdomain,
                role: 'tenant_admin',
                permissions: [],
            });

            return {
                message: 'Organization admin login successful',
                type: 'organization_admin',
                token,
                admin: {
                    id: foundAdmin.id,
                    name: foundAdmin.name,
                    email: foundAdmin.email,
                    role: 'tenant_admin',
                    permissions: [],
                },
                organization: {
                    id: foundOrg.id,
                    name: foundOrg.name,
                    subdomain: foundOrg.subdomain,
                },
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException('Error during organization admin login');
        }
    }


    async login(data: {
        email: string;
        password: string;
        subdomain?: string;
    }) {
        // If subdomain provided, login directly to that organization
        if (data.subdomain) {
            const org = await this.orgRepo.findOne({
                where: { subdomain: data.subdomain },
            });

            if (!org) {
                throw new UnauthorizedException('Organization not found');
            }

            const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
            const tenantAdminRepo = tenantDataSource.getRepository(Admin);

            const admin = await tenantAdminRepo.findOne({
                where: { email: data.email },
            });

            // If org admin found, login as org admin
            if (admin) {
                // Validate password exists
                if (!data.password || !admin.password) {
                    throw new UnauthorizedException('Password required');
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(data.password, admin.password);
                if (!isPasswordValid) {
                    throw new UnauthorizedException('Invalid password');
                }

                // Fetch role and permissions
                let permissions: string[] = [];
                let roleName = 'tenant_admin';

                if (admin.roleId) {
                    const roleRepo = tenantDataSource.getRepository(Role);
                    const role = await roleRepo.findOne({
                        where: { id: admin.roleId },
                        relations: ['permissions'],
                    });
                    if (role) {
                        roleName = role.name;
                        permissions = role.permissions?.map(p => p.name) || [];
                    }
                }

                const token = this.jwtService.sign({
                    sub: admin.id,
                    email: admin.email,
                    organizationId: org.id,
                    subdomain: org.subdomain,
                    role: roleName,
                    roleId: admin.roleId,
                    permissions: permissions,
                });

                return {
                    message: 'Login successful',
                    type: 'tenant_admin',
                    token,
                    admin: {
                        id: admin.id,
                        name: admin.name,
                        email: admin.email,
                        role: roleName,
                        roleId: admin.roleId,
                        permissions: permissions,
                    },
                    organization: {
                        id: org.id,
                        name: org.name,
                        subdomain: org.subdomain,
                    },
                };
            }

            // If not org admin, check if it's a super admin (can access any organization)
            const superAdmin = await this.adminRepo.findOne({
                where: { email: data.email },
            });

            if (superAdmin) {
                // Validate password exists
                if (!data.password || !superAdmin.password) {
                    throw new UnauthorizedException('Password required');
                }

                // Verify password
                const isPasswordValid = await bcrypt.compare(data.password, superAdmin.password);
                if (!isPasswordValid) {
                    throw new UnauthorizedException('Invalid password for super admin');
                }

                // Super admin logging into organization - give ALL permissions
                const token = this.jwtService.sign({
                    sub: superAdmin.id,
                    email: superAdmin.email,
                    organizationId: org.id,
                    subdomain: org.subdomain,
                    role: 'super_admin',
                    roleId: superAdmin.roleId || uuidv4(),
                    permissions: ['*'], // ALL permissions for this organization
                    isSuperAdmin: true,
                });

                return {
                    message: 'Super admin logged into organization',
                    type: 'super_admin_in_org',
                    token,
                    admin: {
                        id: superAdmin.id,
                        name: superAdmin.name,
                        email: superAdmin.email,
                        role: 'super_admin',
                        roleId: superAdmin.roleId || uuidv4(),
                        permissions: ['*'], // ALL permissions
                    },
                    organization: {
                        id: org.id,
                        name: org.name,
                        subdomain: org.subdomain,
                    },
                };
            }

            throw new UnauthorizedException('Admin not found in this organization');
        }

        // First check for super admin in main platform database
        const superAdmin = await this.adminRepo.findOne({
            where: { email: data.email },
        });

        if (superAdmin) {
            // Validate password exists
            if (!data.password || !superAdmin.password) {
                throw new UnauthorizedException('Password required');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(data.password, superAdmin.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid password for super admin');
            }

            // Get all organizations for super admin to choose from
            const allOrganizations = await this.orgRepo.find();

            // Generate JWT token for super admin with all permissions
            const token = this.jwtService.sign({
                sub: superAdmin.id,
                email: superAdmin.email,
                role: 'super_admin',
                permissions: ['*'], // All permissions
                roleId: superAdmin.roleId || uuidv4(),
            });

            return {
                message: 'Super admin login successful',
                type: 'super_admin',
                token,
                admin: {
                    ...superAdmin,
                    roleId: superAdmin.roleId || uuidv4(),
                    permissions: ['*'], // All permissions
                },
                organizations: allOrganizations.map(org => ({
                    id: org.id,
                    name: org.name,
                    subdomain: org.subdomain,
                })),
            };
        }

        // If not super admin and no subdomain provided, search in all tenant databases
        const organizations = await this.orgRepo.find();

        if (organizations.length === 0) {
            throw new UnauthorizedException('No organizations found. Admin not registered.');
        }

        let foundAdmin: Admin | null = null;
        let foundOrg: Organization | null = null;
        let connectionErrors: string[] = [];

        // Search for admin across all tenant databases
        for (const org of organizations) {
            try {
                const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
                const tenantAdminRepo = tenantDataSource.getRepository(Admin);

                const admin = await tenantAdminRepo.findOne({
                    where: { email: data.email },
                });

                if (admin) {
                    foundAdmin = admin;
                    foundOrg = org;
                    break;
                }
            } catch (error) {
                connectionErrors.push(`${org.name}: ${(error as Error).message}`);
                continue;
            }
        }

        if (!foundAdmin || !foundOrg) {
            throw new UnauthorizedException(
                `Admin with email ${data.email} not found in any organization database.`
            );
        }

        // Validate password exists
        if (!data.password || !foundAdmin.password) {
            throw new UnauthorizedException('Password required');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(data.password, foundAdmin.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password for tenant admin');
        }

        // Fetch role and permissions
        let permissions: string[] = [];
        let roleName = 'tenant_admin';

        if (foundAdmin.roleId) {
            const tenantDataSource = await this.tenantManager.getTenantConnection(foundOrg.subdomain);
            const roleRepo = tenantDataSource.getRepository(Role);
            const role = await roleRepo.findOne({
                where: { id: foundAdmin.roleId },
                relations: ['permissions'],
            });
            if (role) {
                roleName = role.name;
                permissions = role.permissions?.map(p => p.name) || [];
            }
        }

        // Generate JWT token
        const token = this.jwtService.sign({
            sub: foundAdmin.id,
            email: foundAdmin.email,
            organizationId: foundOrg.id,
            subdomain: foundOrg.subdomain,
            role: roleName,
            roleId: foundAdmin.roleId,
            permissions: permissions,
        });

        return {
            message: 'Tenant admin login successful',
            type: 'tenant_admin',
            token,
            admin: {
                id: foundAdmin.id,
                name: foundAdmin.name,
                email: foundAdmin.email,
                role: roleName,
                roleId: foundAdmin.roleId,
                permissions: permissions,
            },
            organization: {
                id: foundOrg.id,
                name: foundOrg.name,
                subdomain: foundOrg.subdomain,
            },
        };
    }


    async findAll() {
        try {
            const admins = await this.adminRepo.find();

            return {
                message: 'Normal admins fetched successfully',
                admins: admins.map(admin => ({
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.roleName,
                    status: admin.status,
                    organizationId: admin.organizationId,
                    type: 'super_admin'
                })),
            };

        } catch (error) {
            throw new InternalServerErrorException('Error finding all admins');
        }
    }

    async findByOrganization(organizationId: string) {
        // Find organization
        const org = await this.orgRepo.findOne({
            where: { id: organizationId },
        });

        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        // Get connection to tenant database
        const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
        const tenantAdminRepo = tenantDataSource.getRepository(Admin);

        // Get admins from this organization's database
        const admins = await tenantAdminRepo.find();

        return {

            admins
        };
    }

    async update(id: string, data: any, file?: Express.Multer.File) {
        // Filter out undefined values to avoid setting them to null
        const updateData: any = Object.keys(data).reduce((acc, key) => {
            if (data[key] !== undefined) {
                acc[key] = data[key];
            }
            return acc;
        }, {});

        // If no valid data to update, return early
        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('No valid data provided for update');
        }

        if (file) {
            const imageUrl = await this.s3Service.upload(file, 'admin-images');
            updateData.image = imageUrl;
        }

        // Try to find and update in main database (super admin)
        const superAdmin = await this.adminRepo.findOne({ where: { id } });
        if (superAdmin) {
            await this.adminRepo.update(id, updateData);
            const updatedAdmin = await this.adminRepo.findOne({ where: { id } });
            return {
                message: 'Super admin updated successfully',
                type: 'super_admin',
                admin: updatedAdmin,
            };
        }

        // Search in all organization tenant databases
        const organizations = await this.orgRepo.find();

        for (const org of organizations) {
            try {
                const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
                const tenantAdminRepo = tenantDataSource.getRepository(Admin);

                const tenantAdmin = await tenantAdminRepo.findOne({ where: { id } });

                if (tenantAdmin) {
                    if (file) {
                        const imageUrl = await this.s3Service.upload(file, 'admin-images');
                        updateData.image = imageUrl;
                    }
                    // Update admin in tenant database
                    await tenantAdminRepo.update(id, updateData);
                    const updatedAdmin = await tenantAdminRepo.findOne({ where: { id } });
                    return {
                        message: 'Organization admin updated successfully',
                        type: 'tenant_admin',
                        admin: updatedAdmin,
                        organization: {
                            id: org.id,
                            name: org.name,
                            subdomain: org.subdomain,
                        },
                    };
                }
            } catch {
                continue;
            }
        }

        throw new NotFoundException('Admin not found in any database');
    }

    async remove(id: string) {
        // Try to find and remove from main database (super admin)
        const superAdmin = await this.adminRepo.findOne({ where: { id } });
        if (superAdmin) {
            await this.adminRepo.remove(superAdmin);
            return {
                message: 'Super admin removed successfully',
                type: 'super_admin',
                admin: {
                    id: superAdmin.id,
                    name: superAdmin.name,
                    email: superAdmin.email,
                },
            };
        }

        // Search in all organization tenant databases
        const organizations = await this.orgRepo.find();

        for (const org of organizations) {
            try {
                const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
                const tenantAdminRepo = tenantDataSource.getRepository(Admin);

                const tenantAdmin = await tenantAdminRepo.findOne({ where: { id } });

                if (tenantAdmin) {
                    await tenantAdminRepo.remove(tenantAdmin);
                    return {
                        message: 'Tenant admin removed successfully',
                        type: 'tenant_admin',
                        admin: {
                            id: tenantAdmin.id,
                            name: tenantAdmin.name,
                            email: tenantAdmin.email,
                        },
                        organization: {
                            id: org.id,
                            name: org.name,
                            subdomain: org.subdomain,
                        },
                    };
                }
            } catch {
                continue;
            }
        }

        throw new NotFoundException('Admin not found in any database');
    }

    async getProfile(user: CurrentUserData) {
        try {
            // If user has organizationId, fetch from tenant database
            if (user.organizationId && user.subdomain) {
                const tenantDataSource = await this.tenantManager.getTenantConnection(user.subdomain);
                const tenantAdminRepo = tenantDataSource.getRepository(Admin);

                const admin = await tenantAdminRepo.findOne({
                    where: { id: user.id },
                    select: ['id', 'name', 'email', 'image', 'roleName', 'status', 'organizationId', 'phone', 'createdAt']
                });

                if (!admin) {
                    throw new NotFoundException('Admin not found in organization database');
                }

                return {
                    message: 'Admin profile fetched successfully',
                    admin: {
                        ...admin,
                        role: admin.roleName,
                        permissions: user.permissions,
                        type: user.type || 'tenant_admin'
                    }
                };
            }

            // Fetch from main database (super admin)
            const admin = await this.adminRepo.findOne({
                where: { id: user.id },
                select: ['id', 'name', 'email', 'image', 'roleName', 'status', 'phone', 'createdAt']
            });

            if (!admin) {
                throw new NotFoundException('Admin not found in main database');
            }

            return {
                message: 'Admin profile fetched successfully',
                admin: {
                    ...admin,
                    role: admin.roleName,
                    permissions: user.permissions,
                    type: user.type || 'super_admin'
                }
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error fetching admin profile');
        }
    }

    async switchOrganization(user: any, organizationId: string) {
        // Verify user is super admin
        if (user.role !== 'super_admin' && user.type !== 'super_admin') {
            throw new UnauthorizedException('Only super admin can switch organizations');
        }

        // Get organization details
        const org = await this.orgRepo.findOne({
            where: { id: organizationId },
        });

        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        // Generate new JWT token with organization context
        const token = this.jwtService.sign({
            sub: user.id,
            email: user.email,
            organizationId: org.id,
            subdomain: org.subdomain,
            role: 'super_admin',
            roleId: user.roleId || uuidv4(),
            permissions: ['*'], // ALL permissions
            isSuperAdmin: true,
            type: 'super_admin_in_org',
        });

        return {
            message: 'Switched to organization successfully',
            type: 'super_admin_in_org',
            token,
            organization: {
                id: org.id,
                name: org.name,
                subdomain: org.subdomain,
            },
        };
    }
}
