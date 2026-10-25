import React, { useState, useEffect } from 'react';
import {
  Shield,
  Film,
  Calendar,
  Ticket,
  DollarSign,
  Users,
  Plus,
  Trash2,
  RefreshCw,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { adminApi, movieApi, cinemaApi, showtimeApi } from '../services/api.ts';
import { IMovie, ICinema, IShowtime, IAdminStats } from '../types/index.ts';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<IAdminStats | null>(null);
  const [allBookings, setAllBookings] = useState<any[]>([]);
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [cinemas, setCinemas] = useState<ICinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'movies' | 'showtimes' | 'bookings'>('overview');

  // New Movie Form State
  const [newMovieOpen, setNewMovieOpen] = useState(false);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    genre: 'Action, Sci-Fi',
    duration: 120,
    releaseDate: '2025-01-01',
    language: 'English',
    rating: 8.5,
    certificate: 'PG-13',
    cast: 'Lead Actor, Supporting Actor',
    director: 'Director Name',
    status: 'now_showing',
    featured: false,
  });

  // New Showtime Form State
  const [newShowtimeOpen, setNewShowtimeOpen] = useState(false);
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    cinemaId: '',
    screenId: 'SCR-1',
    screenName: 'Screen 1 (Standard)',
    screenType: 'Standard',
    startTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
    standardPrice: 13.0,
    premiumPrice: 17.5,
    vipPrice: 24.0,
  });

  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [statsRes, bookingsRes, moviesRes, cinemasRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAllBookings(),
        movieApi.getMovies(),
        cinemaApi.getCinemas(),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (bookingsRes.data.success) setAllBookings(bookingsRes.data.bookings || []);
      if (moviesRes.data.success) setMovies(moviesRes.data.movies || []);
      if (cinemasRes.data.success) {
        setCinemas(cinemasRes.data.cinemas || []);
        if (cinemasRes.data.cinemas.length > 0 && !showtimeForm.cinemaId) {
          setShowtimeForm((prev) => ({ ...prev, cinemaId: cinemasRes.data.cinemas[0]._id }));
        }
      }
      if (moviesRes.data.movies?.length > 0 && !showtimeForm.movieId) {
        setShowtimeForm((prev) => ({ ...prev, movieId: moviesRes.data.movies[0]._id }));
      }
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const payload = {
        ...movieForm,
        genre: movieForm.genre.split(',').map((g) => g.trim()),
        cast: movieForm.cast.split(',').map((c) => c.trim()),
      };
      const res = await movieApi.createMovie(payload as any);
      if (res.data.success) {
        setActionMessage({ type: 'success', text: `Movie "${movieForm.title}" added successfully!` });
        setNewMovieOpen(false);
        loadDashboardData();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create movie' });
    }
  };

  const handleDeleteMovie = async (movieId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete movie "${title}" and all its showtimes?`)) {
      return;
    }
    try {
      await movieApi.deleteMovie(movieId);
      setActionMessage({ type: 'success', text: `Movie "${title}" deleted.` });
      loadDashboardData();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete movie' });
    }
  };

  const handleCreateShowtime = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMessage(null);
    try {
      const payload = {
        movieId: showtimeForm.movieId,
        cinemaId: showtimeForm.cinemaId,
        screenId: showtimeForm.screenId,
        screenName: showtimeForm.screenName,
        screenType: showtimeForm.screenType,
        startTime: new Date(showtimeForm.startTime).toISOString(),
        pricing: {
          standard: Number(showtimeForm.standardPrice),
          premium: Number(showtimeForm.premiumPrice),
          vip: Number(showtimeForm.vipPrice),
        },
      };
      const res = await showtimeApi.createShowtime(payload);
      if (res.data.success) {
        setActionMessage({ type: 'success', text: 'New showtime scheduled successfully!' });
        setNewShowtimeOpen(false);
        loadDashboardData();
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to schedule showtime' });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading Admin Management Console..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen text-gray-100">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            Administrator Access Only
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            IMovies Cinema Control Center
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage movie listings, schedule theater showtimes, set pricing, and oversee customer reservations.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="w-fit px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-xs font-medium text-gray-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Action alerts */}
      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Stats Cards Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#11131c] border border-gray-800 p-5 rounded-2xl">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
              ${stats.totalRevenue.toFixed(2)}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">From confirmed bookings</span>
          </div>

          <div className="bg-[#11131c] border border-gray-800 p-5 rounded-2xl">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Total Bookings
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
              {stats.totalBookings}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">
              {stats.totalTicketsSold} tickets sold
            </span>
          </div>

          <div className="bg-[#11131c] border border-gray-800 p-5 rounded-2xl">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Catalog Movies
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
              {stats.totalMovies}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">Active across listings</span>
          </div>

          <div className="bg-[#11131c] border border-gray-800 p-5 rounded-2xl">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">
              Active Showtimes
            </span>
            <span className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 block">
              {stats.totalShowtimes}
            </span>
            <span className="text-[10px] text-gray-400 mt-1 block">Across {stats.totalCinemas} cinema halls</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'overview'
              ? 'bg-red-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          Overview & Recent Bookings
        </button>
        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'movies'
              ? 'bg-red-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          Manage Movies ({movies.length})
        </button>
        <button
          onClick={() => setActiveTab('showtimes')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'showtimes'
              ? 'bg-red-600 text-white'
              : 'bg-gray-900 text-gray-400 hover:text-white'
          }`}
        >
          Schedule Showtimes
        </button>
      </div>

      {/* Tab 1: Overview & Recent Bookings */}
      {activeTab === 'overview' && (
        <div className="bg-[#11131c] border border-gray-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Ticket className="w-4 h-4 text-red-500" />
              All Customer Reservations ({allBookings.length})
            </h3>
            <span className="text-xs text-gray-400">Database verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-900/80 text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Reference</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Movie</th>
                  <th className="p-3">Cinema / Hall</th>
                  <th className="p-3">Seats</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {allBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-900/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-red-400">{b.bookingReference}</td>
                    <td className="p-3">
                      <span className="font-medium text-white block">{b.user?.name || 'Customer'}</span>
                      <span className="text-[10px] text-gray-400">{b.user?.email}</span>
                    </td>
                    <td className="p-3 font-semibold text-white">{b.movie?.title}</td>
                    <td className="p-3 text-gray-300">
                      <span>{b.cinema?.name?.split('—')[0]}</span>
                      <span className="text-[10px] text-gray-400 block">{b.screenName}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {b.seats?.map((s: any) => (
                          <span
                            key={s.seatNumber}
                            className="px-1.5 py-0.5 rounded bg-gray-800 text-[10px] text-gray-200 font-bold"
                          >
                            {s.seatNumber}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-white">${b.totalPrice?.toFixed(2)}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          b.bookingStatus === 'confirmed'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Movies */}
      {activeTab === 'movies' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Movie Management</h3>
            <button
              onClick={() => setNewMovieOpen(!newMovieOpen)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Add New Movie
            </button>
          </div>

          {/* New Movie Modal / Form Accordion */}
          {newMovieOpen && (
            <form
              onSubmit={handleCreateMovie}
              className="bg-[#11131c] border border-gray-800 p-6 rounded-3xl shadow-2xl space-y-4"
            >
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Create Movie Record
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Movie Title *</label>
                  <input
                    type="text"
                    required
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. Inception 2"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Poster Image URL *</label>
                  <input
                    type="url"
                    required
                    value={movieForm.posterUrl}
                    onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    required
                    value={movieForm.duration}
                    onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Genres (comma-separated)</label>
                  <input
                    type="text"
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Director</label>
                  <input
                    type="text"
                    value={movieForm.director}
                    onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Starring Cast (comma-separated)</label>
                  <input
                    type="text"
                    value={movieForm.cast}
                    onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-gray-400 block mb-1">Description / Storyline *</label>
                  <textarea
                    required
                    rows={3}
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewMovieOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl"
                >
                  Save Movie to Database
                </button>
              </div>
            </form>
          )}

          {/* Movie Catalog Table */}
          <div className="bg-[#11131c] border border-gray-800 rounded-3xl p-6 shadow-xl">
            <div className="divide-y divide-gray-800">
              {movies.map((m) => (
                <div key={m._id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-12 h-16 object-cover rounded-lg bg-gray-900 border border-gray-800"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{m.title}</h4>
                      <p className="text-xs text-gray-400">
                        {m.genre.join(', ')} • {m.duration} min • Rating: {m.rating}
                      </p>
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        Status: <strong className="text-red-400 uppercase">{m.status}</strong>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMovie(m._id, m.title)}
                    className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors"
                    title="Delete Movie"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Schedule Showtimes */}
      {activeTab === 'showtimes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Showtime Scheduling</h3>
            <button
              onClick={() => setNewShowtimeOpen(!newShowtimeOpen)}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Schedule New Showtime
            </button>
          </div>

          {newShowtimeOpen && (
            <form
              onSubmit={handleCreateShowtime}
              className="bg-[#11131c] border border-gray-800 p-6 rounded-3xl shadow-2xl space-y-4"
            >
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Schedule Movie Screening
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Select Movie *</label>
                  <select
                    value={showtimeForm.movieId}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title} ({m.duration}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Select Cinema *</label>
                  <select
                    value={showtimeForm.cinemaId}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, cinemaId: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  >
                    {cinemas.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Screen Format</label>
                  <select
                    value={showtimeForm.screenType}
                    onChange={(e) =>
                      setShowtimeForm({
                        ...showtimeForm,
                        screenType: e.target.value,
                        screenName: `Screen (${e.target.value})`,
                      })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Standard">Standard Digital</option>
                    <option value="IMAX 3D">IMAX 3D Laser</option>
                    <option value="Dolby Cinema">Dolby Cinema Atmos</option>
                    <option value="VIP Recliner">VIP Recliner Suite</option>
                    <option value="4DX">4DX Motion</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Start Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={showtimeForm.startTime}
                    onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">Standard Ticket Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showtimeForm.standardPrice}
                    onChange={(e) =>
                      setShowtimeForm({ ...showtimeForm, standardPrice: parseFloat(e.target.value) })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">VIP Recliner Price ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showtimeForm.vipPrice}
                    onChange={(e) =>
                      setShowtimeForm({ ...showtimeForm, vipPrice: parseFloat(e.target.value) })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewShowtimeOpen(false)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl"
                >
                  Schedule Showtime
                </button>
              </div>
            </form>
          )}

          <div className="bg-[#11131c] border border-gray-800 rounded-3xl p-6 shadow-xl text-xs text-gray-400">
            Showtimes are managed dynamically in MongoDB. Adding a showtime immediately makes its seating map available in real time to all customers.
          </div>
        </div>
      )}
    </div>
  );
};
