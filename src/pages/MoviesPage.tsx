import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Film, X } from 'lucide-react';
import { movieApi } from '../services/api.ts';
import { IMovie } from '../types/index.ts';
import { MovieCard } from '../components/MovieCard.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

const GENRES = [
  'All',
  'Action',
  'Sci-Fi',
  'Adventure',
  'Drama',
  'Biography',
  'Animation',
  'Fantasy',
  'History',
];

export const MoviesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialGenre = searchParams.get('genre') || 'All';
  const initialStatus = searchParams.get('status') || 'all';

  const [movies, setMovies] = useState<IMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedSort, setSelectedSort] = useState('rating_desc');

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        const res = await movieApi.getMovies({
          search: search || undefined,
          genre: selectedGenre !== 'All' ? selectedGenre : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          sort: selectedSort,
        });
        if (res.data.success) {
          setMovies(res.data.movies);
        }
      } catch (err) {
        console.error('Failed to query movies:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchMovies();
    }, 200);

    return () => clearTimeout(timer);
  }, [search, selectedGenre, selectedStatus, selectedSort]);

  const clearFilters = () => {
    setSearch('');
    setSelectedGenre('All');
    setSelectedStatus('all');
    setSelectedSort('rating_desc');
    setSearchParams({});
  };

  const hasActiveFilters = search !== '' || selectedGenre !== 'All' || selectedStatus !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Film className="w-8 h-8 text-red-500" />
          Explore Movies & Showtimes
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Find what’s currently on the big screen or coming soon to theaters near you.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#10121a] border border-gray-800 rounded-2xl p-4 mb-8 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, director, or cast..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus('now_showing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                selectedStatus === 'now_showing'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Now Showing
            </button>
            <button
              onClick={() => setSelectedStatus('upcoming')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                selectedStatus === 'upcoming'
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Upcoming
            </button>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-gray-900 border border-gray-700/80 rounded-xl px-3 py-2 text-xs font-medium text-gray-200 focus:outline-none focus:border-red-500"
            >
              <option value="rating_desc">Highest Rated</option>
              <option value="release_desc">Release Date</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-gray-800/80">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-2 shrink-0">
            Genres:
          </span>
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGenre(g)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedGenre === g
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-800'
              }`}
            >
              {g}
            </button>
          ))}

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-400 hover:text-red-300 underline ml-auto shrink-0 pl-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Movie Results Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering movie catalog..." />
      ) : movies.length === 0 ? (
        <div className="bg-[#10121a] border border-gray-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
          <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            No movies match your current search and filter settings. Try adjusting your keywords.
          </p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-500"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div>
          <div className="text-xs font-semibold text-gray-400 mb-4">
            Showing <span className="text-white font-bold">{movies.length}</span> movies
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
