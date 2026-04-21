import { IsNumber, Min } from 'class-validator';

export class TransactionWalletDto {
    @IsNumber()
    @Min(0.01)
    amount!: number;
}
