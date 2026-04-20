import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true })
  organizationId?: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  city?: string;
  @Column({ nullable: true })
  phone_number!: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ type: 'date', nullable: true })
  joinDate?: Date;
}
