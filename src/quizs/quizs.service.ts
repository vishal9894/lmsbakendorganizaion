import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz-entity';
import { Question } from './entities/question-entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { CreateQuizDto, CreateQuestionDto } from './dto/create-quiz-dto';

@Injectable()
export class QuizsService {
    constructor(
        @InjectRepository(Organization)
        private orgRepo: Repository<Organization>,
        private tenantManager: TenantManager,
    ) { }

    private async getTenantRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(Quiz);
    }

    private async getQuestionRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(Question);
    }

    async create(subdomain: string, createQuizDto: CreateQuizDto) {
        const repo = await this.getTenantRepo(subdomain);
        const questionRepo = await this.getQuestionRepo(subdomain);



        const quiz = repo.create({
            ...createQuizDto,
            negativeMarking: String(createQuizDto.negativeMarking ?? ''),
        });
        const savedQuiz = await repo.save(quiz);

        // Create questions if provided
        if (createQuizDto.questions && createQuizDto.questions.length > 0) {
            const questions = createQuizDto.questions.map((q, index) => {
                const question = questionRepo.create({
                    ...q,
                    quizId: savedQuiz.id,
                    questionNumber: q.questionNumber ?? index + 1,
                    correctOption: q.correctOption || q.correct_answer,
                });
                return question;
            });
            await questionRepo.save(questions);

            // Update quiz question count
            savedQuiz.numberOfQuestions = questions.length;
            await repo.save(savedQuiz);
        }
        return {
            message: 'Quiz created successfully',
            quiz: savedQuiz,
        };
    }

    async findAll(subdomain: string) {
        const repo = await this.getTenantRepo(subdomain);
        const quizzes = await repo.find({ order: { createdAt: 'DESC' } });
        return {
            message: 'Quizzes fetched successfully',
            quizzes,
        };
    }

    async findOne(subdomain: string, id: string) {
        const repo = await this.getTenantRepo(subdomain);
        const questionRepo = await this.getQuestionRepo(subdomain);

        const quiz = await repo.findOne({ where: { id } });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        const questions = await questionRepo.find({
            where: { quizId: id },
            order: { questionNumber: 'ASC' },
        });

        return {
            message: 'Quiz fetched successfully',
            quiz: {
                ...quiz,
                questions,
            },
        };
    }

    async update(subdomain: string, id: string, updateQuizDto: Partial<CreateQuizDto>) {
        const repo = await this.getTenantRepo(subdomain);
        const quiz = await repo.findOne({ where: { id } });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        Object.assign(quiz, updateQuizDto);
        await repo.save(quiz);

        return {
            message: 'Quiz updated successfully',
            quiz,
        };
    }

    async remove(subdomain: string, id: string) {
        const repo = await this.getTenantRepo(subdomain);
        const quiz = await repo.findOne({ where: { id } });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        await repo.remove(quiz);

        return {
            message: 'Quiz deleted successfully',
        };
    }

    async addQuestions(subdomain: string, quizId: string, questions: CreateQuestionDto[]) {
        const repo = await this.getTenantRepo(subdomain);
        const questionRepo = await this.getQuestionRepo(subdomain);

        const quiz = await repo.findOne({ where: { id: quizId } });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            throw new Error('Questions array is required and cannot be empty');
        }

        // Filter out null/undefined items from array
        const validQuestions = questions.filter(q => q != null && typeof q === 'object');
        if (validQuestions.length === 0) {
            throw new Error('No valid question objects found in request body');
        }

        // Get current question count for numbering
        const existingQuestions = await questionRepo.find({ where: { quizId } });
        const startingNumber = existingQuestions.length;

        // Create new questions with proper numbering
        const newQuestions = validQuestions.map((q, index) => {
            const questionData = {
                ...q,
                quizId: quizId,
                questionNumber: q.questionNumber ?? (startingNumber + index + 1),
                correctOption: q.correctOption || q.correct_answer || '',
            };
            const question = questionRepo.create(questionData);
            return question;
        });

        const savedQuestions = await questionRepo.save(newQuestions);

        // Update quiz question count
        quiz.numberOfQuestions = startingNumber + savedQuestions.length;
        await repo.save(quiz);

        return {
            message: 'Questions added successfully',
            questions: savedQuestions,
        };
    }

    async getQuestion(subdomain: string, quizId: string) {
        const questionRepo = await this.getQuestionRepo(subdomain);

        const question = await questionRepo.findOne({
            where: { quizId: quizId },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        return {
            message: 'Question fetched successfully',
            question,
        };
    }

    async updateQuestion(subdomain: string, quizId: string, questionId: string, updateQuestionDto: Partial<CreateQuestionDto>) {
        const questionRepo = await this.getQuestionRepo(subdomain);

        const question = await questionRepo.findOne({
            where: { id: questionId, quizId: quizId },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        Object.assign(question, updateQuestionDto);
        const updatedQuestion = await questionRepo.save(question);

        return {
            message: 'Question updated successfully',
            question: updatedQuestion,
        };
    }

    async deleteQuestion(subdomain: string, quizId: string, questionId: string) {
        const questionRepo = await this.getQuestionRepo(subdomain);
        const quizRepo = await this.getTenantRepo(subdomain);

        const question = await questionRepo.findOne({
            where: { id: questionId, quizId: quizId },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        await questionRepo.remove(question);

        // Update quiz question count
        const quiz = await quizRepo.findOne({ where: { id: quizId } });
        if (quiz && quiz.numberOfQuestions) {
            quiz.numberOfQuestions = Math.max(0, quiz.numberOfQuestions - 1);
            await quizRepo.save(quiz);
        }

        return {
            message: 'Question deleted successfully',
        };
    }

    async getQuestionsByQuiz(subdomain: string, quizId: string) {
        const repo = await this.getTenantRepo(subdomain);
        const questionRepo = await this.getQuestionRepo(subdomain);

        const quiz = await repo.findOne({ where: { id: quizId } });

        if (!quiz) {
            throw new NotFoundException('Quiz not found');
        }

        const questions = await questionRepo.find({
            where: { quizId: quizId },
            order: { questionNumber: 'ASC' },
        });

        return {
            message: 'Questions fetched successfully',
            quiz: {
                id: quiz.id,
                name: quiz.name,
            },
            questions,
        };
    }
}
