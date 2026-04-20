import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { QuizsService } from './quizs.service';
import { CreateQuizDto, CreateQuestionDto } from './dto/create-quiz-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface CurrentUserData {
    id: string;
    email: string;
    subdomain?: string;
    organizationId?: string;
}

@Controller('quizs')
@UseGuards(TenantAuthGuard)
export class QuizsController {
    constructor(private readonly quizsService: QuizsService) { }

    @Post()
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() createQuizDto: CreateQuizDto,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.create(user.subdomain, createQuizDto);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.findAll(user.subdomain);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.findOne(user.subdomain, id);
    }

    @Patch(':id')
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() updateQuizDto: Partial<CreateQuizDto>,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.update(user.subdomain, id, updateQuizDto);
    }

    @Delete(':id')                      
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.remove(user.subdomain, id);
    }

    @Post(':id/questions')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: false }))
    addQuestions(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() dto: CreateQuestionDto,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }



        if (!dto || Object.keys(dto).length === 0) {
            throw new Error('Request body is empty or invalid');
        }

        return this.quizsService.addQuestions(user.subdomain, id, [dto]);
    }

    @Post(':id/question')
    addSingleQuestion(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() question: CreateQuestionDto,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        if (!question) {
            throw new Error('Question data is required');
        }
        console.log('Adding single question:', question);
        return this.quizsService.addQuestions(user.subdomain, id, [question]);
    }

    @Get(':id/questions')
    getQuestionsByQuiz(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.getQuestionsByQuiz(user.subdomain, id);
    }

    @Get(':quizId/questions')
    getQuestion(
        @CurrentUser() user: CurrentUserData,
        @Param('quizId') quizId: string,
        
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.getQuestion(user.subdomain, quizId);
    }

    @Patch(':quizId/questions/:questionId')
    updateQuestion(
        @CurrentUser() user: CurrentUserData,
        @Param('quizId') quizId: string,
        @Param('questionId') questionId: string,
        @Body() updateQuestionDto: Partial<CreateQuestionDto>,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.updateQuestion(user.subdomain, quizId, questionId, updateQuestionDto);
    }

    @Delete(':quizId/questions/:questionId')
    deleteQuestion(
        @CurrentUser() user: CurrentUserData,
        @Param('quizId') quizId: string,
        @Param('questionId') questionId: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.quizsService.deleteQuestion(user.subdomain, quizId, questionId);
    }
}


