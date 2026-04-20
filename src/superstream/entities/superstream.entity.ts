import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Stream } from '../../stream/entities/stream.entity';

@Entity('superstreams')
export class SuperStream {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column({ unique: true })
  name!: string;

  @OneToMany(() => Stream, (stream) => stream.superstream)
  streams!: Stream[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
