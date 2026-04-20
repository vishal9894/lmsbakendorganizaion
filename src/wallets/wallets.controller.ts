import { Controller, Get, Post, Body, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet-dto';
import { UpdateWalletDto } from './dto/update-wallet-dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface CurrentUserData {
    id: string;
    email: string;
    subdomain?: string;
    organizationId?: string;
}

@Controller('wallets')
@UseGuards(TenantAuthGuard)
export class WalletsController {
    constructor(private readonly walletsService: WalletsService) { }

    @Post()
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() createDto: CreateWalletDto,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.walletsService.create(user.subdomain, createDto);
    }

    @Get(':userId')
    getBalance(
        @CurrentUser() user: CurrentUserData,
        @Param('userId') userId: string,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.walletsService.getBalance(user.subdomain, userId);
    }

    @Put(':userId')
    updateBalance(
        @CurrentUser() user: CurrentUserData,
        @Param('userId') userId: string,
        @Body() updateDto: UpdateWalletDto,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.walletsService.updateBalance(user.subdomain, userId, updateDto);
    }

    @Post('credit/:userId')
    credit(
        @CurrentUser() user: CurrentUserData,
        @Param('userId') userId: string,
        @Body('amount') amount: number,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.walletsService.credit(user.subdomain, userId, amount);
    }

    @Post('debit/:userId')
    debit(
        @CurrentUser() user: CurrentUserData,
        @Param('userId') userId: string,
        @Body('amount') amount: number,
    ) {
        if (!user.subdomain) {
            throw new Error('Subdomain is required');
        }
        return this.walletsService.debit(user.subdomain, userId, amount);
    }
}
