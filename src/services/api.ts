import axios from 'axios';
import {
  IMovie,
  ICinema,
  IShowtime,
  IBooking,
  IAdminStats,
} from '../types/index.ts';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle unauthorized errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token is invalid, clear token
      const isMeEndpoint = error.config?.url?.includes('/auth/me');
      if (isMeEndpoint) {
        localStorage.removeItem('imovies_token');
        localStorage.removeItem('imovies_user');
      }
    }
    return Promise.reject(error);
  }
);

export const movieApi = {
  getMovies: (params?: { search?: string; genre?: string; status?: string; featured?: boolean; sort?: string }) =>
    api.get<{ success: boolean; count: number; movies: IMovie[] }>('/movies', { params }),

  getMovieById: (id: string) =>
    api.get<{ success: boolean; movie: IMovie; showtimes: IShowtime[] }>(`/movies/${id}`),

  createMovie: (data: Partial<IMovie>) =>
    api.post<{ success: boolean; movie: IMovie }>('/movies', data),

  updateMovie: (id: string, data: Partial<IMovie>) =>
    api.put<{ success: boolean; movie: IMovie }>(`/movies/${id}`, data),

  deleteMovie: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/movies/${id}`),
};

export const cinemaApi = {
  getCinemas: (params?: { city?: string }) =>
    api.get<{ success: boolean; count: number; cinemas: ICinema[] }>('/cinemas', { params }),

  getCinemaById: (id: string) =>
    api.get<{ success: boolean; cinema: ICinema; showtimes: IShowtime[] }>(`/cinemas/${id}`),

  createCinema: (data: Partial<ICinema>) =>
    api.post<{ success: boolean; cinema: ICinema }>('/cinemas', data),
};

export const showtimeApi = {
  getShowtimes: (params?: { movieId?: string; cinemaId?: string; date?: string }) =>
    api.get<{ success: boolean; count: number; showtimes: IShowtime[] }>('/showtimes', { params }),

  getShowtimeSeats: (id: string) =>
    api.get<{
      success: boolean;
      showtimeId: string;
      movie: IMovie;
      cinema: ICinema;
      screenName: string;
      screenType: string;
      startTime: string;
      rows: number;
      cols: number;
      pricing: { standard: number; premium: number; vip: number };
      bookedSeats: string[];
      totalSeats: number;
      availableSeatsCount: number;
    }>(`/showtimes/${id}/seats`),

  createShowtime: (data: any) =>
    api.post<{ success: boolean; showtime: IShowtime }>('/showtimes', data),

  deleteShowtime: (id: string) =>
    api.delete<{ success: boolean; message: string }>(`/showtimes/${id}`),
};

export const bookingApi = {
  createBooking: (data: { showtimeId: string; requestedSeats: string[] }) =>
    api.post<{ success: boolean; message: string; booking: IBooking }>('/bookings', data),

  getMyBookings: () =>
    api.get<{ success: boolean; count: number; bookings: IBooking[] }>('/bookings/my'),

  getBookingById: (id: string) =>
    api.get<{ success: boolean; booking: IBooking }>(`/bookings/${id}`),

  cancelBooking: (id: string) =>
    api.post<{ success: boolean; message: string; booking: IBooking }>(`/bookings/${id}/cancel`),
};

export const adminApi = {
  getStats: () =>
    api.get<{ success: boolean; stats: IAdminStats; recentBookings: any[] }>('/admin/stats'),

  getAllBookings: () =>
    api.get<{ success: boolean; count: number; bookings: IBooking[] }>('/admin/bookings'),

  triggerSeed: () =>
    api.post<{ success: boolean; message: string }>('/seed'),
};

export default api;
