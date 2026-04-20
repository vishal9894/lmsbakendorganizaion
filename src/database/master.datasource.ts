import { DataSource } from 'typeorm';

export const MasterDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'platform_db',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true, // dev only
});