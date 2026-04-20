import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateWalletDto {
    @IsOptional()
    @IsUUID()
    userId!: string;

    @IsNumber()
    @Min(0)
    balance!: number;
}
