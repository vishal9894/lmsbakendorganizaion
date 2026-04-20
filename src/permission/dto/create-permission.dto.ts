import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  permissionGroup?: string;

  @IsString()
  @IsOptional()
  guardName?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
