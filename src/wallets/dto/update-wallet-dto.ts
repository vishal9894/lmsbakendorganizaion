import { IsNumber, Min } from 'class-validator';

export class UpdateWalletDto {
    @IsNumber()
    @Min(0)
    balance!: number;
}
