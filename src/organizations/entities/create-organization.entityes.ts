import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  subdomain!: string;

  @Column()
  db_name!: string;

  @Column()
  db_url!: string;

  @Column({ default: 'active' })
  status!: string;
}
