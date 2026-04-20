import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantManager } from '../database/tenant-manager.service';
import { SocialMediaEntity } from './entities/create-socialmedia-entityes';
import { CreateSocialMediaDto } from './dto/create-socialmedia';
import { UpdateSocialMediaDto } from './dto/update-socialmedia';
import { S3Service } from 'src/common/services/s3.service';

@Injectable()
export class SocialMediaService {
    constructor(private tenantManager: TenantManager,
        private readonly s3service: S3Service,
    ) { }

    private async getRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(SocialMediaEntity);
    }

    async create(subdomain: string, createDto: CreateSocialMediaDto, file?: Express.Multer.File) {
        const repo = await this.getRepo(subdomain);

        let imageUrl: string | undefined;
        if (file) {
            imageUrl = await this.s3service.upload(file, 'social-media');
        }

        const socialMedia = repo.create({
            ...createDto,
            icon: imageUrl || createDto.icon,
        });
        await repo.save(socialMedia);
        return {
            message: 'Social media created successfully',
            socialMedia,
        };
    }

    async findAll(subdomain: string) {
        const repo = await this.getRepo(subdomain);
        const socialMediaList = await repo.find({ order: { createdAt: 'DESC' } });
        return {
            message: 'Social media fetched successfully',
            data:socialMediaList,
        };
    }

    async findOne(subdomain: string, id: string) {
        const repo = await this.getRepo(subdomain);
        const socialMedia = await repo.findOne({ where: { id } });
        if (!socialMedia) {
            throw new NotFoundException('Social media not found');
        }
        return {
            message: 'Social media fetched successfully',
            socialMedia,
        };
    }

    async update(subdomain: string, id: string, updateDto: UpdateSocialMediaDto, file?: Express.Multer.File) {
        const repo = await this.getRepo(subdomain);
        const socialMedia = await repo.findOne({ where: { id } });
        if (!socialMedia) {
            throw new NotFoundException('Social media not found');
        }
        
        let imageUrl: string | undefined;
        if (file) {
            imageUrl = await this.s3service.upload(file, 'social-media');
            updateDto.icon = imageUrl;
        }
        
        Object.assign(socialMedia, updateDto);
        await repo.save(socialMedia);
        return {
            message: 'Social media updated successfully',
            socialMedia,
        };
    }

    async remove(subdomain: string, id: string) {
        const repo = await this.getRepo(subdomain);
        const socialMedia = await repo.findOne({ where: { id } });
        if (!socialMedia) {
            throw new NotFoundException('Social media not found');
        }
        await repo.remove(socialMedia);
        return {
            message: 'Social media deleted successfully',
        };
    }
}
