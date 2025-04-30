import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'permission' })
export default class Permission extends Model<Permission> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true
  })
  id!: number;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(256),
    allowNull: true,
  })
  description?: string;
}
