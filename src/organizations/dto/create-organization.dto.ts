import { IsString, IsNumber, IsOptional, Min, IsPort } from 'class-validator';

export class CreateOrganizationDto {
  @IsString()
  name!: string;

  @IsString()
  subdomain!: string;
  
  @IsString()
  db_name!: string;
  @IsString()
  db_url!: string;

  @IsString()
  status!: string;

}
