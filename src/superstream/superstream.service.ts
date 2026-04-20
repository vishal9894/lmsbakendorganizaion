import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SuperStream } from './entities/superstream.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateSuperStreamDto } from './dto/create-superstream.dto';
import { UpdateSuperStreamDto } from './dto/update-superstream.dto';

@Injectable()
export class SuperStreamService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    private tenantManager: TenantManager,
  ) {}

  private async getTenantRepository(organizationId: string) {
    const org = await this.orgRepo.findOne({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const tenantDataSource =
      await this.tenantManager.getTenantConnection(org.subdomain);

    return tenantDataSource.getRepository(SuperStream);
  }

  async create(organizationId: string, data: CreateSuperStreamDto) {
    const repo = await this.getTenantRepository(organizationId);

    const superStream = repo.create({
      ...data,
      organizationId,
    });

    await repo.save(superStream);

    return {
      message: 'SuperStream created successfully',
      data: superStream,
    };
  }

  async findAll(organizationId: string) {
    const repo = await this.getTenantRepository(organizationId);

    const superStreams = await repo.find({
      order: { createdAt: 'DESC' },
      relations: ['streams'],
    });

    return {
      message: 'SuperStreams retrieved successfully',
      data: superStreams,
    };
  }

  async findOne(organizationId: string, id: string) {
    const repo = await this.getTenantRepository(organizationId);

    const superStream = await repo.findOne({
      where: { id },
      relations: ['streams'],
    });

    if (!superStream) {
      throw new NotFoundException('SuperStream not found');
    }

    return {
      message: 'SuperStream retrieved successfully',
      data: superStream,
    };
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateSuperStreamDto,
  ) {
    const repo = await this.getTenantRepository(organizationId);

    const superStream = await repo.findOne({
      where: { id },
    });

    if (!superStream) {
      throw new NotFoundException('SuperStream not found');
    }

    Object.assign(superStream, data);

    await repo.save(superStream);

    return {
      message: 'SuperStream updated successfully',
      data: superStream,
    };
  }

  async remove(organizationId: string, id: string) {
    const repo = await this.getTenantRepository(organizationId);

    const superStream = await repo.findOne({
      where: { id },
    });

    if (!superStream) {
      throw new NotFoundException('SuperStream not found');
    }

    await repo.remove(superStream);

    return {
      message: 'SuperStream deleted successfully',
    };
  }
}
