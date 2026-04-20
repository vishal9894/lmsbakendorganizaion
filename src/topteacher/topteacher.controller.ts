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
import { TopTeacherService } from './topteacher.service';
import { CreateTopTeacherDto } from './dto/create-topteacher.dto';
import { UpdateTopTeacherDto } from './dto/update-topteacher.dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('topteacher')
@UseGuards(TenantAuthGuard)
export class TopTeacherController {
  constructor(private readonly topTeacherService: TopTeacherService) { }

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
  @UseInterceptors(FileInterceptor('image'))
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() data: CreateTopTeacherDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.topTeacherService.create(organizationId, data, file);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    const organizationId = this.getOrganizationId(user);
    return this.topTeacherService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.topTeacherService.findOne(organizationId, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() data: UpdateTopTeacherDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.topTeacherService.update(organizationId, id, data, file);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.topTeacherService.remove(organizationId, id);
  }
}
