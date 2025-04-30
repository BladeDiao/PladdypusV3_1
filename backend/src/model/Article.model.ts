import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import generateId from '../middleware/IdGenerator.middleware';
import ArticleEntry from './ArticleEntry.model';
import { validity } from './Venue.model';
import AreaArticleEntry from './AreaArticleEntry.model';

interface Paragraphs {
  type?: string;
  detail?: string;
}

@Table({ tableName: 'article' })
export default class Article extends Model<Article> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('article'),
  })
  id!: string;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 64],
    },
  })
  name!: string;

  @Column({
    type: DataType.STRING(512),
    allowNull: true,
    validate: {
      len: [0, 512],
    },
  })
  image!: string;

  @Column({
    type: DataType.STRING(512),
    allowNull: true,
    validate: {
      len: [0, 512],
    },
  })
  description!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: [],
    validate: {
      isValidParagraphs(value: Paragraphs[]) {
        if (!Array.isArray(value)) {
          throw new Error('paragraphs must be an array of dictionaries');
        }
        value.forEach((item, index) => {
          if (typeof item !== 'object') {
            throw new Error(`paragraphs[${index}] must be an object`);
          }
          const validTypes = ['text', 'image', 'carousel', 'video'];
          if (item.type && !validTypes.includes(item.type)) {
            throw new Error(
              `paragraphs[${index}].type must be one of 'text', 'image', 'carousel', 'video'`
            );
          }
          if (item.type === 'carousel') {
            if (
              !Array.isArray(item.detail) ||
              !item.detail.every((detail) => typeof detail === 'string')
            ) {
              throw new Error(
                `paragraphs[${index}].detail must be an array of strings for 'carousel' type`
              );
            }
          } else {
            if (item.detail && typeof item.detail !== 'string') {
              throw new Error(`paragraphs[${index}].detail must be a string`);
            }
          }
          if (item.detail && typeof item.detail === 'string' && item.detail.length > 4096) {
            throw new Error(
              `paragraphs[${index}].detail must be less than or equal to 4096 characters`
            );
          }
        });
      },
    },
  })
  paragraphs?: Paragraphs[];

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
            throw new Error(
              `validity.statusLogs[${index}].reason must be less than or equal to 255 characters`
            );
          }
        });
      },
    },
  })
  validity?: validity;

  @HasMany(() => ArticleEntry)
  articleEntry!: ArticleEntry;

  @HasMany(() => AreaArticleEntry)
  AreaArticleEntry!: AreaArticleEntry;
}
