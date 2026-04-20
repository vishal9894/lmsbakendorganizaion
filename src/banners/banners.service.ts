import {
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Banner, ContentType } from './entities/banner.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class BannersService {
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

        return tenantDataSource.getRepository(Banner);
    }

    async create(
        organizationId: string,
        data: CreateBannerDto,
        file?: Express.Multer.File,
    ) {
        const repo = await this.getTenantRepository(organizationId);

        let image = '';

        if (file) {
            image = await this.s3Service.upload(file, 'banners');
        }

        const banner = repo.create({
            ...data,
            image,
        });

        await repo.save(banner);

        return {
            message: 'Banner created successfully',
            data: banner,
        };
    }

    async findAll(organizationId: string) {
        const repo = await this.getTenantRepository(organizationId);

        const banners = await repo.find({
            order: { createdAt: 'DESC' },
        });

        return {
            message: 'Banners retrieved successfully',
            data: banners,
        };
    }

    async findByType(organizationId: string, type: string) {
        const repo = await this.getTenantRepository(organizationId);

        const banners = await repo.find({
            where: { type: type as ContentType },
            order: { createdAt: 'DESC' },
        });

        return {
            message: 'Banners retrieved successfully',
            data: banners,
        };
    }

    async findOne(organizationId: string, id: string) {
        const repo = await this.getTenantRepository(organizationId);

        const banner = await repo.findOne({
            where: { id },
        });

        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        return {
            message: 'Banner retrieved successfully',
            data: banner,
        };
    }

    async update(
        organizationId: string,
        id: string,
        data: UpdateBannerDto,
        file?: Express.Multer.File,
    ) {
        const repo = await this.getTenantRepository(organizationId);

        const banner = await repo.findOne({
            where: { id },
        });

        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        if (file) {
            banner.image = await this.s3Service.upload(file, 'banners');
        }

        Object.assign(banner, data);

        await repo.save(banner);

        return {
            message: 'Banner updated successfully',
            data: banner,
        };
    }

    async remove(organizationId: string, id: string) {
        const repo = await this.getTenantRepository(organizationId);

        const banner = await repo.findOne({
            where: { id },
        });

        if (!banner) {
            throw new NotFoundException('Banner not found');
        }

        await repo.remove(banner);

        return {
            message: 'Banner deleted successfully',
        };
    }
}
