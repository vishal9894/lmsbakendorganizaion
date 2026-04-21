import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Teacher } from './entities/teacher.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateTeacherDto } from './dto/create-teacher-dto';
import { S3Service } from '../common/services/s3.service';
import { UpdateTeacherDto } from './dto/update-teacher-dto';

@Injectable()
export class TeachersService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,

        private tenantManager: TenantManager,
        private s3Service: S3Service,
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

        return tenantDataSource.getRepository(Teacher);
    }

    async create(
        organizationId: string,
        data: CreateTeacherDto,
        file?: Express.Multer.File,
    ) {
        const repo = await this.getTenantRepository(organizationId);

        let image = '';

        if (file) {
            image = await this.s3Service.upload(file, 'teachers');
        }

        const teacher = repo.create({
            ...data,
            image,
            organizationId,
        });

        await repo.save(teacher);

        return {
            message: 'Teacher created successfully',
            data: teacher,
        };
    }

    async findAll(organizationId: string) {
        const repo = await this.getTenantRepository(organizationId);

        const teachers = await repo.find({
            order: { createdAt: 'DESC' },
        });

        return {
            message: 'Teachers retrieved successfully',
            data: teachers,
        };
    }

    async findOne(organizationId: string, id: string) {
        const repo = await this.getTenantRepository(organizationId);

        const teacher = await repo.findOne({
            where: { id },
        });

        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        return {
            message: 'Teacher retrieved successfully',
            data: teacher,
        };
    }

    async update(
        organizationId: string,
        id: string,
        data: UpdateTeacherDto,
        file?: Express.Multer.File,
    ) {
        const repo = await this.getTenantRepository(organizationId);

        const teacher = await repo.findOne({
            where: { id },
        });

        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        if (file) {
            teacher.image = await this.s3Service.upload(file, 'teachers');
        }

        Object.assign(teacher, data);

        await repo.save(teacher);

        return {
            message: 'Teacher updated successfully',
            data: teacher,
        };
    }

    async remove(organizationId: string, id: string) {
        const repo = await this.getTenantRepository(organizationId);

        const teacher = await repo.findOne({
            where: { id },
        });

        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        await repo.remove(teacher);

        return {
            message: 'Teacher deleted successfully',
        };
    }
}
