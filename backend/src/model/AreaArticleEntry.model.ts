import { Table, Column, Model, DataType, ForeignKey, BelongsTo} from 'sequelize-typescript';
import generateId from '../middleware/IdGenerator.middleware';
import Area from './Area.model';
import Article from './Article.model';

export interface AreaArticleEntryCreationAttributes {
  area_id: string;
  article_id: string;
}

@Table({ tableName: 'area_article_entry'})
export default class AreaArticleEntry extends Model<AreaArticleEntry, AreaArticleEntryCreationAttributes> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('AreaArticleEntry'),
  })
  id!: string;

  @ForeignKey(() => Area)
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  area_id!: string;

  @ForeignKey(() => Article)
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  article_id!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  startTime!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endTime!: Date;

  @BelongsTo(() => Article)
  article!: Article;

  @BelongsTo(() => Area)
  area!: Area;
}
