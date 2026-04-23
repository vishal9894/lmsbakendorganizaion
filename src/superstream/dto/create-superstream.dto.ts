import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSuperStreamDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;
}
