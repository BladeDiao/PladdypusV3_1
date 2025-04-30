import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import generateId from '../middleware/IdGenerator.middleware';
import UserAssignment from './UserAssignment';

@Table({ tableName: 'user' })
export default class User extends Model<User> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('user'),
  })
  id!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    unique: true,
  })
  email!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  password!: string;


  @Column(DataType.STRING(64))
  alias?: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  S3Id!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 9,
    },
  })
  permissionLevel!: number;

  @Column({
    type: DataType.STRING(64),
  })
  accountName?: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    comment: 'actually user_id, uses for following primary user'
  })
  managedBy!: string;

  @HasMany(() => UserAssignment)
  userAssignment!: UserAssignment;

}