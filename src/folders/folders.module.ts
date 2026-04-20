import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { TenantManager } from '../database/tenant-manager.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { S3Service } from 'src/common/services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Admin]), JwtModule, ConfigModule],
  providers: [FoldersService, TenantManager, S3Service],
  controllers: [FoldersController],
})
export class FoldersModule { }
