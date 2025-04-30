import { Table, Column, Model, DataType, HasOne, HasMany } from 'sequelize-typescript';
import ContentEntry from './ContentEntry.model';
import generateId from '../middleware/IdGenerator.middleware';
import { Contact } from './Venue.model';
import ContentLog from './ContentLog.model';

/** 
 * LayoutStyle used to determine how content is rendered.
 */
export enum LayoutStyle {
  OVERLAY = 'overlay',
  SIDEBAR = 'sidebar',
  NONE = 'none'
}

/**
 * LocationType is used for categorizing map locations into a true classification.
 */
export enum LocationType {
  NATURAL_ATTRACTION = 'natural_attraction',
  HISTORICAL_SITE = 'historical_site',
  CULTURAL_ATTRACTION = 'cultural_attraction',
  RELIGIOUS_SITE = 'religious_site',
  ADVENTURE_ACTIVITIES = 'adventure_activities',
  RESTAURANT = 'restaurant',
  SHOPPING = 'shopping',
  ENTERTAINMENT = 'entertainment',
  ACCOMMODATION = 'accommodation',
  TRANSPORT = 'transport',
  BANK_ATM = 'bank_atm',
  HEALTHCARE = 'healthcare',
  NIGHTLIFE = 'nightlife',
  GUIDED_TOUR = 'guided_tour',
  MARKET = 'market',
  OTHER = 'other'
}


/**
 * GeoLocation interface represents a geographical point with additional descriptive details.
 */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  name: string;
  description: string;
  type: LocationType;
}

@Table({ tableName: 'content' })
export default class Content extends Model<Content> {
  @Column({
    type: DataType.STRING(64),
    primaryKey: true,
    defaultValue: () => generateId('content'),
  })
  id!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isLeaf!: boolean;

  @Column({
    type: DataType.ENUM(...Object.values(LayoutStyle)),
    allowNull: false,
  })
  layoutStyle!: LayoutStyle;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  visible!: boolean;

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    validate: {
      len: [1, 64],
    },
  })
  editable!: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING(64)),
    allowNull: false,
    defaultValue: [],
  })
  attributes!: string[];

  @Column({
    type: DataType.STRING(64),
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.STRING(128),
    allowNull: true,
    validate: {
      len: [0, 128],
    },
  })
  description?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    defaultValue: {},
    validate: {
      isValidContacts(value: Contact) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        if (value.email) {
          if (typeof value.email.value !== 'string') {
            throw new Error('contacts.email.value must be a string');
          }
          if (value.email.value.length > 100) {
            throw new Error('contacts.email.value must be less than or equal to 100 characters');
          }
          if (!emailRegex.test(value.email.value)) {
            throw new Error('contacts.email.value must be a valid email address');
          }
        }
        if (value.phone) {
          if (typeof value.phone.value !== 'string') {
            throw new Error('contacts.phone.value must be a string');
          }
          if (value.phone.value.length > 100) {
            throw new Error('contacts.phone.value must be less than or equal to 100 characters');
          }
          if (!phoneRegex.test(value.phone.value)) {
            throw new Error('contacts.phone.value must be a valid phone number');
          }
        }
        if (value.whatsapp) {
          if (typeof value.whatsapp.value !== 'string') {
            throw new Error('contacts.whatsapp.value must be a string');
          }
          if (value.whatsapp.value.length > 100) {
            throw new Error('contacts.whatsapp.value must be less than or equal to 100 characters');
          }
          if (!phoneRegex.test(value.whatsapp.value)) {
            throw new Error('contacts.whatsapp.value must be a valid phone number');
          }
        }
        if (value.website) {
          if (typeof value.website.value !== 'string') {
            throw new Error('contacts.website.value must be a string');
          }
          if (value.website.value.length > 255) {
            throw new Error('contacts.website.value must be less than or equal to 255 characters');
          }
          if (!urlRegex.test(value.website.value)) {
            throw new Error('contacts.website.value must be a valid URL');
          }
        }
        if (value.facebook) {
          if (typeof value.facebook.value !== 'string') {
            throw new Error('contacts.facebook.value must be a string');
          }
          if (value.facebook.value.length > 255) {
            throw new Error('contacts.facebook.value must be less than or equal to 255 characters');
          }
        }
        if (value.instagram) {
          if (typeof value.instagram.value !== 'string') {
            throw new Error('contacts.instagram.value must be a string');
          }
          if (value.instagram.value.length > 255) {
            throw new Error('contacts.instagram.value must be less than or equal to 255 characters');
          }
        }
        if (value.X) {
          if (typeof value.X.value !== 'string') {
            throw new Error('contacts.X.value must be a string');
          }
          if (value.X.value.length > 255) {
            throw new Error('contacts.X.value must be less than or equal to 255 characters');
          }
        }
      }
    }
  })
  contact?: Contact;

  @Column({
    type: DataType.STRING(4096),
    allowNull: true,
    validate: {
      len: [0, 4096],
    },
  })
  mainText?: string;

  @Column({
    type: DataType.STRING(256),
    allowNull: true
  })
  searchTags?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  geoLocation?: GeoLocation;

  @Column({
    type: DataType.STRING(1024),
    allowNull: true,
    validate: {
      len: [0, 1024],
    },
  })
  iconImage?: string;

  @Column({
    type: DataType.STRING(1024),
    allowNull: true,
    validate: {
      len: [0, 1024],
    },
  })
  bannerImage?: string;

  @Column({
    type: DataType.ARRAY(DataType.STRING(1024)),
    allowNull: true,
    validate: {
      isValidCarouselImages(value: string[]) {
        if (!Array.isArray(value)) {
          throw new Error('carouselImages must be an array of strings');
        }
        value.forEach((img, index) => {
          if (typeof img !== 'string') {
            throw new Error(`carouselImages[${index}] must be a string`);
          }
          if (img.length > 1024) {
            throw new Error(`carouselImages[${index}] must be less than or equal to 1024 characters`);
          }
        });
      }
    }
  })
  carouselImages?: string[];

  @HasMany(() => ContentEntry)
  contentEntry!: ContentEntry;
}

// Define the base interface for Content attributes
export interface ContentAttributes {
  id: string;
  isLeaf: boolean;
  layoutStyle: LayoutStyle;
  visible: boolean;
  editable: string;
  attributes: string[];
  name?: string;
  description?: string;
  contact?: Contact;
  mainText?: string;
  geoLocation?: GeoLocation;
  iconImage?: string;
  bannerImage?: string;
  carouselImages?: string[];
  searchTags?: string;
}

// Define ContentWithAttributes using type overwriting
export type ContentWithAttributes = Omit<ContentAttributes, 'attributes'> & {
  attributes: ContentWithAttributes[];
};
