import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { TenantManager } from '../database/tenant-manager.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { S3Service } from '../common/services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Admin]), ConfigModule, JwtModule],
  controllers: [EventsController],
  providers: [EventsService, TenantManager, S3Service]
})
export class EventsModule { }
