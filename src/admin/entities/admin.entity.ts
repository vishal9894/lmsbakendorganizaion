import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({select: false})
  password!: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId!: string;

  @Column({ default: 'active' })
  status!: string;

  @Column({ default: 'admin' })
  roleName!: string;

  @Column({ name: 'role_id', nullable: true })
  roleId?: string;

  @Column({ nullable: true })
  phone?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
