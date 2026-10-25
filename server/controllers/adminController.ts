import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { Movie } from '../models/Movie.ts';
import { Cinema } from '../models/Cinema.ts';
import { Showtime } from '../models/Showtime.ts';
import { Booking } from '../models/Booking.ts';
import { User } from '../models/User.ts';

export async function getAdminStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const [totalMovies, totalCinemas, totalShowtimes, totalBookings, totalUsers] = await Promise.all([
      Movie.countDocuments(),
      Cinema.countDocuments(),
      Showtime.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments(),
    ]);

    // Calculate revenue from confirmed bookings
    const confirmedBookings = await Booking.find({ bookingStatus: 'confirmed' });
    const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

    const recentBookings = await Booking.find()
      .populate('movie', 'title')
      .populate('user', 'name email')
      .populate('cinema', 'name')
      .sort({ createdAt: -1 })
      .limit(8);

    res.status(200).json({
      success: true,
      stats: {
        totalMovies,
        totalCinemas,
        totalShowtimes,
        totalBookings,
        totalUsers,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalTicketsSold,
      },
      recentBookings,
    });
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin stats',
    });
  }
}

export async function getAllBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookings = await Booking.find()
      .populate('movie', 'title posterUrl')
      .populate('user', 'name email')
      .populate('cinema', 'name city')
      .populate('showtime', 'screenName startTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch all bookings',
    });
  }
}
