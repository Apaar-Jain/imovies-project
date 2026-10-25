import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  Calendar,
  Ticket,
  MapPin,
  ExternalLink,
  Users,
  Film,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { movieApi } from '../services/api.ts';
import { IMovie, IShowtime, ICinema } from '../types/index.ts';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

export const MovieDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [movie, setMovie] = useState<IMovie | null>(null);
  const [showtimes, setShowtimes] = useState<IShowtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    async function loadMovieDetails() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await movieApi.getMovieById(id);
        if (res.data.success) {
          setMovie(res.data.movie);
          setShowtimes(res.data.showtimes || []);

          // Set default selected date
          if (res.data.showtimes && res.data.showtimes.length > 0) {
            const firstDate = new Date(res.data.showtimes[0].startTime).toISOString().split('T')[0];
            setSelectedDate(firstDate);
          }
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMovieDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner message="Retrieving movie data & cinema schedules..." />;
  }

  if (!movie) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Film className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Movie Not Found</h2>
        <p className="text-xs text-gray-400 mt-2 mb-6">
          The movie you requested might have been moved or removed from our program.
        </p>
        <Link
          to="/movies"
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-500"
        >
          Back to Movies
        </Link>
      </div>
    );
  }

  // Extract unique show dates
  const uniqueDates = Array.from(
    new Set(
      showtimes.map((st) => new Date(st.startTime).toISOString().split('T')[0])
    )
  ).sort();

  // Filter showtimes for the selected date
  const filteredShowtimes = showtimes.filter((st) => {
    if (!selectedDate) return true;
    return new Date(st.startTime).toISOString().split('T')[0] === selectedDate;
  });

  // Group showtimes by cinema
  const cinemaGroups: { [cinemaId: string]: { cinema: ICinema; shows: IShowtime[] } } = {};
  filteredShowtimes.forEach((st) => {
    const cinemaObj = st.cinema as ICinema;
    if (cinemaObj && cinemaObj._id) {
      if (!cinemaGroups[cinemaObj._id]) {
        cinemaGroups[cinemaObj._id] = { cinema: cinemaObj, shows: [] };
      }
      cinemaGroups[cinemaObj._id].shows.push(st);
    }
  });

  return (
    <div className="min-h-screen text-gray-100 pb-20">
      {/* Backdrop Header */}
      <div className="relative w-full h-[400px] sm:h-[480px] bg-black overflow-hidden">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-top opacity-30 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/70 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-transparent to-transparent"></div>

        {/* Back Link */}
        <div className="absolute top-6 left-4 sm:left-8 z-30">
          <Link
            to="/movies"
            className="px-3.5 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md border border-gray-700/80 text-xs font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Movies
          </Link>
        </div>
      </div>

      {/* Main Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-52 sm:-mt-64 relative z-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
          {/* Movie Poster */}
          <div className="w-56 sm:w-64 shrink-0 mx-auto lg:mx-0 bg-gray-900 rounded-3xl overflow-hidden border-2 border-gray-800 shadow-2xl cinema-glow-red">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full aspect-[2/3] object-cover"
            />
          </div>

          {/* Movie Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded">
                {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
              </span>
              <span className="bg-gray-800 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded border border-gray-700">
                {movie.certificate}
              </span>
              <span className="bg-gray-800 text-gray-300 text-xs font-semibold px-2 py-0.5 rounded border border-gray-700">
                {movie.language}
              </span>
              {movie.rating > 0 && (
                <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-600/40 text-amber-300 px-2.5 py-0.5 rounded text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {movie.rating.toFixed(1)} / 10
                </div>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1 text-gray-300">
                <Clock className="w-4 h-4 text-red-500" />
                {movie.duration} Minutes
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gray-300">
                <Calendar className="w-4 h-4 text-red-500" />
                Released {movie.releaseDate}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {movie.genre.map((g) => (
                <span
                  key={g}
                  className="text-xs font-semibold text-gray-300 bg-gray-900 border border-gray-800 px-3 py-1 rounded-full"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Synopsis */}
            <div className="pt-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Storyline
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">{movie.description}</p>
            </div>

            {/* Director & Cast */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-800/80 text-xs">
              <div>
                <span className="text-gray-400 uppercase tracking-wider font-semibold block text-[10px]">
                  Director
                </span>
                <span className="font-semibold text-white">{movie.director}</span>
              </div>

              <div>
                <span className="text-gray-400 uppercase tracking-wider font-semibold block text-[10px] flex items-center gap-1">
                  <Users className="w-3 h-3 text-red-400" /> Starring Cast
                </span>
                <span className="text-gray-300">
                  {movie.cast && movie.cast.length > 0 ? movie.cast.join(', ') : 'Not listed'}
                </span>
              </div>
            </div>

            {/* Trailer Action */}
            {movie.trailerUrl && (
              <div className="pt-2">
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-gray-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-red-400" />
                  Watch Official Trailer
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Showtimes & Booking Section */}
        <div className="bg-[#0f111a] border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-500">
                Ticket Reservation
              </span>
              <h2 className="text-2xl font-black text-white mt-0.5">
                Available Cinemas & Showtimes
              </h2>
            </div>

            {/* Date Selector Tabs */}
            {uniqueDates.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {uniqueDates.map((d) => {
                  const dateObj = new Date(d);
                  const isSelected = selectedDate === d;
                  const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const day = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

                  return (
                    <button
                      key={d}
                      onClick={() => setSelectedDate(d)}
                      className={`px-3 py-2 rounded-xl text-center min-w-[70px] transition-all ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:bg-gray-800'
                      }`}
                    >
                      <span className="block text-[10px] font-bold uppercase">{weekday}</span>
                      <span className="block text-xs font-bold">{day}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cinema Showtimes Listing */}
          <div className="mt-6 space-y-6">
            {Object.keys(cinemaGroups).length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No active showtimes scheduled for this date. Please check another date or browse our other movies.
              </div>
            ) : (
              Object.values(cinemaGroups).map(({ cinema, shows }) => (
                <div
                  key={cinema._id}
                  className="bg-gray-950/80 border border-gray-800/80 rounded-2xl p-5 hover:border-gray-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        {cinema.name}
                      </h4>
                      <p className="text-xs text-gray-400 ml-6">
                        {cinema.address}, {cinema.city}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 ml-6 sm:ml-0">
                      {cinema.amenities.slice(0, 3).map((a) => (
                        <span
                          key={a}
                          className="text-[10px] bg-gray-900 border border-gray-800 text-gray-400 px-2 py-0.5 rounded"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtime chips */}
                  <div className="flex flex-wrap gap-3 ml-0 sm:ml-6">
                    {shows.map((show) => {
                      const timeStr = new Date(show.startTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                      const availableCount =
                        (show.rows * show.cols) - (show.bookedSeats ? show.bookedSeats.length : 0);

                      return (
                        <button
                          key={show._id}
                          onClick={() => navigate(`/book/${movie._id}?showtimeId=${show._id}`)}
                          className="px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-red-600/10 border border-gray-700 hover:border-red-500 text-left transition-all group"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-red-400">
                              {timeStr}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-800 text-gray-300">
                              {show.screenType}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-[10px] text-gray-400 mt-1">
                            <span>{show.screenName}</span>
                            <span className="text-emerald-400 font-medium">
                              {availableCount} seats left
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
