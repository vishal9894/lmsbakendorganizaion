import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { PermissionsSeeder } from './seeders/permissions.seeder';

@Controller('database')
export class DatabaseController {
  constructor(private readonly permissionsSeeder: PermissionsSeeder) { }

  @Post('seed/permissions')
  async seedPermissions(@Body('subdomain') subdomain: string) {
    if (!subdomain) {
      throw new BadRequestException('Subdomain is required');
    }

    return this.permissionsSeeder.seedForOrganization(subdomain);
  }
}
