import { IsString, IsOptional, IsNumber, IsEnum, IsArray, IsDateString, IsBoolean } from 'class-validator';
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
    questionNumber?: number;

    @IsOptional()
    @IsEnum(QuestionType)
    questionType?: QuestionType;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    correctAnswers?: string[];

    @IsOptional()
    @IsEnum(TimeType)
    timeType?: TimeType;

    @IsOptional()
    @IsNumber()
    correctMarks?: number;

    @IsOptional()
    @IsNumber()
    wrongMarks?: number;

    @IsOptional()
    @IsNumber()
    duration?: number;

    @IsOptional()
    @IsBoolean()
    status?: boolean;

    @IsOptional()
    @IsEnum(ExamMode)
    examMode?: ExamMode;

    @IsOptional()
    @IsNumber()
    bufferTime?: number;

    @IsOptional()
    @IsDateString()
    startTime?: Date;

    @IsOptional()
    @IsDateString()
    endTime?: Date;

    @IsOptional()
    @IsString()
    optionA?: string;

    @IsOptional()
    @IsString()
    optionB?: string;

    @IsOptional()
    @IsString()
    optionC?: string;

    @IsOptional()
    @IsString()
    optionD?: string;

    @IsOptional()
    @IsString()
    optionE?: string;
}
