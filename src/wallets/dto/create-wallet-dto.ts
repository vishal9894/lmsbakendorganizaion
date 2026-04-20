import { IsUUID } from 'class-validator';

export class CreateWalletDto {
    @IsUUID()
    userId!: string;
}