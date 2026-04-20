import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateTopStudentDto {
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsUrl()
  video_url?: string;

  @IsNotEmpty()
  streamid!: string;
}