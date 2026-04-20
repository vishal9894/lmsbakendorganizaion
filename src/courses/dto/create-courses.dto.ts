import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';
import { CourseType } from '../entities/courses.entity';


export class CreateCourseDto {

  @IsOptional()
  title!: string;

  @IsOptional()
  type?: CourseType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  streamId?: string;

  @IsOptional()
  @IsString()
  courseName?: string;

  @IsOptional()
  @IsString()
  teacherId?: string;

  @IsOptional()
  
  status?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  strikeoutPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  currentPrice?: number;

  @IsOptional()
  @IsString()
  productId?: string;

  @IsOptional()
  @IsString()
  courseGroupUrl?: string;

  @IsOptional()
  @IsString()
  durationDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  upgradeDuration?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  upgradePrice?: number;

  @IsOptional()
  @IsString()
  videoId?: string;
}