import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTestquestionEntity } from './entities/create-testquestion-entityes';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateTestquestionDto } from './dto/create-testquestion-dto';
import { UpdateTestquestionDto } from './dto/update-testquestion-dto';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class TestquestionService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private tenantManager: TenantManager,
        private s3Service: S3Service,
    ) { }

    private async getTenantRepository(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(CreateTestquestionEntity);
    }

    async create(subdomain: string, contentId: string, data: CreateTestquestionDto, files?: {
        questionImage?: Express.Multer.File,
        option_a_image?: Express.Multer.File,
        option_b_image?: Express.Multer.File,
        option_c_image?: Express.Multer.File,
        option_d_image?: Express.Multer.File,
        option_e_image?: Express.Multer.File,
        solutionImage?: Express.Multer.File,
    }) {
        const repo = await this.getTenantRepository(subdomain);

        const question = repo.create({
            ...data,
            contentId,
            questionImage: files?.questionImage ? await this.s3Service.upload(files.questionImage, 'testquestions') : undefined,
            option_a_image: files?.option_a_image ? await this.s3Service.upload(files.option_a_image, 'testquestions') : undefined,
            option_b_image: files?.option_b_image ? await this.s3Service.upload(files.option_b_image, 'testquestions') : undefined,
            option_c_image: files?.option_c_image ? await this.s3Service.upload(files.option_c_image, 'testquestions') : undefined,
            option_d_image: files?.option_d_image ? await this.s3Service.upload(files.option_d_image, 'testquestions') : undefined,
            option_e_image: files?.option_e_image ? await this.s3Service.upload(files.option_e_image, 'testquestions') : undefined,
            solutionImage: files?.solutionImage ? await this.s3Service.upload(files.solutionImage, 'testquestions') : undefined,
        });

        await repo.save(question);

        return {
            message: 'Test question created successfully',
            data: question,
        };
    }

    async findAll(subdomain: string, contentId?: string) {
        const repo = await this.getTenantRepository(subdomain);

        const where: any = {};
        if (contentId) {
            where.contentId = contentId;
        }

        const questions = await repo.find({
            where,
            order: { questionNumber: 'ASC', createdAt: 'DESC' },
        });

        return {
            message: 'Test questions retrieved successfully',
            data: questions,
        };
    }

    async findOne(subdomain: string, id: string) {
        const repo = await this.getTenantRepository(subdomain);

        const question = await repo.findOne({ where: { id } });

        if (!question) {
            throw new NotFoundException('Test question not found');
        }

        return {
            message: 'Test question retrieved successfully',
            data: question,
        };
    }

    async update(subdomain: string, id: string, data: UpdateTestquestionDto, files?: {
        questionImage?: Express.Multer.File,
        option_a_image?: Express.Multer.File,
        option_b_image?: Express.Multer.File,
        option_c_image?: Express.Multer.File,
        option_d_image?: Express.Multer.File,
        option_e_image?: Express.Multer.File,
        solutionImage?: Express.Multer.File,
    }) {
        const repo = await this.getTenantRepository(subdomain);

        const question = await repo.findOne({ where: { id } });

        if (!question) {
            throw new NotFoundException('Test question not found');
        }

        // Upload new images if provided
        if (files?.questionImage) {
            question.questionImage = await this.s3Service.upload(files.questionImage, 'testquestions');
        }
        if (files?.option_a_image) {
            question.option_a_image = await this.s3Service.upload(files.option_a_image, 'testquestions');
        }
        if (files?.option_b_image) {
            question.option_b_image = await this.s3Service.upload(files.option_b_image, 'testquestions');
        }
        if (files?.option_c_image) {
            question.option_c_image = await this.s3Service.upload(files.option_c_image, 'testquestions');
        }
        if (files?.option_d_image) {
            question.option_d_image = await this.s3Service.upload(files.option_d_image, 'testquestions');
        }
        if (files?.option_e_image) {
            question.option_e_image = await this.s3Service.upload(files.option_e_image, 'testquestions');
        }
        if (files?.solutionImage) {
            question.solutionImage = await this.s3Service.upload(files.solutionImage, 'testquestions');
        }

        Object.assign(question, data);
        await repo.save(question);

        return {
            message: 'Test question updated successfully',
            data: question,
        };
    }

    async remove(subdomain: string, id: string) {
        const repo = await this.getTenantRepository(subdomain);

        const question = await repo.findOne({ where: { id } });

        if (!question) {
            throw new NotFoundException('Test question not found');
        }

        await repo.remove(question);

        return {
            message: 'Test question deleted successfully',
        };
    }

    async removeByContentId(subdomain: string, contentId: string) {
        const repo = await this.getTenantRepository(subdomain);

        const questions = await repo.find({ where: { contentId } });

        if (questions.length > 0) {
            await repo.remove(questions);
        }

        return {
            message: `${questions.length} test question(s) deleted successfully`,
        };
    }

    async bulkCreate(subdomain: string, contentId: string, data: any[]) {
        const repo = await this.getTenantRepository(subdomain);

        const questions = data.map((row, index) => {
            return repo.create({
                contentId,
                question: row.question || row.Question || null,
                option_a: row.option_a || row.optionA || row['Option A'] || row.option_a || null,
                option_b: row.option_b || row.optionB || row['Option B'] || row.option_b || null,
                option_c: row.option_c || row.optionC || row['Option C'] || row.option_c || null,
                option_d: row.option_d || row.optionD || row['Option D'] || row.option_d || null,
                option_e: row.option_e || row.optionE || row['Option E'] || row.option_e || null,
                correctOption: row.correctOption || row.correct_option || row['Correct Option'] || row.answer || row.Answer || null,
                marks: row.marks || row.Marks || row.marks || null,
                solution: row.solution || row.Solution || null,
                questionNumber: row.questionNumber || row.question_number || row['Question Number'] || index + 1,
            });
        });

        const saved = await repo.save(questions);

        return {
            message: `${saved.length} questions uploaded successfully`,
            data: saved,
        };
    }
}
