import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private tenantManager: TenantManager,
        private jwtService: JwtService,
    ) { }

    async createUser(data: {
        name: string;
        email: string;
        password: string;
        subdomain: string;
        state?: string;
        city?: string;
        phone_number?: string;
    }) {
        // Must provide subdomain - users belong to organizations
        if (!data.subdomain) {
            throw new BadRequestException('Organization subdomain is required');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Find organization by subdomain
        const org = await this.orgRepo.findOne({
            where: { subdomain: data.subdomain },
        });

        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        // Create in tenant database
        const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
        const tenantUserRepo = tenantDataSource.getRepository(User);

        const existingUser = await tenantUserRepo.findOne({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new BadRequestException('Email already registered in this organization');
        }

        const user = tenantUserRepo.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            organizationId: org.id,
            state: data.state,
            city: data.city,
            phone_number: data.phone_number,
            joinDate: new Date(),
        });

        await tenantUserRepo.save(user);

        return {
            message: 'User created successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                organizationId: org.id,
            },
            organization: {
                id: org.id,
                name: org.name,
                subdomain: org.subdomain,
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
            const tenantUserRepo = tenantDataSource.getRepository(User);

            const user = await tenantUserRepo.findOne({
                where: { email: data.email },
                select: ['id', 'name', 'email', 'password', 'organizationId', 'state', 'city', 'phone_number', 'image'],
            });

            if (!user) {
                throw new UnauthorizedException('User not found in this organization');
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(data.password, user.password);
            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid password');
            }

            // Generate JWT token
            const token = this.jwtService.sign({
                sub: user.id,
                email: user.email,
                organizationId: org.id,
                subdomain: org.subdomain,
                role: 'user',
            });

            return {
                message: 'Login successful',
                type: 'user',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    state: user.state,
                    city: user.city,
                    phone_number: user.phone_number,
                    image: user.image,
                },
                organization: {
                    id: org.id,
                    name: org.name,
                    subdomain: org.subdomain,
                },
            };
        }

        // No subdomain provided - require it
        throw new UnauthorizedException('Organization subdomain is required for login');
    }

    async getAllUsers() {
        const organizations = await this.orgRepo.find();
        const allUsers: User[] = [];
        for (const org of organizations) {
            const tenantDataSource = await this.tenantManager.getTenantConnection(org.subdomain);
            const tenantUserRepo = tenantDataSource.getRepository(User);
            const users = await tenantUserRepo.find();
            allUsers.push(...users);
        }
        return allUsers;
    }

    async getProfile(user: { id: string; email: string; name: string; subdomain: string }) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(user.subdomain);
        const tenantUserRepo = tenantDataSource.getRepository(User);

        const fullUser = await tenantUserRepo.findOne({
            where: { id: user.id },
        });

        if (!fullUser) {
            throw new NotFoundException('User not found');
        }

        return {
            message: 'Profile fetched successfully',
            user: {
                id: fullUser.id,
                name: fullUser.name,
                email: fullUser.email,
                state: fullUser.state,
                city: fullUser.city,
                phone_number: fullUser.phone_number,
                image: fullUser.image,
                joinDate: fullUser.joinDate,
            },
        };
    }
}
