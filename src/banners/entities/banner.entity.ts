import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ContentType {
  BANNER = 'banner',
  NEWS = 'news',
}

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column()
  title!: string;

  // ✅ banner or news
  @Column({
    type: 'enum',
    enum: ContentType,
  })
  type!: ContentType;

  // banner related (optional)
  @Column({ nullable: true })
  courseName!: string;

  @Column({ type: 'uuid', nullable: true })
  courseId!: string;

  @Column({ nullable: true })
  courseUrl!: string;

  // news related (optional)
  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column({ nullable: true })
  image!: string;

  @Column({ default: true })
  status!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
