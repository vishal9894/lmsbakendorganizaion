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
  
  description?: string;

  @ValidateIf((o) => o.type === 'test')
  
  duration?: number;

  @ValidateIf((o) => o.type === 'test')
  
  categories?: any[];

  @ValidateIf((o) => o.type === 'test')
  
 
  negativeMarking?: boolean;

  @ValidateIf((o) => o.type === 'test')
  
 
  negativeMarks?: number;

  @ValidateIf((o) => o.type === 'test')
 
  testType?: string;

  @ValidateIf((o) => o.type === 'test')
 
  postedBy?: string;
 
}
