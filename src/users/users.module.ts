import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TenantManager } from '../database/tenant-manager.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, Admin]),
    JwtModule.register({
      secret: 'your_super_secret_jwt_key_for_development_only_change_in_production',
      signOptions: { expiresIn: '7d' },
    })
  ],
  controllers: [UsersController],
  providers: [UsersService, TenantManager]
})
export class UsersModule { }
