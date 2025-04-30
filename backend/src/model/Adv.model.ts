import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, HasMany, AllowNull } from 'sequelize-typescript';
import { validity } from './Venue.model';
import generateId from '../middleware/IdGenerator.middleware';
import ContentEntry from './ContentEntry.model';
import AdvLog from './AdvLog.model';
import VenueAdvEntry from './VenueAdvEntry.model';
import AreaAdvEntry from './AreaAdvEntry.model';

interface Special {
  startDatetime?: Date;
  endDatetime?: Date;
  image?: string;
}

@Table({ tableName: 'adv' })
export default class Adv extends Model<Adv> {
  @Column({
    type: DataType.STRING(64),
    defaultValue: () => generateId('adv'),
    primaryKey: true,
  })
  id!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    validate: {
      len: [1, 64],
    },
  })
  name!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: true,
    validate: {
      len: [0, 64],
    },
  })
  alias!: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 9,
    },
  })
  permissionLevel?: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: [],
    validate: {
      isValidSpecials(value: any[]) {
        if (!Array.isArray(value)) {
          throw new Error('specials must be an array of objects');
        }
        value.forEach((item, index) => {
          if (typeof item !== 'object') {
            throw new Error(`specials[${index}] must be an object`);
          }

          if (item.startDatetime && !(item.startDatetime instanceof Date)) {
            throw new Error(`specials[${index}].startDatetime must be a Date`);
          }

          if (item.endDatetime && !(item.endDatetime instanceof Date)) {
            throw new Error(`specials[${index}].endDatetime must be a Date`);
          }

          if (item.image) {
            if (typeof item.image !== 'string') {
              throw new Error(`specials[${index}].image must be a string`);
            }
            if (item.image.length > 256) {
              throw new Error(`specials[${index}].image must be less than or equal to 256 characters`);
            }
          }
        });
      }
    }
  })
  specials?: Special[];

  @Column({
    type: DataType.STRING(256),
    validate: {
      len: [0, 256],
    }
  })
  image?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: { isActive: true, statusLogs: [] },
    validate: {
      isValidValidity(value: validity) {
        if (typeof value.isActive !== 'boolean') {
          throw new Error('validity.isActive must be a boolean');
        }
        if (!Array.isArray(value.statusLogs)) {
          throw new Error('validity.statusLogs must be an array');
        }
        value.statusLogs.forEach((log, index) => {
          if (!(log.date instanceof Date) && isNaN(Date.parse(log.date as any))) {
            throw new Error(`validity.statusLogs[${index}].date must be a valid Date`);
          }
          if (typeof log.status !== 'boolean') {
            throw new Error(`validity.statusLogs[${index}].status must be a boolean`);
          }
          if (typeof log.reason !== 'string') {
            throw new Error(`validity.statusLogs[${index}].reason must be a string`);
          }
          if (log.reason.length > 255) {
            throw new Error(`validity.statusLogs[${index}].reason must be less than or equal to 255 characters`);
          }
        });
      }
    }
  })
  validity?: validity;

  @HasMany(() => VenueAdvEntry)
  venueAdvEntry!: VenueAdvEntry;

  @HasMany(() => AreaAdvEntry)
  areaAdvEntry!: AreaAdvEntry;

  @HasOne(() => ContentEntry, { foreignKey: 'owner_id', constraints: false })
  contentEntry!: ContentEntry;

  @HasMany(() => AdvLog)
  advLog!: AdvLog;
}
