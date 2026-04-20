import { Module, Global } from '@nestjs/common';
import { TypeOrmModule, getDataSourceToken } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { TenantManager } from './tenant-manager.service';
import { PermissionsSeeder } from './seeders/permissions.seeder';
import { DatabaseController } from './database.controller';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Organization, Admin]), JwtModule],
  controllers: [DatabaseController],
  providers: [
    TenantManager,
    PermissionsSeeder,
    {
      provide: 'MASTER_DATA_SOURCE',
      useFactory: (dataSource: DataSource) => dataSource,
      inject: [getDataSourceToken()],
    },
  ],
  exports: ['MASTER_DATA_SOURCE', TenantManager, PermissionsSeeder],
})
export class DatabaseModule { }
