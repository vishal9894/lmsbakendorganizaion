import { Controller, Post, Body, Get, Param, Req, Delete } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';

interface AdminRequest extends Request {
    admin?: {
        id: string;
        email: string;
        name: string;
        role: string;
        organizationId?: string;
        subdomain?: string;
        type: 'super_admin' | 'tenant_admin';
    };
}

@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Post()
    create(@Body() dto: CreateAdminDto) {
        return this.adminService.createAdmin(dto);
    }

    @Post('login')
    login(@Body() dto: LoginAdminDto) {
        return this.adminService.login(dto);
    }

    @Get()
    findAll() {
        return this.adminService.findAll();
    }

    @Get('profile')
    getProfile(@Req() req: AdminRequest) {
        return {
            message: 'Admin profile fetched successfully',
            admin: req.admin,
        };
    }

    @Get(':id')
    findByOrganization(@Param('id') id: string) {
        return this.adminService.findByOrganization(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminService.remove(id);
    }
}
