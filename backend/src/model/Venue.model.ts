import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasOne, HasMany } from 'sequelize-typescript';
import ContentEntry from './ContentEntry.model';
import generateId from '../middleware/IdGenerator.middleware';
import AdvLog from './AdvLog.model';
import Area from './Area.model';
import VenueLog from './VenueLog.model';
import VenueAdvEntry from './VenueAdvEntry.model';

interface statusLog {
  date: Date;
  status: boolean;
  reason: string;
}

export interface validity {
  isActive: boolean;
  statusLogs: statusLog[];
}

interface GeoLocation {
  latitude: number;
  longitude: number;
  defaultZoom: number;
}

interface Landing {
  geoLocation?: GeoLocation;
  logoImage?: string;
  homeImages?: string[];
  homeTitle?: string;
  homeDescription?: string;
  serviceImages?: string[];
  serviceTitle?: string;
  serviceDescription?: string;
  quickLinks?: string[];
}

interface theme {
  color?: string;
  font?: string;
  fontColor?: string;
}

interface ContactField {
  value: string;
  description: string;
}

export interface Contact {
  phone?: ContactField;
  email?: ContactField;
  whatsapp?: ContactField;
  website?: ContactField;
  serviceDirectory?: ContactField;
  facebook?: ContactField;
  instagram?: ContactField;
  X?: ContactField;
}

