import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Film,
  MapPin,
  Calendar,
  Clock,
  Ticket,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { movieApi, showtimeApi, bookingApi } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { IMovie, IShowtime, IBooking, ICinema } from '../types/index.ts';
import { SeatMap } from '../components/SeatMap.tsx';
import { BookingConfirmationModal } from '../components/BookingConfirmationModal.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

export const BookingPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const [searchParams] = useSearchParams();
  const initialShowtimeId = searchParams.get('showtimeId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [movie, setMovie] = useState<IMovie | null>(null);
  const [allShowtimes, setAllShowtimes] = useState<IShowtime[]>([]);
  const [selectedShowtime, setSelectedShowtime] = useState<IShowtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<IBooking | null>(null);

  // 1. Fetch movie and showtimes
  useEffect(() => {
    async function loadData() {
      if (!movieId) return;
      setLoading(true);
      try {
        const res = await movieApi.getMovieById(movieId);
        if (res.data.success) {
          setMovie(res.data.movie);
          const shows = res.data.showtimes || [];
          setAllShowtimes(shows);

          if (initialShowtimeId) {
            const target = shows.find((s) => s._id === initialShowtimeId);
            if (target) setSelectedShowtime(target);
          } else if (shows.length > 0) {
            setSelectedShowtime(shows[0]);
          }
        }
      } catch (err: any) {
        console.error('Failed to load booking details:', err);
        setErrorMessage('Unable to load showtime information. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [movieId, initialShowtimeId]);

  // 2. Fetch live seat availability when selectedShowtime changes
  useEffect(() => {
    async function fetchSeatAvailability() {
      if (!selectedShowtime) return;
      try {
        const res = await showtimeApi.getShowtimeSeats(selectedShowtime._id);
        if (res.data.success) {
          setBookedSeats(res.data.bookedSeats || []);
          // Clear any selected seats that might now be booked
          setSelectedSeats((prev) => prev.filter((s) => !res.data.bookedSeats.includes(s)));
        }
      } catch (err) {
        console.error('Failed to load seat availability:', err);
      }
    }

    fetchSeatAvailability();
  }, [selectedShowtime]);

  // Toggle seat selection
  const handleToggleSeat = (seatId: string) => {
    setErrorMessage(null);
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter((s) => s !== seatId));
    } else {
      if (selectedSeats.length >= 8) {
        setErrorMessage('You can select a maximum of 8 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // Helper to calculate pricing
  const pricing = selectedShowtime?.pricing || { standard: 13.0, premium: 17.5, vip: 24.0 };
  const getSeatTier = (seatNum: string): 'vip' | 'premium' | 'standard' => {
    const row = seatNum.charAt(0).toUpperCase();
    const rowIndex = row.charCodeAt(0) - 65;
    if (rowIndex <= 1) return 'vip';
    if (rowIndex <= Math.floor((selectedShowtime?.rows || 6) / 2)) return 'premium';
    return 'standard';
  };

  const totalPrice = selectedSeats.reduce((sum, seatNum) => {
    const tier = getSeatTier(seatNum);
    return sum + pricing[tier];
  }, 0);

  // Submit Booking
  const handleProceedBooking = async () => {
    setErrorMessage(null);

    if (!user) {
      // Redirect to login preserving destination
      navigate('/login', { state: { from: `/book/${movieId}?showtimeId=${selectedShowtime?._id}` } });
      return;
    }

    if (!selectedShowtime) {
      setErrorMessage('Please select a valid showtime.');
      return;
    }

    if (selectedSeats.length === 0) {
      setErrorMessage('Please select at least one seat on the cinema map.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await bookingApi.createBooking({
        showtimeId: selectedShowtime._id,
        requestedSeats: selectedSeats,
      });

      if (res.data.success && res.data.booking) {
        setConfirmedBooking(res.data.booking);
        // Update local booked seats to immediately reflect newly booked seats
        setBookedSeats((prev) => [...prev, ...selectedSeats]);
        setSelectedSeats([]);
      }
    } catch (err: any) {
      console.error('Booking failed:', err);
      const msg =
        err.response?.data?.message ||
        'Failed to confirm your booking. One of your seats may have just been booked.';
      setErrorMessage(msg);

      // Refresh seat map to reflect current availability
      if (selectedShowtime) {
        try {
          const fresh = await showtimeApi.getShowtimeSeats(selectedShowtime._id);
          if (fresh.data.success) {
            setBookedSeats(fresh.data.bookedSeats || []);
          }
        } catch (_) {}
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Configuring cinema hall and seats..." />;
  }

  if (!movie || allShowtimes.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Film className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">No Active Showtimes</h2>
        <p className="text-xs text-gray-400 mt-2 mb-6">
          There are currently no active bookable showtimes for this title.
        </p>
        <Link
          to="/movies"
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
        >
          Browse Other Movies
        </Link>
      </div>
    );
  }

  const currentCinema = selectedShowtime?.cinema as ICinema;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-gray-100">
      {/* Top Breadcrumb & Movie Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            to={`/movies/${movie._id}`}
            className="p-2 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div>
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block">
              Step-by-Step Ticket Reservation
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">{movie.title}</h1>
            <p className="text-xs text-gray-400">
              {movie.certificate} • {movie.duration} min • {movie.genre.join(', ')}
            </p>
          </div>
        </div>

        {/* Selected Cinema & Screen badge */}
        {selectedShowtime && currentCinema && (
          <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 px-4 py-2.5 rounded-2xl">
            <MapPin className="w-4 h-4 text-red-500 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">{currentCinema.name}</span>
              <span className="text-gray-400">
                {selectedShowtime.screenName} ({selectedShowtime.screenType})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Showtime Selector Bar */}
      <div className="bg-[#11131c] border border-gray-800 rounded-2xl p-4 mb-8 shadow-xl">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
          Select Showtime Slot:
        </span>
        <div className="flex flex-wrap gap-2.5">
          {allShowtimes.map((st) => {
            const cinemaName = (st.cinema as ICinema)?.name?.split('—')[0] || 'Cinema';
            const dateStr = new Date(st.startTime).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });
            const timeStr = new Date(st.startTime).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            });

            const isSelected = selectedShowtime?._id === st._id;

            return (
              <button
                key={st._id}
                onClick={() => {
                  setSelectedShowtime(st);
                  setSelectedSeats([]);
                }}
                className={`px-3.5 py-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'bg-red-600/15 border-red-500 text-white shadow-md shadow-red-600/20'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <Clock className={`w-3 h-3 ${isSelected ? 'text-red-400' : 'text-gray-400'}`} />
                  <span className={isSelected ? 'text-white' : 'text-gray-200'}>{timeStr}</span>
                  <span className="text-[10px] text-gray-400">({st.screenType})</span>
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {dateStr} • {cinemaName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Main Grid: Interactive Seat Map (Left) + Order Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Interactive Seat Map */}
        <div className="lg:col-span-2">
          {selectedShowtime && (
            <SeatMap
              rows={selectedShowtime.rows || 6}
              cols={selectedShowtime.cols || 10}
              bookedSeats={bookedSeats}
              selectedSeats={selectedSeats}
              onToggleSeat={handleToggleSeat}
              pricing={pricing}
            />
          )}
        </div>

        {/* Right Column: Sticky Booking Summary */}
        <div className="bg-[#11131c] border border-gray-800 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-red-500" />
              Reservation Summary
            </h3>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800 px-2 py-0.5 rounded">
              Demonstration Mode
            </span>
          </div>

          {/* Showtime Details */}
          {selectedShowtime && (
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-950 shrink-0 border border-gray-800">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{movie.title}</h4>
                  <p className="text-gray-400 mt-0.5">
                    {selectedShowtime.screenName} • {selectedShowtime.screenType}
                  </p>
                  <p className="text-gray-400 truncate">
                    {(selectedShowtime.cinema as ICinema)?.name}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-gray-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-red-400" />
                  {new Date(selectedShowtime.startTime).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <span className="flex items-center gap-1.5 font-bold text-white">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  {new Date(selectedShowtime.startTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )}

          {/* Selected Seats Breakdown */}
          <div className="pt-3 border-t border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Selected Seats:</span>
              <span className="font-bold text-white">
                {selectedSeats.length > 0 ? selectedSeats.length : 'None'}
              </span>
            </div>

            {selectedSeats.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedSeats.map((seatNum) => {
                  const tier = getSeatTier(seatNum);
                  return (
                    <span
                      key={seatNum}
                      className="px-2 py-1 rounded-md text-xs font-bold bg-red-600/20 text-red-300 border border-red-500/30 flex items-center gap-1"
                    >
                      {seatNum}
                      <span className="text-[10px] text-gray-400 uppercase font-normal">
                        (${pricing[tier]})
                      </span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-[11px] text-gray-400 italic">
                Click on any available seat on the auditorium map to add tickets.
              </p>
            )}
          </div>

          {/* Pricing Total */}
          <div className="pt-4 border-t border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Standard Tickets Base</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Convenience & Screen Fee</span>
              <span className="text-emerald-400 font-medium">$0.00 (Free Demo)</span>
            </div>
            <div className="flex items-center justify-between text-base font-black text-white pt-2 border-t border-gray-800">
              <span>Total Price</span>
              <span className="text-2xl text-red-500">${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* User Sign-In Notice if not authenticated */}
          {!user && (
            <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-xl text-[11px] text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span>You are currently not signed in.</span>
                <p className="text-gray-400 mt-0.5">
                  Clicking continue will prompt you to quickly sign in or use one of our instant 1-click demo accounts.
                </p>
              </div>
            </div>
          )}

          {/* Proceed Button */}
          <button
            onClick={handleProceedBooking}
            disabled={selectedSeats.length === 0 || submitting}
            className="w-full py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-2 group"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Locking Seats in Database...
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>
                  {user
                    ? `Confirm Booking (${selectedSeats.length} Seats)`
                    : 'Sign In & Reserve Seats'}
                </span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-gray-400">
            Guaranteed atomic reservation • Concurrency double-booking protection active
          </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmedBooking && (
        <BookingConfirmationModal
          booking={confirmedBooking}
          onClose={() => setConfirmedBooking(null)}
        />
      )}
    </div>
  );
};
