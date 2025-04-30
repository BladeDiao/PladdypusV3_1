import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './User.model';
import generateId from '../middleware/IdGenerator.middleware';


@Table({ tableName: 'activation'})
export default class Activation extends Model<Activation> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('activation'),
  })
  id!: string;

  @Column({
    type: DataType.STRING(64),
  })
  alias!: string;

  @Column({
    type: DataType.STRING(64),
  })
  user_id!: string;

  @Column({
    type: DataType.STRING(64),
  })
  userEmail!: string;

  @Column({
    type: DataType.STRING(64),
  })
  userName!: string;

  @Column({
    type: DataType.STRING(64),
  })
  referralCode!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true
  })
  fromDealer!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: () => new Date(),
  })
  createdTimestamp!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  redeemedTimestamp!: Date;

}