import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        @InjectRepository(Admin)
        private adminRepo: Repository<Admin>,
        private tenantManager: TenantManager,
        private jwtService: JwtService,
    ) { }

    async createAdmin(data: {
        name: string;
        email: string;
        password: string;
        organizationId?: string;
    }) {
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

            // Create admin in tenant database
            const admin = tenantAdminRepo.create({
                name: data.name,
                email: data.email,
                password: hashedPassword,
                organizationId: data.organizationId,
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

        const admin = this.adminRepo.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
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

            if (!admin) {
                throw new UnauthorizedException('Admin not found in this organization');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(data.password, admin.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid password');
            }

            // Generate JWT token
            const token = this.jwtService.sign({
                sub: admin.id,
                email: admin.email,
                organizationId: org.id,
                subdomain: org.subdomain,
                role: 'tenant_admin',
            });

            return {
                message: 'Login successful',
                type: 'tenant_admin',
                token,
                admin: {
                    id: admin.id,
                    name: admin.name,
                    email: admin.email,
                    role: 'tenant_admin',
                },
                organization: {
                    id: org.id,
                    name: org.name,
                    subdomain: org.subdomain,
                },
            };
        }

        // First check for super admin in main platform database
        const superAdmin = await this.adminRepo.findOne({
            where: { email: data.email },
        });

        if (superAdmin) {
            // Verify password
            const isPasswordValid = await bcrypt.compare(data.password, superAdmin.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid password for super admin');
            }

            // Generate JWT token for super admin
            const token = this.jwtService.sign({
                sub: superAdmin.id,
                email: superAdmin.email,
                role: 'super_admin',
            });

            return {
                message: 'Super admin login successful',
                type: 'super_admin',
                token,
                admin: superAdmin,
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

        // Verify password
        const isPasswordValid = await bcrypt.compare(data.password, foundAdmin.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid password for tenant admin');
        }

        // Generate JWT token
        const token = this.jwtService.sign({
            sub: foundAdmin.id,
            email: foundAdmin.email,
            organizationId: foundOrg.id,
            subdomain: foundOrg.subdomain,
            role: 'tenant_admin',
        });

        return {
            message: 'Tenant admin login successful',
            type: 'tenant_admin',
            token,
            admin: {
                id: foundAdmin.id,
                name: foundAdmin.name,
                email: foundAdmin.email,
                role: 'tenant_admin',
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
            return admins;

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

            admins: admins.map(admin => ({
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.roleName,
                status: admin.status,
                organizationId: admin.organizationId,
            })),
        };
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
}
