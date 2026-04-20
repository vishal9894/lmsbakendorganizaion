import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('contents')
export class FileContent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  type?: string;

  @Column({ type: 'varchar', nullable: true })
  contentType?: string;

  @Column({ type: 'varchar', nullable: true })
  access?: string;

  @Column({ type: 'varchar', nullable: true })
  videoLink?: string;

  @Column({ type: 'varchar', nullable: true })
  source?: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail?: string;

  @Column({ type: 'varchar', nullable: true })
  file?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'jsonb', nullable: true })
  categories?: any;

  @Column({ type: 'boolean', nullable: true })
  negativeMarking?: boolean;

  @Column({ type: 'float', nullable: true })
  negativeMarks?: number;

  @Column({ type: 'varchar', nullable: true })
  testType?: string;

  @Column({ type: 'varchar', nullable: true })
  postedBy?: string;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string;
}
