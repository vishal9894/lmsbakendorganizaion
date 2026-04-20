import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  ValidateIf,
} from 'class-validator';

export class CreateContentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsString()
  access?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  // ================= VIDEO =================
  @ValidateIf((o) => o.type === 'video')
  @IsOptional()
  @IsString()
  videoLink?: string;

  @ValidateIf((o) => o.type === 'video')
  @IsOptional()
  @IsString()
  source?: string;

  @ValidateIf((o) => o.type === 'video')
  @IsOptional()
  @IsString()
  thumbnail?: string;

  // ================= PDF =================
  @ValidateIf((o) => o.type === 'pdf')
  @IsOptional()
  @IsString()
  file?: string;

  @ValidateIf((o) => o.type === 'pdf')
  @IsOptional()
  @IsString()
  title?: string;

  @ValidateIf((o) => o.type === 'pdf')
  @IsOptional()
  @IsString()
  downloadType?: string;

  // ================= TEST =================
  @ValidateIf((o) => o.type === 'test')
  @IsOptional()
  @IsString()
  description?: string;

  @ValidateIf((o) => o.type === 'test')
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ValidateIf((o) => o.type === 'test')
  @IsOptional()
  categories?: any[];

  @ValidateIf((o) => o.type === 'test')
  @IsOptional()
  @IsBoolean()
  negativeMarking?: boolean;

  @ValidateIf((o) => o.type === 'test')
  @IsOptional()
  @IsNumber()
  negativeMarks?: number;

  @ValidateIf((o) => o.type === 'test')
  @IsOptional()
  @IsString()
  testType?: string;

  @ValidateIf((o) => o.type === 'test')
  @IsOptional()
  @IsString()
  postedBy?: string;
}
