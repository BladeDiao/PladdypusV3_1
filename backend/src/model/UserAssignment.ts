import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './User.model';
import generateId from '../middleware/IdGenerator.middleware';

@Table({ tableName: 'user_assignment' })
export default class UserAssignment extends Model<UserAssignment> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('u_a'),
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  user_id!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  target_id!: string;

  @Column({
    type: DataType.ENUM('adv', 'venue', 'touchscreen'),
    allowNull: false,
  })
  targetType!: 'adv'| 'venue' | 'touchscreen';

  @Column({
    type: DataType.ARRAY(DataType.INTEGER),
    defaultValue: [],
  })
  permission_ids!: number[];

  @BelongsTo(() => User)
  user!: User;

}