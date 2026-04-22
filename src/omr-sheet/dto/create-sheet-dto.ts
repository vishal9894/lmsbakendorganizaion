import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsDateString, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionType, TimeType, ExamMode } from '../entities/create-sheet-entity';

export class CreateSheetDto {
    @IsOptional()
    @IsString()
    examKey?: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    totalQuestions?: number;

    @IsOptional()
    @IsEnum(QuestionType)
    questionType?: QuestionType;

    @IsOptional()
    @IsArray()
    questions?: Array<{
        questionNumber: number;
        correctAnswer: string;
    }>;

    @IsOptional()
    @IsEnum(TimeType)
    timerType?: TimeType;

    @IsOptional()
    @IsString()
    correctMarks?: string;

    @IsOptional()
    @IsString()
    wrongMarks?: string;

    @IsOptional()
    @IsString()
    duration?: string;

    @IsOptional()
    @IsString()
    answerOptions?: string;

    @IsOptional()
    @IsBoolean()
    status?: boolean;

    @IsOptional()
    @IsEnum(ExamMode)
    examMode?: ExamMode;

    @IsOptional()
    @IsString()
    bufferTime?: string;

    @IsOptional()
    @IsDateString()
    examDateTime?: Date;
}
