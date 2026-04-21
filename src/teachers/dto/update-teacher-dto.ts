import { IsOptional, IsString } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  account_id?: string;

  @IsOptional()
  @IsString()
  rating?: string;

  @IsOptional()
  @IsString()
  teacherdetails?: string;

  @IsOptional()
  @IsString()
  revenue_share?: string;

  @IsOptional()
  @IsString()
  assigned_course_id?: string;
}
