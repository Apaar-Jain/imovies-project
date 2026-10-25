import { Request, Response } from 'express';
import { Showtime } from '../models/Showtime.ts';
import { Movie } from '../models/Movie.ts';

export async function getShowtimes(req: Request, res: Response): Promise<void> {
  try {
    const { movieId, cinemaId, date } = req.query;

    const query: any = {};

    if (movieId) {
      query.movie = movieId;
    }

    if (cinemaId) {
      query.cinema = cinemaId;
    }

    if (date && typeof date === 'string') {
      // e.g. date = "2026-10-25"
      const startOfDay = new Date(`${date}T00:00:00.000Z`);
      const endOfDay = new Date(`${date}T23:59:59.999Z`);
      query.startTime = { $gte: startOfDay, $lte: endOfDay };
    } else {
      // By default show upcoming shows from now onwards
      query.startTime = { $gte: new Date(Date.now() - 30 * 60 * 1000) }; // Include shows started within past 30m
    }

    const showtimes = await Showtime.find(query)
      .populate('movie', 'title posterUrl duration rating genre certificate')
      .populate('cinema', 'name city address screens amenities')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: showtimes.length,
      showtimes,
    });
  } catch (error: any) {
    console.error('Error fetching showtimes:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch showtimes',
    });
  }
}

export async function getShowtimeById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const showtime = await Showtime.findById(id)
      .populate('movie')
      .populate('cinema');

    if (!showtime) {
      res.status(404).json({ success: false, message: 'Showtime not found' });
      return;
    }

    res.status(200).json({
      success: true,
      showtime,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve showtime',
    });
  }
}

export async function getShowtimeSeats(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const showtime = await Showtime.findById(id)
      .populate('movie', 'title duration certificate posterUrl')
      .populate('cinema', 'name address city');

    if (!showtime) {
      res.status(404).json({ success: false, message: 'Showtime not found' });
      return;
    }

    // Clean up expired temporary reservations
    const now = new Date();
    const activeReservations = (showtime.temporaryReservations || []).filter(
      (r) => new Date(r.expiresAt) > now
    );

    const temporarilyReservedSeats = activeReservations.map((r) => r.seatNumber);

    res.status(200).json({
      success: true,
      showtimeId: showtime._id,
      movie: showtime.movie,
      cinema: showtime.cinema,
      screenName: showtime.screenName,
      screenType: showtime.screenType,
      startTime: showtime.startTime,
      rows: showtime.rows || 6,
      cols: showtime.cols || 10,
      pricing: showtime.pricing || { standard: 12.5, premium: 16.5, vip: 22.0 },
      bookedSeats: showtime.bookedSeats || [],
      temporarilyReservedSeats,
      totalSeats: (showtime.rows || 6) * (showtime.cols || 10),
      availableSeatsCount:
        (showtime.rows || 6) * (showtime.cols || 10) -
        (showtime.bookedSeats ? showtime.bookedSeats.length : 0),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to load seating configuration',
    });
  }
}

export async function createShowtime(req: Request, res: Response): Promise<void> {
  try {
    const {
      movieId,
      cinemaId,
      screenId,
      screenName,
      screenType,
      startTime,
      pricing,
      rows,
      cols,
    } = req.body;

    if (!movieId || !cinemaId || !startTime) {
      res.status(400).json({
        success: false,
        message: 'movieId, cinemaId, and startTime are required',
      });
      return;
    }

    const movie = await Movie.findById(movieId);
    if (!movie) {
      res.status(400).json({ success: false, message: 'Movie does not exist' });
      return;
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + (movie.duration + 20) * 60 * 1000); // 20 min buffer for cinema turnover

    const showtime = await Showtime.create({
      movie: movieId,
      cinema: cinemaId,
      screenId: screenId || 'SCR-1',
      screenName: screenName || 'Screen 1',
      screenType: screenType || 'Standard',
      startTime: start,
      endTime: end,
      pricing: pricing || { standard: 12.5, premium: 16.5, vip: 22.0 },
      rows: rows || 6,
      cols: cols || 10,
      bookedSeats: [],
    });

    res.status(201).json({
      success: true,
      message: 'Showtime scheduled successfully',
      showtime,
    });
  } catch (error: any) {
    console.error('Error creating showtime:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to schedule showtime',
    });
  }
}

export async function deleteShowtime(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const showtime = await Showtime.findByIdAndDelete(id);

    if (!showtime) {
      res.status(404).json({ success: false, message: 'Showtime not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Showtime removed successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete showtime',
    });
  }
}
