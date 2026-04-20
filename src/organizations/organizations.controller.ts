import { Controller, Post, Body, Get, Param, Put, Delete, } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import console from 'console';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Controller('organizations')
export class OrganizationsController {
  constructor(private orgService: OrganizationsService) { }

  @Post()
  create(@Body() body: { name: string }) {
    return this.orgService.createOrganization(body.name);
  }
  @Get()
  getAll() {
    return this.orgService.getAllOrganizations();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: { name: string }) {
    return this.orgService.updateOrganization(id, body.name);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.orgService.deleteOrganization(id);
  }

  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: CreateOrganizationDto) {

    
    return this.orgService.udpatestatus(id, dto.status);
  }
}

