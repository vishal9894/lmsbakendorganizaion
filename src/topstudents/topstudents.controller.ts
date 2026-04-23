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
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { TopstudentsService } from './topstudents.service';
import { CreateTopStudentDto } from './dto/create-topStudent.dto';
import { UpdateTopStudentDto } from './dto/update-topStudent.dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('topstudents')
@UseGuards(TenantAuthGuard)
export class TopstudentsController {
    constructor(private readonly topstudentsService: TopstudentsService) { }

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
        @Body() data: CreateTopStudentDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.topstudentsService.create(organizationId, data, file);
    }

    @Get()
    findAll(@CurrentUser() user: CurrentUserData) {
        const organizationId = this.getOrganizationId(user);
        return this.topstudentsService.findAll(organizationId);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.topstudentsService.findOne(organizationId, id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image'))
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() data: UpdateTopStudentDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.topstudentsService.update(organizationId, id, data, file);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.topstudentsService.remove(organizationId, id);
    }
}
