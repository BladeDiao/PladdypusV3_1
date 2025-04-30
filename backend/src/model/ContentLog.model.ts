import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, AllowNull } from 'sequelize-typescript';
import Venue from './Venue.model';
import generateId from '../middleware/IdGenerator.middleware';

@Table({ tableName: 'content_log' })
export default class ContentLog extends Model<ContentLog> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('ContentLog'),
  })
  id!: string;

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
    type: DataType.ENUM('Contact', 'Map', 'Content'),
    allowNull: false,
  })
  type!: string;

  @Column({
    type: DataType.ENUM('X', 'Email', 'Facebook', 'Instagram', 'Phone', 'Website', 'Whatsapp'),
    allowNull: true,
  })
  contactType!: string;

  @Column({
    type: DataType.ENUM('Bank', 'Restaurant', 'Park', 'Embassy', 'Hotel', 'Office'),
    allowNull: true,
  })
  mapType!: string;

  @Column({
    allowNull: true,
  })
  content_id!: string;


  @BelongsTo(() => Venue)
  venue!: Venue;
}