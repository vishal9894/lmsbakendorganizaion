import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Organization } from '../organizations/entities/create-organization.entityes';
import { Admin } from '../admin/entities/admin.entity';
import { User } from '../users/entities/user.entity';
import { Folder } from '../folders/entities/folder.entity';
import { TopTeachers } from '../topteacher/entities/topteacher.entity';
import { SuperStream } from '../superstream/entities/superstream.entity';
import { Stream } from '../stream/entities/stream.entity';
import { TopStudents } from 'src/topstudents/entities/top.student.entity';
import { Course } from 'src/courses/entities/courses.entity';
import { Banner } from 'src/banners/entities/banner.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { Event } from '../events/entities/create-event.entity';
import { FileContent } from '../file-contents/entities/file-content-entity';
import { Quiz } from '../quizs/entities/quiz-entity';
import { Question } from '../quizs/entities/question-entity';
import { SocialMediaEntity } from '../social-media/entities/create-socialmedia-entityes';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Wallet } from '../wallets/entities/create-wallet-entityes';
import { CreateTestquestionEntity } from '../testquestion/entities/create-testquestion-entityes';
import { CreateSheetEntity } from '../omr-sheet/entities/create-sheet-entity';

// Entities that exist ONLY in tenant databases (not main platform DB)
const TENANT_ENTITIES = [Admin, User, Folder, TopTeachers, SuperStream, Stream, TopStudents, Course, Banner, Role, Permission, Event, FileContent, Quiz, Question, SocialMediaEntity, Wallet, Teacher, CreateTestquestionEntity, CreateSheetEntity];

@Injectable()
export class TenantManager {
  private connections = new Map<string, DataSource>();

  constructor(
    @Inject('MASTER_DATA_SOURCE')
    private masterDataSource: DataSource,
  ) { }

  async getTenantConnection(tenant: string): Promise<DataSource> {
    if (this.connections.has(tenant)) {
      return this.connections.get(tenant)!;
    }

    const orgRepo = this.masterDataSource.getRepository(Organization);

    const org = await orgRepo.findOne({
      where: { subdomain: tenant },
    });

    if (!org) throw new Error('Invalid tenant');

    const dataSource = new DataSource({
      type: 'postgres',
      url: org.db_url,
      entities: TENANT_ENTITIES,
      synchronize: true, // dev only
    });

    await dataSource.initialize();

    this.connections.set(tenant, dataSource);

    return dataSource;
  }
}