import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { Role } from './entities/role.entity';
import { Permission } from '../permission/entities/permission.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,

        private tenantManager: TenantManager,
    ) { }

    private async getTenantRepositories(organizationId: string) {
        const org = await this.orgRepo.findOne({
            where: { id: organizationId },
        });

        if (!org) {
            throw new NotFoundException('Organization not found');
        }

        const tenantDataSource =
            await this.tenantManager.getTenantConnection(org.subdomain);

        return {
            roleRepo: tenantDataSource.getRepository(Role),
            permissionRepo: tenantDataSource.getRepository(Permission),
        };
    }

    async create(organizationId: string, data: CreateRoleDto) {
        const { roleRepo, permissionRepo } = await this.getTenantRepositories(organizationId);

        const role = roleRepo.create({
            name: data.name,
            description: data.description,
        });

        if (data.permissionIds && data.permissionIds.length > 0) {
            const permissions = await permissionRepo.findBy({
                id: In(data.permissionIds),
            });
            role.permissions = permissions;
        }

        await roleRepo.save(role);

        return {
            message: 'Role created successfully',
            data: role,
        };
    }

    async findAll(organizationId: string) {
        const { roleRepo } = await this.getTenantRepositories(organizationId);

        const roles = await roleRepo.find({
            relations: ['permissions'],
            order: { name: 'ASC' },
        });

        return {
            message: 'Roles retrieved successfully',
            data: roles,
        };
    }

    async findOne(organizationId: string, id: number) {
        const { roleRepo } = await this.getTenantRepositories(organizationId);

        const role = await roleRepo.findOne({
            where: { id },
            relations: ['permissions'],
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        return {
            message: 'Role retrieved successfully',
            data: role,
        };
    }

    async update(organizationId: string, id: number, data: UpdateRoleDto) {
        const { roleRepo, permissionRepo } = await this.getTenantRepositories(organizationId);

        const role = await roleRepo.findOne({
            where: { id },
            relations: ['permissions'],
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        if (data.name) role.name = data.name;
        if (data.description) role.description = data.description;

        if (data.permissionIds !== undefined) {
            if (data.permissionIds.length > 0) {
                const permissions = await permissionRepo.findBy({
                    id: In(data.permissionIds),
                });
                role.permissions = permissions;
            } else {
                role.permissions = [];
            }
        }

        await roleRepo.save(role);

        return {
            message: 'Role updated successfully',
            data: role,
        };
    }

    async remove(organizationId: string, id: number) {
        const { roleRepo } = await this.getTenantRepositories(organizationId);

        const role = await roleRepo.findOne({
            where: { id },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        await roleRepo.remove(role);

        return {
            message: 'Role deleted successfully',
        };
    }
}
