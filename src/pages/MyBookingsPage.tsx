import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Printer,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { bookingApi } from '../services/api.ts';
import { IBooking } from '../types/index.ts';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

export const MyBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBookings();
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err: any) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Your seats will be released.')) {
      return;
    }

    setCancellingId(bookingId);
    setMessage(null);
    try {
      const res = await bookingApi.cancelBooking(bookingId);
      if (res.data.success) {
        setMessage({
          type: 'success',
          text: 'Booking cancelled successfully. Your seats have been released.',
        });
        // Update local state
        setBookings((prev) =>
          prev.map((b) =>
            b._id === bookingId
              ? { ...b, bookingStatus: 'cancelled', paymentStatus: 'refunded' }
              : b
          )
        );
      }
    } catch (err: any) {
      const errText = err.response?.data?.message || 'Failed to cancel booking.';
      setMessage({ type: 'error', text: errText });
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Fetching your ticket reservations..." />;
  }

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'confirmed' && new Date(b.showStartTime) >= now
  );
  const pastBookings = bookings.filter(
    (b) => b.bookingStatus !== 'confirmed' || new Date(b.showStartTime) < now
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <Ticket className="w-8 h-8 text-red-500" />
            My Ticket Reservations
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Review your confirmed cinema tickets, seat reservations, and digital admission passes.
          </p>
        </div>

        <Link
          to="/movies"
          className="w-fit px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors"
        >
          Book Another Movie
        </Link>
      </div>

      {/* Message alerts */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="bg-[#11131c] border border-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Ticket className="w-14 h-14 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">No Bookings Yet</h3>
          <p className="text-xs text-gray-400 mt-1 mb-6">
            You haven't reserved any movie tickets yet. Explore movies and choose your seats!
          </p>
          <Link
            to="/movies"
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition-all"
          >
            Explore Now Showing
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Upcoming Section */}
          {upcomingBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Upcoming Screenings ({upcomingBookings.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingBookings.map((b) => (
                  <BookingTicketCard
                    key={b._id}
                    booking={b}
                    onCancel={() => handleCancelBooking(b._id)}
                    cancelling={cancellingId === b._id}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past / Cancelled Section */}
          {pastBookings.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-400 mb-4">
                Past & Cancelled Bookings ({pastBookings.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastBookings.map((b) => (
                  <BookingTicketCard key={b._id} booking={b} isPast={true} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface BookingTicketCardProps {
  booking: IBooking;
  onCancel?: () => void;
  cancelling?: boolean;
  isPast?: boolean;
}

const BookingTicketCard: React.FC<BookingTicketCardProps> = ({
  booking,
  onCancel,
  cancelling,
  isPast = false,
}) => {
  const formattedDate = booking.showStartTime
    ? new Date(booking.showStartTime).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const formattedTime = booking.showStartTime
    ? new Date(booking.showStartTime).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const isCancelled = booking.bookingStatus === 'cancelled';

  return (
    <div
      className={`bg-[#12141e] border rounded-2xl overflow-hidden shadow-xl transition-all ${
        isCancelled
          ? 'border-gray-800/60 opacity-60'
          : 'border-gray-800 hover:border-red-500/40'
      }`}
    >
      {/* Top Banner */}
      <div className="p-4 bg-gradient-to-r from-gray-900 to-[#12141e] border-b border-gray-800 flex items-start gap-4">
        <div className="w-14 h-20 rounded-lg overflow-hidden bg-gray-950 shrink-0 border border-gray-800">
          <img
            src={booking.movie?.posterUrl}
            alt={booking.movie?.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold text-red-400 tracking-wider">
              {booking.bookingReference}
            </span>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                isCancelled
                  ? 'bg-red-950/60 text-red-400 border border-red-800/60'
                  : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
              }`}
            >
              {booking.bookingStatus}
            </span>
          </div>

          <h3 className="text-base font-bold text-white truncate mt-1">
            {booking.movie?.title}
          </h3>

          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {booking.cinema?.name}
          </p>
        </div>
      </div>

      {/* Middle Details Grid */}
      <div className="p-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block flex items-center gap-1">
            <Calendar className="w-3 h-3 text-red-500" /> Screening Date
          </span>
          <span className="font-semibold text-white">{formattedDate}</span>
        </div>

        <div>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block flex items-center gap-1">
            <Clock className="w-3 h-3 text-red-500" /> Showtime
          </span>
          <span className="font-semibold text-white">{formattedTime}</span>
        </div>

        <div className="col-span-2 pt-2 border-t border-gray-800/80">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1">
                Reserved Seats ({booking.seats.length})
              </span>
              <div className="flex flex-wrap gap-1">
                {booking.seats.map((s) => (
                  <span
                    key={s.seatNumber}
                    className="px-2 py-0.5 rounded bg-gray-800 border border-gray-700 text-white font-bold text-xs"
                  >
                    {s.seatNumber}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Total Price
              </span>
              <span className="text-base font-black text-white">
                ${booking.totalPrice?.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 bg-gray-950/60 border-t border-gray-800/80 flex items-center justify-between">
        <span className="text-[10px] text-gray-400">
          Booked on {new Date(booking.createdAt).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          {!isCancelled && !isPast && onCancel && (
            <button
              onClick={onCancel}
              disabled={cancelling}
              className="px-3 py-1.5 text-xs text-red-400 hover:text-white hover:bg-red-950/60 border border-red-900/60 rounded-lg transition-colors disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Tickets'}
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Pass
          </button>
        </div>
      </div>
    </div>
  );
};
