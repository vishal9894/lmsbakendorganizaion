import { Controller, Post, Body, Get, Param, Req, Delete, UseInterceptors, UploadedFile, Patch, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
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
    image?: string;
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
        image?: string;
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

    // Get all organization admins without parameters
    @Get('all-organization-admins')
    getAllOrganizationAdmins() {
        return this.adminService.getAllOrganizationAdmins();
    }

    @Get('profile')
    @UseGuards(TenantAuthGuard)
    async getProfile(@CurrentUser() user: CurrentUserData) {
        return this.adminService.getProfile(user);
    }

    @Post('switch-organization')
    @UseGuards(TenantAuthGuard)
    switchOrganization(
        @CurrentUser() user: CurrentUserData,
        @Body() body: { organizationId: string },
    ) {
        return this.adminService.switchOrganization(user, body.organizationId);
    }

    // Organization-based login - search across all organizations
    @Post('organization-login')
    organizationLogin(@Body() dto: any) {
        return this.adminService.organizationLogin(dto);
    }

    @Get(':id')
    findByOrganization(@Param('id') id: string) {
        return this.adminService.findByOrganization(id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('image'))
    update(@Param('id') id: string, @Body() dto: UpdateAdminDto, @UploadedFile() file: Express.Multer.File) {
        console.log(dto);
        return this.adminService.update(id, dto, file);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.adminService.remove(id);
    }
}