import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Venue from './Venue.model';
import generateId from '../middleware/IdGenerator.middleware';

@Table({ tableName: 'venue_log' })
export default class VenueLog extends Model<VenueLog> {
	@Column({
		type: DataType.STRING(64),
		primaryKey: true,
		defaultValue: () => generateId('VenueLog'),
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
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue:1
  })
  duration!: number;

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

	@BelongsTo(() => Venue)
  venue!: Venue;
}
