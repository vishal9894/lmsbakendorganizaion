import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { OmrSheetController } from './omr-sheet.controller';
import { OmrSheetService } from './omr-sheet.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { TenantManager } from '../database/tenant-manager.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Admin]),
    JwtModule,
  ],
  controllers: [OmrSheetController],
  providers: [OmrSheetService, TenantManager]
})
export class OmrSheetModule { }
