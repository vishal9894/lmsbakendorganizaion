import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { TopTeacherController } from './topteacher.controller';
import { TopTeacherService } from './topteacher.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';
import { S3Service } from 'src/common/services/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Admin]),
    JwtModule,
  ],
  controllers: [TopTeacherController],
  providers: [TopTeacherService, TenantAuthGuard , S3Service],
  exports: [TopTeacherService],
})
export class TopTeacherModule { }
