// src/config/postgresql.config.ts

import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: `${process.env.EC2_IP_ADDRESS}`,
  port: 5432,
  username: 'remoteuser',
  password: 'JohnBatmanGroup',
  database: `${process.env.POSTGRESQL_DATABASE}`,
  logging: true, // 设置为true可以在控制台看到SQL查询
  models: [__dirname + '/../model'], // 指定模型文件的位置
});

export default sequelize;