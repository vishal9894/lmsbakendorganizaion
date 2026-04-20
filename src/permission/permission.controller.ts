import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    ForbiddenException,
} from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';

@Controller('permissions')
@UseGuards(TenantAuthGuard)
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) { }

    private getOrganizationId(user: CurrentUserData): string {
        if (user.type === 'super_admin') {
            throw new ForbiddenException('Super admin cannot access organization-specific resources directly. Please use organization admin account.');
        }
        if (!user.organizationId) {
            throw new ForbiddenException('No organization associated with this account');
        }
        return user.organizationId;
    }

    @Post()
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() data: CreatePermissionDto,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.permissionService.create(organizationId, data);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        const organizationId = this.getOrganizationId(user);
        return this.permissionService.findAll(organizationId);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.permissionService.findOne(organizationId, Number(id));
    }

    @Put(':id')
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() data: UpdatePermissionDto,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.permissionService.update(organizationId, Number(id), data);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.permissionService.remove(organizationId, Number(id));
    }
}
