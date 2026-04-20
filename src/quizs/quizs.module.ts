import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { QuizsController } from './quizs.controller';
import { QuizsService } from './quizs.service';
import { TenantManager } from '../database/tenant-manager.service';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { Quiz } from './entities/quiz-entity';
import { Question } from './entities/question-entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organization, Admin, Quiz, Question]), ConfigModule, JwtModule],
  controllers: [QuizsController],
  providers: [QuizsService, TenantManager]
})
export class QuizsModule { }
