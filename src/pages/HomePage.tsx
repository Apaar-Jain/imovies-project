import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Sparkles,
  Ticket,
  Play,
  Star,
  Clock,
  ShieldCheck,
  ChevronRight,
  Flame,
  Armchair,
  Video,
} from 'lucide-react';
import { movieApi } from '../services/api.ts';
import { IMovie } from '../types/index.ts';
import { MovieCard } from '../components/MovieCard.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [heroMovie, setHeroMovie] = useState<IMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await movieApi.getMovies();
        if (res.data.success && res.data.movies.length > 0) {
          setMovies(res.data.movies);
          // Pick a featured or top rated movie for hero banner
          const featured = res.data.movies.find((m) => m.featured) || res.data.movies[0];
          setHeroMovie(featured);
        }
      } catch (err) {
        console.error('Failed to load movies on homepage:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/movies');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Connecting to cinema databases..." />;
  }

  const nowShowing = movies.filter((m) => m.status === 'now_showing');
  const upcoming = movies.filter((m) => m.status === 'upcoming');

  return (
    <div className="min-h-screen text-gray-100 pb-16">
      {/* Hero Banner */}
      {heroMovie && (
        <div className="relative w-full h-[520px] sm:h-[620px] overflow-hidden bg-black">
          {/* Backdrop Image */}
          <div className="absolute inset-0">
            <img
              src={heroMovie.backdropUrl || heroMovie.posterUrl}
              alt={heroMovie.title}
              className="w-full h-full object-cover object-top opacity-35 scale-105"
            />
            {/* Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/60 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/70 to-transparent"></div>
          </div>

          {/* Hero Content */}
          <div className="relative max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-20">
            <div className="max-w-2xl space-y-4">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-600 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-lg shadow-red-600/30 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Premiere Spotlight
                </span>
                <span className="bg-white/10 backdrop-blur-md text-gray-200 text-xs px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {heroMovie.rating.toFixed(1)} Rating
                </span>
                <span className="bg-white/10 backdrop-blur-md text-gray-300 text-xs px-2.5 py-1 rounded-md border border-white/10 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  {heroMovie.duration}m
                </span>
                <span className="bg-white/10 backdrop-blur-md text-gray-300 text-xs px-2 py-1 rounded-md border border-white/10">
                  {heroMovie.certificate || 'PG-13'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                {heroMovie.title}
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base text-gray-300 line-clamp-3 leading-relaxed max-w-xl">
                {heroMovie.description}
              </p>

              {/* Genres */}
              <div className="flex flex-wrap gap-2 pt-1">
                {heroMovie.genre.map((g) => (
                  <span
                    key={g}
                    className="text-xs font-semibold text-gray-300 bg-gray-900/90 border border-gray-700/80 px-3 py-1 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Call to Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  onClick={() => navigate(`/book/${heroMovie._id}`)}
                  className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/40 hover:shadow-red-600/60 transition-all flex items-center gap-2 group"
                >
                  <Ticket className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Book Tickets Now
                </button>

                <Link
                  to={`/movies/${heroMovie._id}`}
                  className="px-5 py-3 rounded-xl bg-gray-800/90 hover:bg-gray-700/90 text-gray-200 font-semibold text-sm border border-gray-700 transition-colors flex items-center gap-2"
                >
                  View Details & Trailer
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 space-y-16">
        {/* Search & Quick Filter Bar */}
        <div className="bg-[#11131c] border border-gray-800 p-4 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies by title, director, or cast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900/90 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
            />
          </form>

          <button
            onClick={handleSearchSubmit}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            Find Showtimes
          </button>
        </div>

        {/* Section 1: Now Showing in Theaters */}
        <div>
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-red-500 uppercase tracking-widest mb-1">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                In Theaters Now
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Currently Showing
              </h2>
            </div>

            <Link
              to="/movies"
              className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 group"
            >
              See all movies
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {nowShowing.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>

        {/* Section 2: How Booking Works */}
        <div className="bg-gradient-to-br from-gray-900/90 via-[#11131c] to-black border border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-red-500">
              Effortless Reservation
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              How IMovies Booking Works
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              Experience hassle-free movie ticket booking with live seat availability and atomic concurrency protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-950/70 border border-gray-800/80 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-black text-sm mb-4 border border-red-500/30">
                01
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Video className="w-4 h-4 text-red-400" />
                Select Movie & Cinema
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Browse our blockbuster catalog, pick your preferred cinema location, and choose a showtime that fits your schedule.
              </p>
            </div>

            <div className="bg-gray-950/70 border border-gray-800/80 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-black text-sm mb-4 border border-red-500/30">
                02
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Armchair className="w-4 h-4 text-red-400" />
                Pick Your Perfect Seats
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Interact with the dynamic screen auditorium map. Select VIP recliners, premium view, or standard seats with live pricing.
              </p>
            </div>

            <div className="bg-gray-950/70 border border-gray-800/80 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-400 flex items-center justify-center font-black text-sm mb-4 border border-red-500/30">
                03
              </div>
              <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <Ticket className="w-4 h-4 text-red-400" />
                Instant Ticket Confirmation
              </h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Instant confirmation code with digital barcode pass. Your seats are locked in the database with zero double-booking risk.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Upcoming Movies */}
        {upcoming.length > 0 && (
          <div>
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-amber-500 uppercase tracking-widest block mb-1">
                  Arriving Soon
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Upcoming Premieres
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {upcoming.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
