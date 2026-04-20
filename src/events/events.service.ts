import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/create-event.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateEventDto } from './dto/create-event-dto';
import { S3Service } from 'src/common/services/s3.service';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private tenantManager: TenantManager,
        private s3Service: S3Service
    ) { }

    private async getTenantRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(Event);
    }

    async create(subdomain: string, createEventDto: CreateEventDto, file?: Express.Multer.File) {
        const repo = await this.getTenantRepo(subdomain);

        const imageUrl = file ? await this.s3Service.upload(file, "events") : null;

        const event = repo.create({
            ...createEventDto,
            image: imageUrl || undefined,
        });

        await repo.save(event);

        return {
            message: 'Event created successfully',
            event,
        };
    }

    async findAll(subdomain: string) {
        const repo = await this.getTenantRepo(subdomain);
        const events = await repo.find({ order: { createdAt: 'DESC' } });
        return {
            message: 'Events fetched successfully',
            events,
        };
    }

    async findOne(subdomain: string, id: string) {
        const repo = await this.getTenantRepo(subdomain);
        const event = await repo.findOne({ where: { folderId: id } });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        return {
            message: 'Event fetched successfully',
            event,
        };
    }

    async update(subdomain: string, id: string, updateEventDto: Partial<CreateEventDto>) {
        const repo = await this.getTenantRepo(subdomain);
        const event = await repo.findOne({ where: { id } });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        Object.assign(event, updateEventDto);
        await repo.save(event);

        return {
            message: 'Event updated successfully',
            event,
        };
    }

    async remove(subdomain: string, id: string) {
        const repo = await this.getTenantRepo(subdomain);
        const event = await repo.findOne({ where: { id } });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        await repo.remove(event);

        return {
            message: 'Event deleted successfully',
        };
    }
}
