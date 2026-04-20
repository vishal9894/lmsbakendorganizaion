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
    Query,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-courses.dto';
import { UpdateCourseDto } from './dto/update-courses.dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('courses')
@UseGuards(TenantAuthGuard)
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

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
    @UseInterceptors(FileInterceptor('courseimage'))
    create(
        @CurrentUser() user: CurrentUserData,
        @Body() data: CreateCourseDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.coursesService.create(organizationId, data, file);
    }

    @Get()
    findAll(
        @CurrentUser() user: CurrentUserData,
        @Query('type') type?: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        if (type) {
            return this.coursesService.findByType(organizationId, type);
        }
        return this.coursesService.findAll(organizationId);
    }

    @Get(':id')
    findOne(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.coursesService.findOne(organizationId, id);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('courseImage'))
    update(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
        @Body() data: UpdateCourseDto,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.coursesService.update(organizationId, id, data, file);
    }

    @Delete(':id')
    remove(
        @CurrentUser() user: CurrentUserData,
        @Param('id') id: string,
    ) {
        const organizationId = this.getOrganizationId(user);
        return this.coursesService.remove(organizationId, id);
    }
}
