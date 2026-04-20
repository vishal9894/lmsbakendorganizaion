import { IsEmail, IsString, MinLength, IsOptional, isBoolean } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
 
  status?: boolean;
}


