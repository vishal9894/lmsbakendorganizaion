import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityTarget, ObjectLiteral } from 'typeorm';
import { Stream } from './entities/stream.entity';
import { SuperStream } from '../superstream/entities/superstream.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { S3Service } from '../common/services/s3.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';

@Injectable()
export class StreamService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    private tenantManager: TenantManager,
    private s3Service: S3Service,
  ) { }

  private async getTenantRepository<T extends ObjectLiteral>(
    organizationId: string,
    entity: EntityTarget<T>,
  ): Promise<Repository<T>> {
    const org = await this.orgRepo.findOne({
      where: { id: organizationId },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    const tenantDataSource =
      await this.tenantManager.getTenantConnection(org.subdomain);

    return tenantDataSource.getRepository(entity);
  }

  async create(
    organizationId: string,
    data: CreateStreamDto,
    file?: Express.Multer.File,
  ) {
    const streamRepo = await this.getTenantRepository(organizationId, Stream);
    const superStreamRepo = await this.getTenantRepository(
      organizationId,
      SuperStream,
    );

    const superStream = await superStreamRepo.findOne({
      where: { id: data.superstreamId },
    });

    if (!superStream) {
      throw new NotFoundException('SuperStream not found');
    }

    let image = '';
    if (file) {
      image = await this.s3Service.upload(file, 'streams');
    }

    const stream = streamRepo.create({
      name: data.name,
      description: data.description,
      image,
      superstream: superStream,
      organizationId,
    });

    await streamRepo.save(stream);

    return {
      message: 'Stream created successfully',
      data: stream,
    };
  }

  async findAll(organizationId: string) {
    const repo = await this.getTenantRepository(organizationId, Stream);

    const streams = await repo.find({
      order: { createdAt: 'DESC' },
      relations: ['superstream'],
    });

    return {
      message: 'Streams retrieved successfully',
      data: streams,
    };
  }

  async findOne(organizationId: string, id: string) {
    const repo = await this.getTenantRepository(organizationId, Stream);

    const stream = await repo.findOne({
      where: { id },
      relations: ['superstream'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    return {
      message: 'Stream retrieved successfully',
      data: stream,
    };
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateStreamDto,
    file?: Express.Multer.File,
  ) {
    const streamRepo = await this.getTenantRepository(organizationId, Stream);
    const superStreamRepo = await this.getTenantRepository(
      organizationId,
      SuperStream,
    );

    const stream = await streamRepo.findOne({
      where: { id },
      relations: ['superstream'],
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    if (data.superstreamId) {
      const superStream = await superStreamRepo.findOne({
        where: { id: data.superstreamId },
      });

      if (!superStream) {
        throw new NotFoundException('SuperStream not found');
      }

      stream.superstream = superStream;
    }

    if (file) {
      stream.image = await this.s3Service.upload(file, 'streams');
    }

    if (data.name) stream.name = data.name;
    if (data.description) stream.description = data.description;

    await streamRepo.save(stream);

    return {
      message: 'Stream updated successfully',
      data: stream,
    };
  }

  async remove(organizationId: string, id: string) {
    const repo = await this.getTenantRepository(organizationId, Stream);

    const stream = await repo.findOne({
      where: { id },
    });

    if (!stream) {
      throw new NotFoundException('Stream not found');
    }

    await repo.remove(stream);

    return {
      message: 'Stream deleted successfully',
    };
  }
}
