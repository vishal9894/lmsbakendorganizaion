import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileContent } from './entities/file-content-entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateContentDto } from './dto/create-file-content-dto';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class FileContentsService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private tenantManager: TenantManager,
        private s3Service: S3Service
    ) { }

    private async getTenantRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(FileContent);
    }

    async create(subdomain: string, createContentDto: CreateContentDto, pdfFile?: Express.Multer.File, thumbnailFile?: Express.Multer.File) {
        const repo = await this.getTenantRepo(subdomain);

        let pdfUrl: string | undefined;
        let thumbnailUrl: string | undefined;

        if (pdfFile) {
            pdfUrl = await this.s3Service.upload(pdfFile, 'pdfs');
        }

        if (thumbnailFile) {
            thumbnailUrl = await this.s3Service.upload(thumbnailFile, 'thumbnails');
        }

        const content = repo.create({
            ...createContentDto,
            file: pdfUrl,
            thumbnail: thumbnailUrl,
        });

        await repo.save(content);

        return {
            message: 'Content created successfully',
            content,
        };
    }

    async findAll(subdomain: string) {
        const repo = await this.getTenantRepo(subdomain);
        const contents = await repo.find({ order: { name: 'ASC' } });
        return {
            message: 'Contents fetched successfully',
            contents,
        };
    }

    async findOne(subdomain: string, id: string) {
        const repo = await this.getTenantRepo(subdomain);
        const content = await repo.findOne({ where: { id } });

        if (!content) {
            throw new NotFoundException('Content not found');
        }

        return {
            message: 'Content fetched successfully',
            content,
        };
    }

    async update(subdomain: string, id: string, updateContentDto: Partial<CreateContentDto>) {
        const repo = await this.getTenantRepo(subdomain);
        const content = await repo.findOne({ where: { id } });

        if (!content) {
            throw new NotFoundException('Content not found');
        }

        Object.assign(content, updateContentDto);
        await repo.save(content);

        return {
            message: 'Content updated successfully',
            content,
        };
    }

    async remove(subdomain: string, id: string) {
        const repo = await this.getTenantRepo(subdomain);
        const content = await repo.findOne({ where: { id } });

        if (!content) {
            throw new NotFoundException('Content not found');
        }

        await repo.remove(content);

        return {
            message: 'Content deleted successfully',
        };
    }
}
