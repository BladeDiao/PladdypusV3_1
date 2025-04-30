import { Table, Column, Model, DataType, HasMany, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Venue from './Venue.model';
import Content from './Content.model';
import generateId from '../middleware/IdGenerator.middleware';
import AreaAdvEntry from './AreaAdvEntry.model';
import AreaArticleEntry from './AreaArticleEntry.model';

@Table({ tableName: 'area' })
export default class Area extends Model<Area> {
  @Column({
    type: DataType.STRING(32),
    primaryKey: true,
    defaultValue: () => generateId('area', 32),
  })
  id!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    unique: true,
  })
  name!: string;

  @ForeignKey(() => Content)
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  content_id!: string;

  @HasMany(() => Venue)
  venue!: Venue;

  @HasMany(() => AreaAdvEntry)
  AreaAdvEntry!: AreaAdvEntry;

  @HasMany(() => AreaArticleEntry)
  AreaArticleEntry!: AreaArticleEntry;

  @BelongsTo(() => Content)
  content!: Content;
}