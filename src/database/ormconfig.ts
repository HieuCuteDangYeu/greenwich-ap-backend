import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const migrationsDir = path.join(__dirname, 'migrations');

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: isProduction
    ? [path.join(__dirname, '../../dist/**/*.entity.js')]
    : [path.join(__dirname, '../../src/**/*.entity.ts')],
  migrations: isProduction
    ? [path.join(migrationsDir, '*.js')]
    : [path.join(migrationsDir, '*.ts')],

  migrationsTableName: 'migrations',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(config);
