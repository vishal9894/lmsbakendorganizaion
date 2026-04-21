import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateWalletDto {
   
    userId!: string;

   
    balance!: number;
}
