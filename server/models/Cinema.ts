import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IScreen {
  screenId: string;
  name: string;
  screenType: 'Standard' | 'IMAX 3D' | 'Dolby Cinema' | 'VIP Recliner' | '4DX';
  totalSeats: number;
  rows: number;
  cols: number;
}

export interface ICinema extends Document {
  name: string;
  address: string;
  city: string;
  screens: IScreen[];
  amenities: string[];
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScreenSchema = new Schema<IScreen>(
  {
    screenId: { type: String, required: true },
    name: { type: String, required: true },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX 3D', 'Dolby Cinema', 'VIP Recliner', '4DX'],
      default: 'Standard',
    },
    totalSeats: { type: Number, default: 60 },
    rows: { type: Number, default: 6 },
    cols: { type: Number, default: 10 },
  },
  { _id: false }
);

const CinemaSchema = new Schema<ICinema>(
  {
    name: {
      type: String,
      required: [true, 'Cinema name is required'],
      trim: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Cinema address is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    screens: {
      type: [ScreenSchema],
      default: [],
    },
    amenities: {
      type: [String],
      default: ['Air Conditioning', '4K Laser Projection', 'Dolby Atmos', 'Reserved Seating'],
    },
    phone: {
      type: String,
      default: '+1 (800) 555-FILM',
    },
  },
  {
    timestamps: true,
  }
);

export const Cinema: Model<ICinema> = mongoose.models.Cinema || mongoose.model<ICinema>('Cinema', CinemaSchema);
