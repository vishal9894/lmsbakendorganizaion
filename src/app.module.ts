import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AdminModule } from './admin/admin.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TopTeacherModule } from './topteacher/topteacher.module';
import { SuperStreamModule } from './superstream/superstream.module';
import { StreamModule } from './stream/stream.module';
import { DatabaseModule } from './database/database.module';
import { TopstudentsModule } from './topstudents/topstudents.module';
import { CoursesModule } from './courses/courses.module';
import { BannersModule } from './banners/banners.module';
import { RolesModule } from './roles/roles.module';
import { PermissionModule } from './permission/permission.module';
import { UsersModule } from './users/users.module';
import { FoldersModule } from './folders/folders.module';
import { EventsModule } from './events/events.module';
import { FileContentsModule } from './file-contents/file-contents.module';
import { QuizsModule } from './quizs/quizs.module';
import { SocialMediaModule } from './social-media/social-media.module';
import { WalletsModule } from './wallets/wallets.module';

import { Organization } from './organizations/entities/create-organization.entityes';
import { Admin } from './admin/entities/admin.entity';

import { AdminProfileMiddleware } from './admin/admin-profile.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const useSupabase =
          config.get<string>('USE_SUPABASE') === 'true';

        return {
          type: 'postgres',

          ...(useSupabase
            ? {
                url: config.get<string>('DATABASE_URL'),
                ssl: {
                  rejectUnauthorized: false,
                },
              }
            : {
                host:
                  config.get<string>('DB_HOST') ||
                  'localhost',

                port: Number(
                  config.get<string>('DB_PORT') || 5432,
                ),

                username:
                  config.get<string>('DB_USER') ||
                  'postgres',

                password:
                  config.get<string>('DB_PASSWORD') ||
                  'postgres',

                database:
                  config.get<string>('DB_NAME') ||
                  'platform_db',
              }),

          entities: [Organization, Admin],
          synchronize: true,
          autoLoadEntities: true,
        };
      },
    }),

    DatabaseModule,
    TypeOrmModule.forFeature([Admin]),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret:
          config.get<string>('JWT_SECRET') ||
          'default_secret_key',

        signOptions: {
          expiresIn: '7d',
        },
      }),
    }),

    AdminModule,
    OrganizationsModule,
    TopTeacherModule,
    SuperStreamModule,
    StreamModule,
    TopstudentsModule,
    CoursesModule,
    BannersModule,
    RolesModule,
    PermissionModule,
    UsersModule,
    FoldersModule,
    EventsModule,
    FileContentsModule,
    QuizsModule,
    SocialMediaModule,
    WalletsModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminProfileMiddleware)
      .forRoutes('admin/profile', 'admin/me');
  }
}