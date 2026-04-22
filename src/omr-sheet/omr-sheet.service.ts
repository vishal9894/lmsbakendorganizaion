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

        // Check if exam key already exists
        if (data.examKey) {
            const existing = await repo.findOne({ where: { examKey: data.examKey } });
            if (existing) {
                return {
                    success: false,
                    message: 'Exam key already exists. Cannot create duplicate.',
                };
            }
        }

        // Create single OMR sheet with questions array
        const sheet = repo.create({
            examKey: data.examKey,
            title: data.title,
            description: data.description,
            totalQuestions: data.questions?.length || 0,
            questionType: data.questionType,
            questions: data.questions || [],
            timerType: data.timerType,
            correctMarks: parseFloat(data.correctMarks || '0'),
            wrongMarks: parseFloat(data.wrongMarks || '0'),
            duration: parseInt(data.duration || '0'),
            answerOptions: parseInt(data.answerOptions || '4'),
            status: data.status,
            examMode: data.examMode,
            bufferTime: parseInt(data.bufferTime || '0'),
            examDateTime: data.examDateTime,
        });
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
            order: { createdAt: 'DESC' },
        });

        return {
            message: 'OMR Sheets retrieved successfully',
            data: sheets,
        };
    }

    async getAllExamKeys(subdomain: string) {
        const repo = await this.getTenantRepository(subdomain);

        const sheets = await repo.find({
            select: ['examKey', 'title', 'createdAt'],
            order: { createdAt: 'DESC' },
        });

        // Get unique exam keys with their info
        const uniqueKeys: Array<{ examKey: string; title: string; createdAt: Date }> = [];
        sheets.forEach((sheet) => {
            if (!uniqueKeys.find(item => item.examKey === sheet.examKey)) {
                uniqueKeys.push({
                    examKey: sheet.examKey,
                    title: sheet.title,
                    createdAt: sheet.createdAt,
                });
            }
        });

        return {
            message: 'All exam keys retrieved successfully',
            count: uniqueKeys.length,
            data: uniqueKeys,
        };
    }

    async verifyExamKey(subdomain: string, examKey: string) {
        const repo = await this.getTenantRepository(subdomain);

        const existing = await repo.findOne({ where: { examKey } });

        if (existing) {
            return {
                exists: true,
                message: 'Exam key already exists',
            };
        }

        return {
            exists: false,
            message: 'Exam key is available',
        };
    }

    async findByExamKey(subdomain: string, examKey: string) {
        const repo = await this.getTenantRepository(subdomain);

        const sheets = await repo.find({
            where: { examKey },
            order: { createdAt: 'DESC' },
        });

        if (!sheets || sheets.length === 0) {
            throw new NotFoundException('No OMR sheets found for this exam key');
        }

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

