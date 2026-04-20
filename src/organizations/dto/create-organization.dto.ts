import { IsString, IsNumber, IsOptional, Min, IsPort } from 'class-validator';

export class CreateOrganizationDto {
 
  name!: string;

 
  subdomain!: string;
  
 
  db_name!: string;
 
  db_url!: string;


  status!: string;

}
