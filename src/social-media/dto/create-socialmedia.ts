import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateSocialMediaDto {
   
    @IsOptional()
    name: string;

   @IsOptional()
    url: string;

    @IsString()
    @IsOptional()
    icon?: string;
}