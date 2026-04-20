import { IsString, IsNumber, IsOptional, Min, IsPort } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  subdomain!: string;

  @IsString()
  @IsOptional()
  db_name!: string;

  @IsString()
  @IsOptional()
  db_url!: string;

 
  @IsOptional()
  status!: string;
}
