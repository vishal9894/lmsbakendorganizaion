import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Entity,
} from 'typeorm';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  image!: string;

  @Column()
  account_id!: string;

  @Column()
  revenue_share!: string;

  @Column({ nullable: true })
  assigned_course_id!: string;

  @Column()
  rating!: string;

  @Column()
  teacherdetails!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
