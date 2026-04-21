import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateTeacherDto {
  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  
  image!: string;

  @IsOptional()
  @IsString()
  account_id!: string;

  @IsOptional()
  @IsString()
  rating!: string;

  @IsOptional()
  @IsString()
  teacherdetails!: string;
  @IsOptional()
  @IsString()
  revenue_share!: string;
}