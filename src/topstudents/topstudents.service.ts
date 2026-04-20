import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TopStudents } from './entities/top.student.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateTopStudentDto } from './dto/create-topStudent.dto';
import { UpdateTopStudentDto } from './dto/update-topStudent.dto';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class TopstudentsService {
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

        return tenantDataSource.getRepository(TopStudents);
    }

    async create(
        organizationId: string,
        data: CreateTopStudentDto,
        file?: Express.Multer.File,
    ) {
        const repo = await this.getTenantRepository(organizationId);

        let image = '';

        if (file) {
            image = await this.s3Service.upload(file, 'topstudents');
        }

        const topStudent = repo.create({
            ...data,
            image,
        });

        await repo.save(topStudent);

        return {
            message: 'TopStudent created successfully',
            data: topStudent,
        };
    }

    async findAll(organizationId: string) {
        const repo = await this.getTenantRepository(organizationId);

        const students = await repo.find({
            order: { createdAt: 'DESC' },
        });

        return {
            message: 'TopStudents retrieved successfully',
            data: students,
        };
    }

    async findOne(organizationId: string, id: string) {
        const repo = await this.getTenantRepository(organizationId);

        const student = await repo.findOne({
            where: { id },
        });

        if (!student) {
            throw new NotFoundException('TopStudent not found');
        }

        return {
            message: 'TopStudent retrieved successfully',
            data: student,
        };
    }

    async update(
        organizationId: string,
        id: string,
        data: UpdateTopStudentDto,
        file?: Express.Multer.File,
    ) {
        const repo = await this.getTenantRepository(organizationId);

        const student = await repo.findOne({
            where: { id },
        });

        if (!student) {
            throw new NotFoundException('TopStudent not found');
        }

        if (file) {
            student.image = await this.s3Service.upload(file, 'topstudents');
        }

        Object.assign(student, data);

        await repo.save(student);

        return {
            message: 'TopStudent updated successfully',
            data: student,
        };
    }

    async remove(organizationId: string, id: string) {
        const repo = await this.getTenantRepository(organizationId);

        const student = await repo.findOne({
            where: { id },
        });

        if (!student) {
            throw new NotFoundException('TopStudent not found');
        }

        await repo.remove(student);

        return {
            message: 'TopStudent deleted successfully',
        };
    }
}
