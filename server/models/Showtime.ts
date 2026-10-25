import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ITemporaryReservation {
  seatNumber: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

export interface IShowtime extends Document {
  movie: mongoose.Types.ObjectId;
  cinema: mongoose.Types.ObjectId;
  screenId: string;
  screenName: string;
  screenType: string;
  startTime: Date;
  endTime: Date;
  pricing: {
    standard: number;
    premium: number;
    vip: number;
  };
  rows: number;
  cols: number;
  bookedSeats: string[];
  temporaryReservations: ITemporaryReservation[];
  createdAt: Date;
  updatedAt: Date;
}

const TemporaryReservationSchema = new Schema<ITemporaryReservation>(
  {
    seatNumber: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { _id: false }
);

const ShowtimeSchema = new Schema<IShowtime>(
  {
    movie: {
      type: Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie reference is required'],
      index: true,
    },
    cinema: {
      type: Schema.Types.ObjectId,
      ref: 'Cinema',
      required: [true, 'Cinema reference is required'],
      index: true,
    },
    screenId: {
      type: String,
      required: true,
    },
    screenName: {
      type: String,
      default: 'Screen 1',
    },
    screenType: {
      type: String,
      default: 'Standard',
    },
    startTime: {
      type: Date,
      required: [true, 'Show start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'Show end time is required'],
    },
    pricing: {
      standard: { type: Number, default: 12.5 },
      premium: { type: Number, default: 16.5 },
      vip: { type: Number, default: 22.0 },
    },
    rows: {
      type: Number,
      default: 6,
    },
    cols: {
      type: Number,
      default: 10,
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
    temporaryReservations: {
      type: [TemporaryReservationSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying showtimes by cinema, movie, and date range
ShowtimeSchema.index({ movie: 1, cinema: 1, startTime: 1 });

export const Showtime: Model<IShowtime> =
  mongoose.models.Showtime || mongoose.model<IShowtime>('Showtime', ShowtimeSchema);
