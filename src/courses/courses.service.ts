import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Course } from './entities/courses.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateCourseDto } from './dto/create-courses.dto';
import { UpdateCourseDto } from './dto/update-courses.dto';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class CoursesService {
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

        return tenantDataSource.getRepository(Course);
    }

    async create(
        organizationId: string,
        data: CreateCourseDto,
        file?: Express.Multer.File,
    ) {
        const repo = await this.getTenantRepository(organizationId);

        let courseImage = '';

        if (file) {
            courseImage = await this.s3Service.upload(file, 'courses');
        }

        const course = repo.create({
            ...data,
            courseImage,
        });

        await repo.save(course);

        return {
            message: 'Course created successfully',
            data: course,
        };
    }

    async findAll(organizationId: string) {
        const repo = await this.getTenantRepository(organizationId);

        const courses = await repo.find({
            order: { createdAt: 'DESC' },
        });

        return {
            message: 'Courses retrieved successfully',
            data: courses,
        };
    }

    async findOne(organizationId: string, id: string) {
        const repo = await this.getTenantRepository(organizationId);

        const course = await repo.findOne({
            where: { id },
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        return {
            message: 'Course retrieved successfully',
            data: course,
        };
    }

    async update(
        organizationId: string,
        id: string,
        data: UpdateCourseDto,
        file?: Express.Multer.File,
    ) {
        const repo = await this.getTenantRepository(organizationId);

        const course = await repo.findOne({
            where: { id },
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        if (file) {
            course.courseImage = await this.s3Service.upload(file, 'courses');
        }

        Object.assign(course, data);

        await repo.save(course);

        return {
            message: 'Course updated successfully',
            data: course,
        };
    }

    async findByType (organizationId: string, type: string) {
        const repo = await this.getTenantRepository(organizationId);

        const courses = await repo.find({
            where: { type: type as any },
            
        });

        return {
            message: 'Courses retrieved successfully',
            data: courses,
        };
    }

    async remove(organizationId: string, id: string) {
        const repo = await this.getTenantRepository(organizationId);

        const course = await repo.findOne({
            where: { id },
        });

        if (!course) {
            throw new NotFoundException('Course not found');
        }

        await repo.remove(course);

        return {
            message: 'Course deleted successfully',
        };
    }
}
