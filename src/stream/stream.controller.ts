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
import { StreamService } from './stream.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('stream')
@UseGuards(TenantAuthGuard)
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

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
    @Body() data: CreateStreamDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.streamService.create(organizationId, data, file);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    const organizationId = this.getOrganizationId(user);
    return this.streamService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.streamService.findOne(organizationId, id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() data: UpdateStreamDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.streamService.update(organizationId, id, data, file);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.streamService.remove(organizationId, id);
  }
}
