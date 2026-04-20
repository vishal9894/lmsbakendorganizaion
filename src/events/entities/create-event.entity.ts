import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccessType {
  FREE = 'free',
  PAID = 'paid',
}

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ type: 'uuid', nullable: true })
  courseId!: string;

  @Column({ nullable: true })
  courseName!: string;

  @Column({ type: 'uuid', nullable: true })
  folderId!: string;

  @Column({ nullable: true })
  url!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string;

  @Column({ type: 'boolean', default: true })
  status!: boolean;

  @Column({
    type: 'enum',
    enum: AccessType,
    default: AccessType.FREE,
  })
  accessType!: AccessType;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
