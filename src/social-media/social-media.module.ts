import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { SocialMediaController } from './social-media.controller';
import { SocialMediaService } from './social-media.service';
import { TenantManager } from '../database/tenant-manager.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { S3Service } from 'src/common/services/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Admin]), JwtModule, ConfigModule],
  controllers: [SocialMediaController],
  providers: [SocialMediaService, TenantManager , S3Service]
})
export class SocialMediaModule { }
