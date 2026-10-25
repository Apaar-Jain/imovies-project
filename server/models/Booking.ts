import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBookedSeatItem {
  seatNumber: string;
  tier: 'standard' | 'premium' | 'vip';
  price: number;
}

export interface IBooking extends Document {
  bookingReference: string;
  user: mongoose.Types.ObjectId;
  showtime: mongoose.Types.ObjectId;
  movie: mongoose.Types.ObjectId;
  cinema: mongoose.Types.ObjectId;
  screenName: string;
  showStartTime: Date;
  seats: IBookedSeatItem[];
  totalPrice: number;
  bookingStatus: 'confirmed' | 'cancelled';
  paymentMode: string;
  paymentStatus: 'completed' | 'refunded';
  createdAt: Date;
  updatedAt: Date;
}

const BookedSeatItemSchema = new Schema<IBookedSeatItem>(
  {
    seatNumber: { type: String, required: true },
    tier: {
      type: String,
      enum: ['standard', 'premium', 'vip'],
      default: 'standard',
    },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    showtime: {
      type: Schema.Types.ObjectId,
      ref: 'Showtime',
      required: true,
      index: true,
    },
    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
    },
    cinema: {
      type: Schema.Types.ObjectId,
      ref: 'Cinema',
      required: true,
    },
    screenName: {
      type: String,
      default: 'Main Cinema Screen',
    },
    showStartTime: {
      type: Date,
      required: true,
    },
    seats: {
      type: [BookedSeatItemSchema],
      required: true,
      validate: [
        (val: IBookedSeatItem[]) => val && val.length > 0,
        'Booking must have at least one seat',
      ],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    bookingStatus: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed',
      index: true,
    },
    paymentMode: {
      type: String,
      default: 'demo_instant_checkout',
    },
    paymentStatus: {
      type: String,
      enum: ['completed', 'refunded'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

export const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
