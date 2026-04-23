import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from './entities/admin.entity';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { AdminProfileMiddleware } from './admin-profile.middleware';
import { S3Service } from 'src/common/services/s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Organization]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'default_secret_key',
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService, AdminProfileMiddleware ,S3Service],
  exports: [AdminProfileMiddleware],
})
export class AdminModule { }
