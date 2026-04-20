import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
} from 'typeorm';

import { Role } from 'src/roles/entities/role.entity';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  organizationId?: string;

  @Column({ unique: true })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'permission_group', nullable: true })
  permissionGroup?: string;

  @Column({ name: 'guard_name', default: 'web' })
  guardName!: string;

  @Column({ default: true })
  status!: boolean;

  /* ✅ PERMISSION → ROLES (inverse side) */
  @ManyToMany(() => Role, (role) => role.permissions)
  roles!: Role[];
}
