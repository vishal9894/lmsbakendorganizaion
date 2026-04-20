import { Controller, Post, UseGuards, Body, ForbiddenException } from '@nestjs/common';
import { PermissionsSeeder } from './seeders/permissions.seeder';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { CurrentUser, type CurrentUserData } from '../common/decorators/current-user.decorator';

@Controller('database')
@UseGuards(TenantAuthGuard)
export class DatabaseController {
  constructor(private readonly permissionsSeeder: PermissionsSeeder) {}

  private getOrganizationId(user: CurrentUserData): string {
    if (user.type === 'super_admin') {
      throw new ForbiddenException('Super admin cannot access organization-specific resources directly.');
    }
    if (!user.organizationId) {
      throw new ForbiddenException('No organization associated with this account');
    }
    return user.organizationId;
  }

  @Post('seed/permissions')
  async seedPermissions(
    @CurrentUser() user: CurrentUserData,
    @Body('subdomain') subdomain?: string,
  ) {
    // Use provided subdomain or from user's organization
    const targetSubdomain = subdomain || user.subdomain;
    
    if (!targetSubdomain) {
      throw new ForbiddenException('Subdomain is required');
    }

    return this.permissionsSeeder.seedForOrganization(targetSubdomain);
  }
}
