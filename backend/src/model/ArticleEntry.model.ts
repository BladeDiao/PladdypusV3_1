import { Table, Column, Model, DataType, ForeignKey, BelongsTo} from 'sequelize-typescript';
import generateId from '../middleware/IdGenerator.middleware';
import ContentEntry from './ContentEntry.model';
import Article from './Article.model';

@Table({ tableName: 'article_entry'})
export default class ArticleEntry extends Model< ArticleEntry > {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('ArticleEntry'),
  })
  id!: string;

  @ForeignKey(() => ContentEntry)
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  content_entry_id!: string;

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

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false, 
    allowNull: false,
  })
  masterEntry!: boolean;

  @BelongsTo(() => Article)
  article!: Article;

  @BelongsTo(() => ContentEntry)
  contentEntry!: ContentEntry;

}