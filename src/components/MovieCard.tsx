import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Clock, Ticket, Info } from 'lucide-react';
import { IMovie } from '../types/index.ts';

interface MovieCardProps {
  movie: IMovie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group bg-gray-900/80 rounded-2xl border border-gray-800/80 overflow-hidden hover:border-red-500/40 hover:shadow-2xl hover:shadow-red-950/20 transition-all duration-300 flex flex-col h-full">
      {/* Poster Container */}
      <div className="relative aspect-[2/3] overflow-hidden bg-gray-950">
        <img
          src={imgError ? fallbackPoster : movie.posterUrl}
          alt={movie.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider shadow-md backdrop-blur-md ${
              movie.status === 'now_showing'
                ? 'bg-red-600/90 text-white'
                : 'bg-amber-600/90 text-white'
            }`}
          >
            {movie.status === 'now_showing' ? 'Now Showing' : 'Coming Soon'}
          </span>

          {movie.rating > 0 && (
            <div className="flex items-center gap-1 bg-black/75 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-xs font-semibold text-amber-400 shadow-md">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Certificate / Language Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 pointer-events-none">
          <span className="bg-black/80 backdrop-blur-md border border-gray-700 text-gray-200 text-[10px] font-semibold px-1.5 py-0.5 rounded">
            {movie.certificate || 'PG-13'}
          </span>
          <span className="bg-black/80 backdrop-blur-md border border-gray-700 text-gray-300 text-[10px] font-medium px-1.5 py-0.5 rounded">
            {movie.language || 'English'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Genre list */}
          <div className="flex flex-wrap gap-1 mb-2">
            {(movie.genre || []).slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-[10px] font-medium text-gray-400 bg-gray-800/80 px-2 py-0.5 rounded-full"
              >
                {g}
              </span>
            ))}
          </div>

          <h3 className="text-base font-bold text-white line-clamp-1 group-hover:text-red-400 transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-4 text-xs text-gray-400 mt-2 mb-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              {movie.duration}m
            </span>
            <span>{movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : '2024'}</span>
          </div>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
            {movie.description}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-800/80">
          <Link
            to={`/movies/${movie._id}`}
            className="w-full py-2 px-2 rounded-xl text-xs font-semibold text-gray-300 bg-gray-800/80 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            Details
          </Link>

          {movie.status === 'now_showing' ? (
            <button
              onClick={() => navigate(`/book/${movie._id}`)}
              className="w-full py-2 px-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center justify-center gap-1"
            >
              <Ticket className="w-3.5 h-3.5" />
              Book Seats
            </button>
          ) : (
            <button
              disabled
              className="w-full py-2 px-2 rounded-xl text-xs font-semibold text-gray-400 bg-gray-800/40 cursor-not-allowed flex items-center justify-center gap-1"
            >
              Coming Soon
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
