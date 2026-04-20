import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SuperStreamController } from './superstream.controller';
import { SuperStreamService } from './superstream.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { TenantAuthGuard } from '../common/guards/tenant-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Admin]),
    JwtModule,
  ],
  controllers: [SuperStreamController],
  providers: [SuperStreamService, TenantAuthGuard],
  exports: [SuperStreamService],
})
export class SuperStreamModule {}
