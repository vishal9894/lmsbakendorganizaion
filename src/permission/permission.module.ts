import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Admin]),
    JwtModule,
  ],
  controllers: [PermissionController],
  providers: [PermissionService, TenantAuthGuard],
  exports: [PermissionService],
})
export class PermissionModule { }
