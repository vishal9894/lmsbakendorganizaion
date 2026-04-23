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
  Req,
} from '@nestjs/common';
import { SuperStreamService } from './superstream.service';
import { CreateSuperStreamDto } from './dto/create-superstream.dto';
import { UpdateSuperStreamDto } from './dto/update-superstream.dto';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';

@Controller('superstream')
@UseGuards(TenantAuthGuard)
export class SuperStreamController {
  constructor(private readonly superStreamService: SuperStreamService) { }

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
  create(
    @CurrentUser() user: CurrentUserData,
    @Body() data: CreateSuperStreamDto,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.superStreamService.create(organizationId, data);
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserData) {
    const organizationId = this.getOrganizationId(user);
    return this.superStreamService.findAll(organizationId);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.superStreamService.findOne(organizationId, id);
  }

  @Put(':id')
  update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() data: UpdateSuperStreamDto,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.superStreamService.update(organizationId, id, data);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
  ) {
    const organizationId = this.getOrganizationId(user);
    return this.superStreamService.remove(organizationId, id);
  }
}
