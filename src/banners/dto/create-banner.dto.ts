import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsUrl,
  IsBoolean,
} from 'class-validator';
import { ContentType } from '../entities/banner.entity';

export class CreateBannerDto {
  @IsOptional()
  title!: string;
  @IsOptional()
  @IsEnum(ContentType)
  type!: ContentType;

  @IsOptional()
  @IsString()
  courseName?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
 
  courseUrl?: string;

  
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  image!: string;

  @IsOptional()
  status?: boolean;
}
