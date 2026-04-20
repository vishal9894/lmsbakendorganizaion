import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TenantManager } from '../database/tenant-manager.service';
import { Wallet } from './entities/create-wallet-entityes';
import { CreateWalletDto } from './dto/create-wallet-dto';
import { UpdateWalletDto } from './dto/update-wallet-dto';

@Injectable()
export class WalletsService {
    constructor(private tenantManager: TenantManager) { }

    private async getRepo(subdomain: string) {
        const tenantDataSource = await this.tenantManager.getTenantConnection(subdomain);
        return tenantDataSource.getRepository(Wallet);
    }

    async create(subdomain: string, createDto: CreateWalletDto) {
        const repo = await this.getRepo(subdomain);

        // Check if wallet already exists for user
        const existingWallet = await repo.findOne({ where: { userId: createDto.userId } });
        if (existingWallet) {
            throw new BadRequestException('Wallet already exists for this user');
        }

        // Create with default balance 0
        const wallet = repo.create({
            userId: createDto.userId,
            balance: 0,
        });
        await repo.save(wallet);
        return {
            message: 'Wallet created successfully',
            wallet,
        };
    }

    async getBalance(subdomain: string, userId: string) {
        const repo = await this.getRepo(subdomain);
        const wallet = await repo.findOne({ where: { userId } });
        if (!wallet) {
            throw new NotFoundException('Wallet not found for this user');
        }
        return {
            message: 'Balance fetched successfully',
            balance: wallet.balance,
            userId: wallet.userId,
        };
    }

    async updateBalance(subdomain: string, userId: string, updateDto: UpdateWalletDto) {
        const repo = await this.getRepo(subdomain);
        const wallet = await repo.findOne({ where: { userId } });
        if (!wallet) {
            throw new NotFoundException('Wallet not found for this user');
        }
        wallet.balance = updateDto.balance;
        await repo.save(wallet);
        return {
            message: 'Balance updated successfully',
            balance: wallet.balance,
            userId: wallet.userId,
        };
    }

    async credit(subdomain: string, userId: string, amount: number) {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be greater than 0');
        }
        const repo = await this.getRepo(subdomain);
        let wallet = await repo.findOne({ where: { userId } });

        if (!wallet) {
            // Auto-create wallet if not exists
            wallet = repo.create({ userId, balance: amount });
        } else {
            wallet.balance = parseFloat((wallet.balance + amount).toFixed(2));
        }

        const savedWallet = await repo.save(wallet);
        return {
            message: 'Wallet credited successfully',
            balance: savedWallet.balance,
            userId: savedWallet.userId,
        };
    }

    async debit(subdomain: string, userId: string, amount: number) {
        if (amount <= 0) {
            throw new BadRequestException('Amount must be greater than 0');
        }
        const repo = await this.getRepo(subdomain);
        const wallet = await repo.findOne({ where: { userId } });

        if (!wallet) {
            throw new NotFoundException('Wallet not found');
        }

        if (wallet.balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        wallet.balance = parseFloat((wallet.balance - amount).toFixed(2));
        const savedWallet = await repo.save(wallet);
        return {
            message: 'Wallet debited successfully',
            balance: savedWallet.balance,
            userId: savedWallet.userId,
        };
        
    }
}
