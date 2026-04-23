import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class LoginAdminDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsString()
  subdomain?: string;
}
