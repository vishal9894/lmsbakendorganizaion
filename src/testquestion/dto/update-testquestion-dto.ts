import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class UpdateTestquestionDto {
    @IsOptional()
    @IsUUID()
    contentId?: string;

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
    correctOption?: string;

    @IsOptional()
    @IsNumber()
    marks?: number;

    @IsOptional()
    @IsString()
    solution?: string;

    @IsOptional()
    @IsString()
    solutionImage?: string;

    @IsOptional()
    @IsNumber()
    questionNumber?: number;
}
