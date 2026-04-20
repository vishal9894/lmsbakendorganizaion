// src/course/entities/course.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CourseType {
  REGULAR = 'regular_course',
  EBOOK = 'ebook',
  FREE_VIDEO = 'free_video_course',
  FREE_PDF = 'free_pdf_course',
  FREE_TEST_SERIES = 'free_test_series',
}

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  // Basic info
  @Column()
  title!: string;

  @Column({ type: 'enum', enum: CourseType, default: CourseType.REGULAR })
  type!: CourseType;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  streamId?: string;

  @Column({ nullable: true })
  courseName?: string;

  @Column({ nullable: true })
  teacherId?: string;

  @Column({ default: true })
  status!: boolean;

  // Course features
  @Column({ default: false })
  liveClasses!: boolean;

  @Column({ default: false })
  recordedVideos!: boolean;

  @Column({ default: false })
  studyNotes!: boolean;

  @Column({ default: false })
  pdfMaterials!: boolean;

  @Column({ default: false })
  mockTests!: boolean;

  @Column({ default: false })
  topperNotes!: boolean;

  // Video and unit info
  @Column({ nullable: true })
  videoId?: string;

  @Column({ nullable: true })
  unitName?: string;

  @Column({ nullable: true })
  chapterName?: string;

  // Pricing (decimal fields transformed to numbers)
  @Column({
    type: 'decimal',
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  strikeoutPrice?: number;

  @Column({
    type: 'decimal',
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  currentPrice?: number;

  @Column({ nullable: true })
  productId?: string;

  @Column({ nullable: true })
  courseGroupUrl?: string;

  @Column({ nullable: true })
  durationDescription?: string;

  @Column({
    type: 'decimal',
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  amount?: number;

  @Column({ nullable: true })
  upgradeDuration?: string;

  @Column({
    type: 'decimal',
    nullable: true,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => (value ? parseFloat(value) : null),
    },
  })
  upgradePrice?: number;

  @Column({ nullable: true })
  courseImage?: string;

  @Column({ nullable: true })
  timetablePdf?: string;

  @Column({ nullable: true })
  batchInfo?: string;

  @Column({ nullable: true })
  pdf?: string;

  // Timestamps
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
