import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TopstudentsController } from './topstudents.controller';
import { TopstudentsService } from './topstudents.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { S3Service } from '../common/services/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Admin]),
    JwtModule,
  ],
  controllers: [TopstudentsController],
  providers: [TopstudentsService, TenantAuthGuard, S3Service],
  exports: [TopstudentsService],
})
export class TopstudentsModule { }
