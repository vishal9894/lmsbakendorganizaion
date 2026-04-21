import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { S3Service } from '../common/services/s3.service';
import { Admin } from '../admin/entities/admin.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Admin]), JwtModule],
  controllers: [TeachersController],
  providers: [TeachersService, TenantManager, S3Service]
})
export class TeachersModule { }
