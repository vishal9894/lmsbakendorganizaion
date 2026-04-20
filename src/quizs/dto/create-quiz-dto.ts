import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// For initial quiz creation with category counts
class QuestionCategoryDto {
    @IsString()
    category!: string;

    @IsNumber()
    count!: number;
}

// For full question creation
export class CreateQuestionDto {
    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    question?: string;

    @IsOptional()
    @IsString()
    questionImage?: string;

    @IsOptional()
    @IsString()
    option_a?: string;

    @IsOptional()
    @IsString()
    option_b?: string;

    @IsOptional()
    @IsString()
    option_c?: string;

    @IsOptional()
    @IsString()
    option_d?: string;

    @IsOptional()
    @IsString()
    option_e?: string;

    @IsOptional()
    @IsString()
    option_a_image?: string;

    @IsOptional()
    @IsString()
    option_b_image?: string;

    @IsOptional()
    @IsString()
    option_c_image?: string;

    @IsOptional()
    @IsString()
    option_d_image?: string;

    @IsOptional()
    @IsString()
    option_e_image?: string;

    @IsOptional()
    @IsString()
    correct_answer?: string;

    @IsOptional()
    @IsString()
    correctOption?: string;

    @IsOptional()
    
    marks?: number;

    @IsOptional()
    @IsString()
    solution?: string;

    @IsOptional()
    @IsString()
    solutionImage?: string;

    @IsOptional()
   
    questionNumber?: number;

    @IsOptional()
    @IsString()
    quiz_id?: string;
}

export class CreateQuizDto {
    @IsString()
    category!: string;

    @IsString()
    name!: string;

    @IsNumber()
    duration!: number;

    @IsOptional()
    @IsString()
    createdBy?: string;

    @IsOptional()
    @IsString()
    organizationId?: string;

    @IsOptional()
    @IsString()
    questionCategory?: string;

    @IsOptional()
    @IsNumber()
    numberOfQuestions?: number;

    @IsOptional()
    negativeMarking?: number | boolean | string;

    @IsOptional()
    @IsBoolean()
    advancedMode?: boolean;

    @IsOptional()
    @IsBoolean()
    showSolution?: boolean;

    @IsOptional()
    @IsNumber()
    negativeMarks?: number;

    // For initial creation - just categories with counts
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionCategoryDto)
    questionCategories?: QuestionCategoryDto[];

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateQuestionDto)
    questions?: CreateQuestionDto[];
}
