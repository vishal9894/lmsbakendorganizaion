import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ nullable: true })
  name!: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @Column({ default: false })
  is_default!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
