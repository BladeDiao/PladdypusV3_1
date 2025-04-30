import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany} from 'sequelize-typescript';
import Content from './Content.model';
import Adv from './Adv.model';
import Venue from './Venue.model';
import generateId from '../middleware/IdGenerator.middleware';
import ArticleEntry from './ArticleEntry.model';

@Table({ tableName: 'content_entry'})
export default class ContentEntry extends Model<ContentEntry> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('ContentEntry'),
  })
  id!: string;

  @Column({
    type: DataType.ENUM('adv', 'venue', 'touchscreen'),
    allowNull: false,
  })
  ownerType!: 'adv'| 'venue' | 'touchscreen';

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  owner_id!: string;

  @ForeignKey(() => Content)
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  content_id!: string;

  @BelongsTo(() => Adv, { foreignKey: 'owner_id', constraints: false })
  adv!: Adv;

  @BelongsTo(() => Venue, { foreignKey: 'owner_id', constraints: false })
  venue!: Venue;

  @BelongsTo(() => Content)
  content!: Content;

  @HasMany(() => ArticleEntry)
  articleEntries!: ArticleEntry[];
}
