export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  createdAt?: string;
}

export interface IMovie {
  _id: string;
  title: string;
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  genre: string[];
  duration: number; // in minutes
  releaseDate: string;
  language: string;
  rating: number;
  certificate: string;
  cast: string[];
  director: string;
  trailerUrl?: string;
  status: 'now_showing' | 'upcoming';
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IScreen {
  screenId: string;
  name: string;
  screenType: 'Standard' | 'IMAX 3D' | 'Dolby Cinema' | 'VIP Recliner' | '4DX';
  totalSeats: number;
  rows: number;
  cols: number;
}

export interface ICinema {
  _id: string;
  name: string;
  address: string;
  city: string;
  screens: IScreen[];
  amenities: string[];
  phone?: string;
}

export interface IShowtime {
  _id: string;
  movie: IMovie | string;
  cinema: ICinema | string;
  screenId: string;
  screenName: string;
  screenType: string;
  startTime: string;
  endTime: string;
  pricing: {
    standard: number;
    premium: number;
    vip: number;
  };
  rows: number;
  cols: number;
  bookedSeats: string[];
}

export interface IBookedSeatItem {
  seatNumber: string;
  tier: 'standard' | 'premium' | 'vip';
  price: number;
}

export interface IBooking {
  _id: string;
  bookingReference: string;
  user: IUser | string;
  showtime: IShowtime | string;
  movie: IMovie;
  cinema: ICinema;
  screenName: string;
  showStartTime: string;
  seats: IBookedSeatItem[];
  totalPrice: number;
  bookingStatus: 'confirmed' | 'cancelled';
  paymentMode: string;
  paymentStatus: 'completed' | 'refunded';
  createdAt: string;
}

export interface IAdminStats {
  totalMovies: number;
  totalCinemas: number;
  totalShowtimes: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  totalTicketsSold: number;
}
