import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    ForbiddenException,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('banners')
@UseGuards(TenantAuthGuard)
export class BannersController {
    constructor(private readonly bannersService: BannersService) { }

    private getOrganizationId(user: CurrentUserData): string {
        // Allow super admin if they have organizationId (logged into specific org)
        if (user.type === 'super_admin' && !user.organizationId) {
            throw new ForbiddenException('Super admin cannot access organization-specific resources directly. Please use organization admin account or login with subdomain.');
        }
        if (!user.organizationId) {
            throw new ForbiddenException('No organization associated with this account');
        }
        return user.organizationId;
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() data: CreateBannerDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.bannersService.create(organizationId, data, file);
    }

    @Get()
    findAll(
        @CurrentUser() user: CurrentUserData,
        @Query('type') type?: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        if (type) {
            return this.bannersService.findByType(organizationId, type);
        }
        return this.bannersService.findAll(organizationId);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.bannersService.findOne(organizationId, id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() data: UpdateBannerDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.bannersService.update(organizationId, id, data, file);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.bannersService.remove(organizationId, id);
    }
}
