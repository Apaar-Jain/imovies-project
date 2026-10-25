import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { Showtime } from '../models/Showtime.ts';
import { Booking, IBookedSeatItem } from '../models/Booking.ts';

// Helper to determine tier from row letter
function getSeatTier(seatNumber: string, totalRows: number): 'vip' | 'premium' | 'standard' {
  const rowLetter = seatNumber.charAt(0).toUpperCase();
  const rowIndex = rowLetter.charCodeAt(0) - 65; // A=0, B=1, ...

  if (rowIndex <= 1) {
    return 'vip';
  } else if (rowIndex <= Math.floor(totalRows / 2)) {
    return 'premium';
  } else {
    return 'standard';
  }
}

export async function createBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { showtimeId, requestedSeats } = req.body;

    if (!showtimeId || !requestedSeats || !Array.isArray(requestedSeats) || requestedSeats.length === 0) {
      res.status(400).json({
        success: false,
        message: 'showtimeId and a non-empty array of requestedSeats are required',
      });
      return;
    }

    // Sanitize seat names and check for duplicates in request
    const seatNumbers: string[] = Array.from(
      new Set(requestedSeats.map((s: string) => String(s).trim().toUpperCase()))
    );

    if (seatNumbers.length !== requestedSeats.length) {
      res.status(400).json({
        success: false,
        message: 'Duplicate seats selected in your request',
      });
      return;
    }

    // Validate that showtime exists
    const showtime = await Showtime.findById(showtimeId)
      .populate('movie')
      .populate('cinema');

    if (!showtime) {
      res.status(404).json({ success: false, message: 'Showtime not found' });
      return;
    }

    // Verify showtime has not already ended
    const now = new Date();
    if (new Date(showtime.endTime) < now) {
      res.status(400).json({
        success: false,
        message: 'This showtime has already ended and cannot be booked',
      });
      return;
    }

    // ATOMIC RESERVATION TO PREVENT DOUBLE-BOOKING CONCURRENCY:
    // Update showtime ONLY IF none of seatNumbers are already in bookedSeats
    const updatedShowtime = await Showtime.findOneAndUpdate(
      {
        _id: showtime._id,
        bookedSeats: { $nin: seatNumbers },
      },
      {
        $addToSet: { bookedSeats: { $each: seatNumbers } },
      },
      { returnDocument: 'after' }
    );

    if (!updatedShowtime) {
      res.status(409).json({
        success: false,
        message:
          'One or more of the selected seats were just reserved by another customer. Please choose different seats.',
      });
      return;
    }

    // Calculate server-side ticket pricing safely
    const pricing = showtime.pricing || { standard: 12.5, premium: 16.5, vip: 22.0 };
    const bookedSeatItems: IBookedSeatItem[] = seatNumbers.map((seatNum) => {
      const tier = getSeatTier(seatNum, showtime.rows || 6);
      const price = pricing[tier] || pricing.standard;
      return {
        seatNumber: seatNum,
        tier,
        price,
      };
    });

    const totalPrice = bookedSeatItems.reduce((acc, item) => acc + item.price, 0);

    // Generate unique booking reference code
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const bookingReference = `IMV-${randomSuffix}`;

    try {
      const booking = await Booking.create({
        bookingReference,
        user: req.user.id,
        showtime: showtime._id,
        movie: showtime.movie,
        cinema: showtime.cinema,
        screenName: showtime.screenName,
        showStartTime: showtime.startTime,
        seats: bookedSeatItems,
        totalPrice: Number(totalPrice.toFixed(2)),
        bookingStatus: 'confirmed',
        paymentMode: 'demo_instant_checkout',
        paymentStatus: 'completed',
      });

      const populatedBooking = await Booking.findById(booking._id)
        .populate('movie', 'title posterUrl duration certificate genre')
        .populate('cinema', 'name city address');

      res.status(201).json({
        success: true,
        message: 'Tickets booked successfully! Confirmation generated.',
        booking: populatedBooking,
      });
    } catch (bookingError: any) {
      // Rollback booked seats if booking document creation fails
      console.error('Failed to create booking document, rolling back seat reservation:', bookingError);
      await Showtime.updateOne(
        { _id: showtime._id },
        { $pull: { bookedSeats: { $in: seatNumbers } } }
      );

      res.status(500).json({
        success: false,
        message: 'Internal error generating booking. Your seats were released.',
      });
    }
  } catch (error: any) {
    console.error('Error during booking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error processing ticket booking',
    });
  }
}

export async function getMyBookings(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const bookings = await Booking.find({ user: req.user.id })
      .populate('movie', 'title posterUrl duration certificate genre rating')
      .populate('cinema', 'name address city')
      .populate('showtime', 'screenName screenType startTime endTime')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error: any) {
    console.error('Error fetching my bookings:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve bookings',
    });
  }
}

export async function getBookingById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('movie', 'title posterUrl duration certificate genre rating')
      .populate('cinema', 'name address city amenities')
      .populate('showtime', 'screenName screenType startTime endTime');

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Ensure user is the owner or an admin
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own bookings.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve booking',
    });
  }
}

export async function cancelBooking(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found' });
      return;
    }

    // Ownership check
    if (booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own bookings.',
      });
      return;
    }

    if (booking.bookingStatus === 'cancelled') {
      res.status(400).json({
        success: false,
        message: 'This booking is already cancelled',
      });
      return;
    }

    // Check if show has already started
    const now = new Date();
    if (new Date(booking.showStartTime) <= now) {
      res.status(400).json({
        success: false,
        message: 'Cannot cancel tickets for a show that has already started or completed',
      });
      return;
    }

    // Release seats from showtime
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await Showtime.updateOne(
      { _id: booking.showtime },
      { $pull: { bookedSeats: { $in: seatNumbers } } }
    );

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been made available.',
      booking,
    });
  } catch (error: any) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel booking',
    });
  }
}
