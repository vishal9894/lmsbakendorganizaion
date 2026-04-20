import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Folder } from './entities/folder.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateFolderDto } from './dto/create-folder-dto';
import { UpdateFolderDto } from './dto/update-folder-dto';
import { S3Service } from 'src/common/services/s3.service';
import { Event } from 'src/events/entities/create-event.entity';
import { FileContent } from 'src/file-contents/entities/file-content-entity';

@Injectable()
export class FoldersService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private tenantManager: TenantManager,
        private s3Service: S3Service,
    ) { }

    private async getTenantRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(Folder);
    }

    private async getEventRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(Event);
    }
    private async getfileRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(FileContent);
    }

    async create(subdomain: string, createFolderDto: CreateFolderDto, ) {
        const repo = await this.getTenantRepo(subdomain);

        // const imageUrl = await this.s3Service.upload(file, 'folders');

        const folder = repo.create({
            name: createFolderDto.name,
            
            parentId: createFolderDto.parentId || undefined,
        });

        await repo.save(folder);

        return {
            message: 'Folder created successfully',
            folder,
        };
    }

    async findAll(subdomain: string) {
        const repo = await this.getTenantRepo(subdomain);
        const folders = await repo.find({ order: { createdAt: 'DESC' } });
        return {
            message: 'Folders fetched successfully',
            folders,
        };
    }

    async findOne(subdomain: string, id: string) {
        try {
            const repo = await this.getTenantRepo(subdomain);
            const eventRepo = await this.getEventRepo(subdomain);
            const fileRepo = await this.getfileRepo(subdomain);

            const folder = await repo.findOne({ where: { parentId: id } });

            const events = await eventRepo.find({ where: { folderId: id } });
            const files = await fileRepo.find({ where: { parentId: id } });


            return {
                message: 'Folder fetched successfully',
                folder: {
                    ...folder,
                    events,
                    files,
                },
            };

        } catch (error) {
            throw error;
        }
    }

    async update(subdomain: string, id: string, updateFolderDto: UpdateFolderDto) {
        const repo = await this.getTenantRepo(subdomain);
        const folder = await repo.findOne({ where: { id } });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }

        // If changing parentId, verify new parent exists and not creating cycle
        if (updateFolderDto.parentId !== undefined && updateFolderDto.parentId !== null) {
            if (updateFolderDto.parentId === id) {
                throw new BadRequestException('Folder cannot be its own parent');
            }

            const parent = await repo.findOne({ where: { id: updateFolderDto.parentId as string } });
            if (!parent) {
                throw new NotFoundException('Parent folder not found');
            }
        }

        Object.assign(folder, updateFolderDto);
        await repo.save(folder);

        return {
            message: 'Folder updated successfully',
            folder,
        };
    }

    async remove(subdomain: string, id: string) {
        const repo = await this.getTenantRepo(subdomain);
        const folder = await repo.findOne({ where: { id } });

        if (!folder) {
            throw new NotFoundException('Folder not found');
        }



        await repo.remove(folder);

        return {
            message: 'Folder deleted successfully',
        };
    }
}
