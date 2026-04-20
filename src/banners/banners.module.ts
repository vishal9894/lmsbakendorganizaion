import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { S3Service } from '../common/services/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Admin]),
    JwtModule,
  ],
  controllers: [BannersController],
  providers: [BannersService, TenantAuthGuard, S3Service],
  exports: [BannersService],
})
export class BannersModule { }
