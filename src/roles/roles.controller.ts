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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';

@Controller('roles')
@UseGuards(TenantAuthGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

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
        @Body() data: CreateRoleDto,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.rolesService.create(organizationId, data);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        const organizationId = this.getOrganizationId(user);
        return this.rolesService.findAll(organizationId);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.rolesService.findOne(organizationId, Number(id));
    }

    @Put(':id')
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() data: UpdateRoleDto,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.rolesService.update(organizationId, Number(id), data);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.rolesService.remove(organizationId, Number(id));
    }
}
