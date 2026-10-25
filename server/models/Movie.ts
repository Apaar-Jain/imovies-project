import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  genre: string[];
  duration: number; // in minutes
  releaseDate: string;
  language: string;
  rating: number; // e.g. 8.8
  certificate: string; // e.g. 'PG-13', 'R'
  cast: string[];
  director: string;
  trailerUrl?: string;
  status: 'now_showing' | 'upcoming';
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MovieSchema = new Schema<IMovie>(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Movie poster image URL is required'],
    },
    backdropUrl: {
      type: String,
      default: '',
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
      min: [1, 'Duration must be at least 1 minute'],
    },
    releaseDate: {
      type: String,
      required: [true, 'Release date is required'],
    },
    language: {
      type: String,
      default: 'English',
    },
    rating: {
      type: Number,
      default: 8.0,
      min: [0, 'Rating cannot be less than 0'],
      max: [10, 'Rating cannot exceed 10'],
    },
    certificate: {
      type: String,
      default: 'PG-13',
    },
    cast: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: 'Director',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['now_showing', 'upcoming'],
      default: 'now_showing',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Movie: Model<IMovie> = mongoose.models.Movie || mongoose.model<IMovie>('Movie', MovieSchema);
