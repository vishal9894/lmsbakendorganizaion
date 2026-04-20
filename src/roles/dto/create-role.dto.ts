// dto/create-role.dto.ts
import { IsString, IsArray, IsInt, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsOptional()
  @IsInt({ each: true, message: 'each value in permissionIds must be a number' })
  permissionIds?: number[];
}