@Table({ tableName: 'venue' })
export default class Venue extends Model<Venue> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('venue'),
  })
  id!: string;

  @ForeignKey(() => Area)
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
  })
  area_id!: string;

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
    type: DataType.STRING(64),
    validate: {
      len: [0, 64],
    },
  })
  alias?: string;

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
    defaultValue: {},
    validate: {
      isValidTheme(value: theme) {
        if (value.color) {
          if (typeof value.color !== 'string') {
            throw new Error('theme.color must be a string');
          }
          if (!/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value.color)) {
            throw new Error('theme.color must be a valid HEX color in the format #rrggbb');
          }
        }
        if (value.font) {
          if (typeof value.font !== 'string') {
            throw new Error('theme.font must be a string');
          }
          if (value.font.length > 50) {
            throw new Error('theme.font must be less than or equal to 50 characters');
          }
        }
        if (value.fontColor) {
          if (typeof value.fontColor !== 'string') {
            throw new Error('theme.fontColor must be a string');
          }
          if (!/^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(value.fontColor)) {
            throw new Error('theme.fontColor must be a valid HEX color in the format #rrggbb');
          }
        }
      }
    }
  })
  theme?: theme;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
    validate: {
      isValidLanding(value: Landing) {
        if (value.logoImage) {
          if (typeof value.logoImage !== 'string') {
            throw new Error('landing.logoImage must be a string');
          }
          if (value.logoImage.length > 255) {
            throw new Error('landing.logoImage must be less than or equal to 255 characters');
          }
        }
        if (value.homeImages) {
          if (!Array.isArray(value.homeImages)) {
            throw new Error('landing.homeImages must be an array of strings');
          }
          if (value.homeImages.length > 10) {
            throw new Error('landing.homeImages cannot have more than 10 items');
          }
          value.homeImages.forEach((image: string, index: number) => {
            if (typeof image !== 'string') {
              throw new Error(`landing.homeImages[${index}] must be a string`);
            }
            if (image.length > 255) {
              throw new Error(`landing.homeImages[${index}] must be less than or equal to 255 characters`);
            }
          });
        }
        if (value.homeTitle) {
          if (typeof value.homeTitle !== 'string') {
            throw new Error('landing.homeTitle must be a string');
          }
          if (value.homeTitle.length > 255) {
            throw new Error('landing.homeTitle must be less than or equal to 255 characters');
          }
        }
        if (value.homeDescription) {
          if (typeof value.homeDescription !== 'string') {
            throw new Error('landing.homeDescription must be a string');
          }
          if (value.homeDescription.length > 2048) {
            throw new Error('landing.homeDescription must be less than or equal to 1024 characters');
          }
        }
        if (value.serviceImages) {
          if (!Array.isArray(value.serviceImages)) {
            throw new Error('landing.serviceImages must be an array of strings');
          }
          if (value.serviceImages.length > 10) {
            throw new Error('landing.serviceImages cannot have more than 10 items');
          }
          value.serviceImages.forEach((image: string, index: number) => {
            if (typeof image !== 'string') {
              throw new Error(`landing.serviceImages[${index}] must be a string`);
            }
            if (image.length > 255) {
              throw new Error(`landing.serviceImages[${index}] must be less than or equal to 255 characters`);
            }
          });
        }
        if (value.serviceTitle) {
          if (typeof value.serviceTitle !== 'string') {
            throw new Error('landing.serviceTitle must be a string');
          }
          if (value.serviceTitle.length > 255) {
            throw new Error('landing.serviceTitle must be less than or equal to 255 characters');
          }
        }
        if (value.serviceDescription) {
          if (typeof value.serviceDescription !== 'string') {
            throw new Error('landing.serviceDescription must be a string');
          }
          if (value.serviceDescription.length > 2048) {
            throw new Error('landing.serviceDescription must be less than or equal to 1024 characters');
          }
        }
        if (value.quickLinks) {
          if (!Array.isArray(value.quickLinks)) {
            throw new Error('landing.quickLinks must be an array of strings');
          }
          if (value.quickLinks.length > 10) {
            throw new Error('landing.quickLinks cannot have more than 10 items');
          }
          value.quickLinks.forEach((link: string, index: number) => {
            if (typeof link !== 'string') {
              throw new Error(`landing.quickLinks[${index}] must be a string`);
            }
            if (link.length > 255) {
              throw new Error(`landing.quickLinks[${index}] must be less than or equal to 255 characters`);
            }
          });
        }
        if (value.geoLocation) {
          if (typeof value.geoLocation.latitude !== 'number') {
            throw new Error('landing.geoLocation.latitude must be a number');
          }
          if (typeof value.geoLocation.longitude !== 'number') {
            throw new Error('landing.geoLocation.longitude must be a number');
          }
          if (typeof value.geoLocation.defaultZoom !== 'number') {
            throw new Error('landing.geoLocation.defaultZoom must be a number');
          }
        }
      }
    }
  })
  landing?: Landing;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
    validate: {
      isValidContacts(value: Contact) {
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        const validateContactField = (field: ContactField, fieldName: string) => {
          if (field.value) {
            if (typeof field.value !== 'string') {
              throw new Error(`contacts.${fieldName}.value must be a string`);
            }
            if (field.value.length > 100) {
              throw new Error(`contacts.${fieldName}.value must be less than or equal to 100 characters`);
            }
          }
          if (field.description) {
            if (typeof field.description !== 'string') {
              throw new Error(`contacts.${fieldName}.description must be a string`);
            }
            if (field.description.length > 255) {
              throw new Error(`contacts.${fieldName}.description must be less than or equal to 255 characters`);
            }
          }
  
          switch (fieldName) {
            case 'email':
              if (field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
                throw new Error('contacts.email.value must be a valid email address');
              }
              break;
            case 'phone':
              if (field.value && !/^\+?[0-9]\d{1,14}$/.test(field.value)) {
                throw new Error(`contacts.${fieldName}.value must be a valid phone number`);
              }
              break;
            case 'whatsapp':
              if (field.value && !/^\+?[0-9]\d{1,14}$/.test(field.value)) {
                throw new Error(`contacts.${fieldName}.value must be a valid phone number`);
              }
              break;
            case 'website':
            case 'serviceDirectory':
            case 'facebook':
            case 'instagram':
            case 'X':
              if (field.value) {
                if (field.value.length > 255) {
                  throw new Error(`contacts.${fieldName}.value must be less than or equal to 255 characters`);
                }
                if (!urlRegex.test(field.value)) {
                  throw new Error(`contacts.${fieldName}.value must be a valid URL`);
                }
              }
              break;
          }
        };
  
        Object.entries(value).forEach(([key, field]) => {
          validateContactField(field, key);
        });
      }
    }
  })
  contact?: Contact;

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

  @BelongsTo(() => Area)
  area!: Area;

  @HasOne(() => ContentEntry, { foreignKey: 'owner_id', constraints: false })
  contentEntry!: ContentEntry;

  @HasMany(() => AdvLog)
  advLog!: AdvLog;

  @HasMany(() => VenueAdvEntry)
  VenueAdvEntry!: VenueAdvEntry;

  @HasMany(() => VenueLog)
  venueLog!: VenueLog;
}
