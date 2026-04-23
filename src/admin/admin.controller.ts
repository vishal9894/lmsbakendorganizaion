import { Controller, Post, Body, Get, Param, Req, Delete, UseInterceptors, UploadedFile, Patch, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { LoginAdminDto } from './dto/login-admin.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

interface CurrentUserData {
    id: string;
    email: string;
    role: string;
    organizationId?: string;
    subdomain?: string;
    type?: string;
    permissions?: string[];
}

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

    // Main Admin Signup - for super admins who can login to organization pages
    @Post('main-signup')
    mainSignup(@Body() dto: any) {
        return this.adminService.mainSignup(dto);
    }

    // Organization Admin Signup - for normal organization admins
    @Post('org-signup')
    orgSignup(@Body() dto: any) {
        return this.adminService.orgSignup(dto);
    }

    // Normal Admin Login - login to main database
    @Post('normal-login')
    normalLogin(@Body() dto: any) {
        return this.adminService.normalLogin(dto);
    }

    // Organization Admin Login - login to organization database
    @Post('org-login')
    orgLogin(@Body() dto: any) {
        return this.adminService.orgLogin(dto);
    }

    @Get()
    findAll() {
        return this.adminService.findAll();
    }
    @Get('profile')
    @UseGuards(TenantAuthGuard)
    getProfile(@CurrentUser() user: CurrentUserData) {
        return {
            message: 'Admin profile fetched successfully',
            admin: user,
        };
    }

    @Post('switch-organization')
    @UseGuards(TenantAuthGuard)
    switchOrganization(
        @CurrentUser() user: CurrentUserData,
        @Body() body: { organizationId: string },
    ) {
        return this.adminService.switchOrganization(user, body.organizationId);
    }

    @Get(':id')
    findByOrganization(@Param('id') id: string) {
        return this.adminService.findByOrganization(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: CreateAdminDto) {
        return this.adminService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminService.remove(id);
    }
}