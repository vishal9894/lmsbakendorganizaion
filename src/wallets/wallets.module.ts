import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { TenantManager } from '../database/tenant-manager.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Admin]), JwtModule, ConfigModule],
  controllers: [WalletsController],
  providers: [WalletsService, TenantManager]
})
export class WalletsModule { }
