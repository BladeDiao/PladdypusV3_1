import { Table, Column, Model, DataType, ForeignKey, BelongsTo} from 'sequelize-typescript';
import generateId from '../middleware/IdGenerator.middleware';
import Area from './Area.model';
import Adv from './Adv.model';

export interface AreaAdvEntryCreationAttributes {
  area_id: string;
  adv_id: string;
  targetScope: 'all' | 'partial';
}

@Table({ tableName: 'area_adv_entry'})
export default class AreaAdvEntry extends Model<AreaAdvEntry, AreaAdvEntryCreationAttributes> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('AreaAdvEntry'),
  })
  id!: string;

  @ForeignKey(() => Area)
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  area_id!: string;

  @ForeignKey(() => Adv)
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  adv_id!: string;

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
    type: DataType.ENUM('all', 'partial'),
    allowNull: false,
    defaultValue: 'all'
  })
  targetScope!: 'all'| 'partial';

  @BelongsTo(() => Adv)
  adv!: Adv;

  @BelongsTo(() => Area)
  area!: Area;
}
