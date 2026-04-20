import { IsOptional, IsString } from "class-validator";

export class UpdateUserDto {

  @IsOptional()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  email!: string;

  @IsOptional()
  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  image!: string;

  @IsOptional()
  @IsString()
  state!: string;
  @IsOptional()
  @IsString()
  city!: string;

  @IsOptional()
  @IsString()
  joindata!: string;

  @IsOptional()
  @IsString()
  phone_number!: string;
}