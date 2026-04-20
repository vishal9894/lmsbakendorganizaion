// topteacher.service.ts

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TopTeachers } from './entities/topteacher.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateTopTeacherDto } from './dto/create-topteacher.dto';
import { UpdateTopTeacherDto } from './dto/update-topteacher.dto';
import { S3Service } from 'src/common/services/s3.service';

@Injectable()
export class TopTeacherService {
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

    return tenantDataSource.getRepository(TopTeachers);
  }

  async create(
    organizationId: string,
    data: CreateTopTeacherDto,
    file?: Express.Multer.File,
  ) {
    const repo = await this.getTenantRepository(organizationId);

    let image = '';

    if (file) {
      image = await this.s3Service.upload(file, 'topteacher');
    }

    const topTeacher = repo.create({
      ...data,
      image,
    });

    await repo.save(topTeacher);

    return {
      message: 'TopTeacher created successfully',
      data: topTeacher,
    };
  }

  async findAll(organizationId: string) {
    const repo = await this.getTenantRepository(organizationId);

    const teachers = await repo.find({
      order: { createdAt: 'DESC' },
    });

    return {
      message: 'TopTeachers retrieved successfully',
      data: teachers,
    };
  }

  async findOne(organizationId: string, id: string) {
    const repo = await this.getTenantRepository(organizationId);

    const teacher = await repo.findOne({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('TopTeacher not found');
    }

    return {
      message: 'TopTeacher retrieved successfully',
      data: teacher,
    };
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateTopTeacherDto,
    file?: Express.Multer.File,
  ) {
    const repo = await this.getTenantRepository(organizationId);

    const teacher = await repo.findOne({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('TopTeacher not found');
    }

    if (file) {
      teacher.image = await this.s3Service.upload(file, 'topteacher');
    }

    Object.assign(teacher, data);

    await repo.save(teacher);

    return {
      message: 'TopTeacher updated successfully',
      data: teacher,
    };
  }

  async remove(organizationId: string, id: string) {
    const repo = await this.getTenantRepository(organizationId);

    const teacher = await repo.findOne({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('TopTeacher not found');
    }

    await repo.remove(teacher);

    return {
      message: 'TopTeacher deleted successfully',
    };
  }
}