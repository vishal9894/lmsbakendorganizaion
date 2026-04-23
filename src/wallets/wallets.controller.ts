import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put, Inject } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet-dto';
import { UpdateWalletDto } from './dto/update-wallet-dto';
import { TransactionWalletDto } from './dto/transaction-wallet-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Repository } from 'typeorm';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { InjectRepository } from '@nestjs/typeorm';

interface CurrentUserData {
    id: string;
    email: string;
    subdomain?: string;
    organizationId?: string;
    type?: string;
}

@Controller('wallets')
@UseGuards(TenantAuthGuard)
export class WalletsController {
    constructor(
        private readonly walletsService: WalletsService,
        @InjectRepository(Organization)
        private readonly orgRepo: Repository<Organization>,
    ) { }

    private async getSubdomain(user: CurrentUserData): Promise<string> {
        // If subdomain already exists, use it
        if (user.subdomain) {
            return user.subdomain;
        }

        // If organizationId exists, get subdomain from organization
        if (user.organizationId) {
            const org = await this.orgRepo.findOne({
                where: { id: user.organizationId },
            });
            if (org) {
                return org.subdomain;
            }
        }

        throw new Error('Subdomain or organizationId is required');
    }

    @Post()
    async create(
        @CurrentUser() user: CurrentUserData,
        @Body() createDto: CreateWalletDto,
    ) {
        const subdomain = await this.getSubdomain(user);
        return this.walletsService.create(subdomain, createDto);
    }

    @Get(':userId')
    async getBalance(
        @CurrentUser() user: CurrentUserData,
        @Param('userId') userId: string,
    ) {
        const subdomain = await this.getSubdomain(user);
        return this.walletsService.getBalance(subdomain, userId);
    }

    @Put(':userId')
    async updateBalance(
        @CurrentUser() user: CurrentUserData,
        @Param('userId') userId: string,
        @Body() updateDto: UpdateWalletDto,
    ) {
        const subdomain = await this.getSubdomain(user);
        return this.walletsService.updateBalance(subdomain, userId, updateDto);
    }

    @Post('credit/:userId')
    async credit(
        @CurrentUser() user: CurrentUserData,
        @Param('userId') userId: string,
        @Body() dto: TransactionWalletDto,
    ) {
        const subdomain = await this.getSubdomain(user);
        return this.walletsService.credit(subdomain, userId, dto.amount);
    }

    @Post('debit/:userId')
    async debit(
        @CurrentUser() user: CurrentUserData,
        @Param('userId') userId: string,
        @Body() dto: TransactionWalletDto,
    ) {
        const subdomain = await this.getSubdomain(user);
        console.log('Debit request:', { userId, amount: dto.amount });
        return this.walletsService.debit(subdomain, userId, dto.amount);
    }
}


