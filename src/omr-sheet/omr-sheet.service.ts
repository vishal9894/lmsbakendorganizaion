import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSheetEntity } from './entities/create-sheet-entity';
import { CreateSheetDto } from './dto/create-sheet-dto';
import { UpdateSheetDto } from './dto/update-sheet-dto';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';

@Injectable()
export class OmrSheetService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private tenantManager: TenantManager,
    ) { }

    private async getTenantRepository(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(CreateSheetEntity);
    }

    async create(subdomain: string, data: CreateSheetDto) {
        const repo = await this.getTenantRepository(subdomain);

        const sheet = repo.create(data);
        await repo.save(sheet);

        return {
            message: 'OMR Sheet created successfully',
            data: sheet,
        };
    }

    async findAll(subdomain: string, examKey?: string) {
        const repo = await this.getTenantRepository(subdomain);

        const where: any = {};
        if (examKey) {
            where.examKey = examKey;
        }

        const sheets = await repo.find({
            where,
            order: { questionNumber: 'ASC', createdAt: 'DESC' },
        });

        return {
            message: 'OMR Sheets retrieved successfully',
            data: sheets,
        };
    }

    async findOne(subdomain: string, id: string) {
        const repo = await this.getTenantRepository(subdomain);

        const sheet = await repo.findOne({ where: { id } });

        if (!sheet) {
            throw new NotFoundException('OMR Sheet not found');
        }

        return {
            message: 'OMR Sheet retrieved successfully',
            data: sheet,
        };
    }

    async update(subdomain: string, id: string, data: UpdateSheetDto) {
        const repo = await this.getTenantRepository(subdomain);

        const sheet = await repo.findOne({ where: { id } });

        if (!sheet) {
            throw new NotFoundException('OMR Sheet not found');
        }

        Object.assign(sheet, data);
        await repo.save(sheet);

        return {
            message: 'OMR Sheet updated successfully',
            data: sheet,
        };
    }

    async remove(subdomain: string, id: string) {
        const repo = await this.getTenantRepository(subdomain);

        const sheet = await repo.findOne({ where: { id } });

        if (!sheet) {
            throw new NotFoundException('OMR Sheet not found');
        }

        await repo.remove(sheet);

        return {
            message: 'OMR Sheet deleted successfully',
        };
    }

    async removeByExamKey(subdomain: string, examKey: string) {
        const repo = await this.getTenantRepository(subdomain);

        const sheets = await repo.find({ where: { examKey } });

        if (sheets.length > 0) {
            await repo.remove(sheets);
        }

        return {
            message: `${sheets.length} OMR Sheet(s) deleted successfully`,
        };
    }
}

