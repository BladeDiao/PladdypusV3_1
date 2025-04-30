import { Table, Column, Model, DataType, ForeignKey, BelongsTo} from 'sequelize-typescript';
import Adv from './Adv.model';
import generateId from '../middleware/IdGenerator.middleware';
import Venue from './Venue.model';

@Table({ tableName: 'venue_adv_entry'})
export default class VenueAdvEntry extends Model<VenueAdvEntry> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('VenueAdvEntry'),
  })
  id!: string;

  @ForeignKey(() => Venue)
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  venue_id!: string;

  @ForeignKey(() => Adv)
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  adv_id!: string;

  @BelongsTo(() => Adv)
  adv!: Adv;

  @BelongsTo(() => Venue)
  venue!: Venue;
}
