import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TestquestionController } from './testquestion.controller';
import { TestquestionService } from './testquestion.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { TenantManager } from '../database/tenant-manager.service';
import { S3Service } from '../common/services/s3.service';
import { Admin } from '../admin/entities/admin.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Admin]), JwtModule],
  controllers: [TestquestionController],
  providers: [TestquestionService, TenantManager, S3Service]
})
export class TestquestionModule { }
