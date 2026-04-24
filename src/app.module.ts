import { Module, NestModule, MiddlewareConsumer, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { TopTeacherModule } from './topteacher/topteacher.module';
import { SuperStreamModule } from './superstream/superstream.module';
import { StreamModule } from './stream/stream.module';
import { Organization } from './organizations/entities/create-organization.entityes';
import { Admin } from './admin/entities/admin.entity';
import { SuperStream } from './superstream/entities/superstream.entity';
import { Stream } from './stream/entities/stream.entity';
import { DatabaseModule } from './database/database.module';
import { AdminProfileMiddleware } from './admin/admin-profile.middleware';
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
import { TeachersModule } from './teachers/teachers.module';
import { TestquestionModule } from './testquestion/testquestion.module';
import { OmrSheetModule } from './omr-sheet/omr-sheet.module';


@Module({
  imports: [
    // ✅ Load .env globally
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    //  ✅ Correct TypeORM async config
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: (config: ConfigService) => ({
    //     type: 'postgres',
    //     host: config.get<string>('DB_HOST') || 'localhost',
    //     port: 5432,
    //     username: config.get<string>('DB_USER') || 'postgres',
    //     password: config.get<string>('DB_PASSWORD') || 'postgres',
    //     database: config.get<string>('DB_NAME') || 'platform_db',
    //     entities: [Organization, Admin],
    //     synchronize: true,
    //   }),
    // }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Organization, Admin], // Only main DB entities
      autoLoadEntities: true,
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),






    DatabaseModule,
    TypeOrmModule.forFeature([Admin]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'your_super_secret_jwt_key_for_development_only_change_in_production',
        signOptions: { expiresIn: '7d' },
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
    TeachersModule,
    TestquestionModule,
    OmrSheetModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AdminProfileMiddleware)
      .forRoutes('admin/profile', 'admin/me');
  }
}