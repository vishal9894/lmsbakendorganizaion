import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Permission } from './entities/permission.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,

        private tenantManager: TenantManager,
    ) { }

    private async getTenantRepository(organizationId: string) {
        const org = await this.orgRepo.findOne({
            where: { id: organizationId },
        });

        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        const tenantDataSource =
            await this.tenantManager.getTenantConnection(org.subdomain);

        return tenantDataSource.getRepository(Permission);
    }

    async create(organizationId: string, data: CreatePermissionDto) {
        const repo = await this.getTenantRepository(organizationId);

        const permission = repo.create({
            name: data.name,
            description: data.description,
            status: data.status ?? true,
        });

        await repo.save(permission);

        return {
            message: 'Permission created successfully',
            data: permission,
        };
    }

    async findAll(organizationId: string) {
        const repo = await this.getTenantRepository(organizationId);

        const permissions = await repo.find({
            order: { name: 'ASC' },
        });

        return {
            message: 'Permissions retrieved successfully',
            data: permissions,
        };
    }

    async findOne(organizationId: string, id: number) {
        const repo = await this.getTenantRepository(organizationId);

        const permission = await repo.findOne({
            where: { id },
        });

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        return {
            message: 'Permission retrieved successfully',
            data: permission,
        };
    }

    async update(organizationId: string, id: number, data: UpdatePermissionDto) {
        const repo = await this.getTenantRepository(organizationId);

        const permission = await repo.findOne({
            where: { id },
        });

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        Object.assign(permission, data);

        await repo.save(permission);

        return {
            message: 'Permission updated successfully',
            data: permission,
        };
    }

    async remove(organizationId: string, id: number) {
        const repo = await this.getTenantRepository(organizationId);

        const permission = await repo.findOne({
            where: { id },
            relations: ['roles'],
        });

        if (!permission) {
            throw new NotFoundException('Permission not found');
        }

        if (permission.roles && permission.roles.length > 0) {
            throw new NotFoundException('Cannot delete permission assigned to roles');
        }

        await repo.remove(permission);

        return {
            message: 'Permission deleted successfully',
        };
    }
}
