import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/registerUser.dto';
import { TenantAuthGuard, type TenantRequest } from '../common/guards/tenant-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('signup')
    register(@Body() dto: RegisterDto) {
        return this.usersService.createUser(dto);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.usersService.login(dto);
    }

    @Get()
    getAllUsers() {
        return this.usersService.getAllUsers();
    }

    @Get('profile')
    @UseGuards(TenantAuthGuard)
    getProfile(@Req() req: TenantRequest) {
        return this.usersService.getProfile(req.user!);
    }
}
