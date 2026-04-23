import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

import { Permission } from 'src/permission/entities/permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description!: string;

  /* ✅ ROLE → PERMISSIONS */
  @ManyToMany(() => Permission, { eager: true })
  @JoinTable({
    name: 'role_permissions',
  })
  permissions!: Permission[];
}
