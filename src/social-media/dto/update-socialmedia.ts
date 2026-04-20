import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateSocialMediaDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsUrl()
    @IsOptional()
    url?: string;

    @IsString()
    @IsOptional()
    icon?: string;
}
