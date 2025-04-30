import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, AllowNull } from 'sequelize-typescript';
import Venue from './Venue.model';
import Adv from './Adv.model';
import generateId from '../middleware/IdGenerator.middleware';

@Table({ tableName: 'adv_log' })
export default class AdvLog extends Model<AdvLog> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('analysisAdvLog'),
  })
  id!: string;

  @ForeignKey(() => Adv)
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  adv_id!: string;

  @ForeignKey(() => Venue)
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  venue_id!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  ipAddress!: string;

  @Column({
    type: DataType.STRING(64),
  })
  timeZone!: string;

  @Column({
    type: DataType.ENUM('Firefox', 'Chrome', 'Safari', 'Edge', 'Other'),
  })
  browser!: string;

  @Column({
    type: DataType.ENUM('Windows', 'MacOS', 'Android', 'iOS', 'Other'),
  })
  os!: string;

  @Column({
    type: DataType.ENUM('Smartphone', 'Tablet', 'Large Tablet', 'Desktop'),
  })
  device!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  userIdentifier!: string;

  @Column({
    type: DataType.ENUM('Home','Discover','Article','X','Email','Facebook','Instagram','Phone','Website','Whatsapp'),
  })
  origin!: string;

  @BelongsTo(() => Adv)
  adv!: Adv;

  @BelongsTo(() => Venue)
  venue!: Venue;
}