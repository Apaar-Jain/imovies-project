import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Film, Database, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';
import { adminApi } from '../services/api.ts';

export const Footer: React.FC = () => {
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleResetData = async () => {
    try {
      setSeeding(true);
      await adminApi.triggerSeed();
      setSeedSuccess(true);
      setTimeout(() => {
        setSeedSuccess(false);
        window.location.reload();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <footer className="bg-[#07080b] border-t border-gray-800/80 text-gray-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-wider text-white">
                I<span className="text-red-500">MOVIES</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Full-Stack Movie Ticket Booking Platform with real-time seat reservation, atomic concurrency safety, and cinema theater management.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Double-Booking Concurrency Safe</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home & Featured
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-white transition-colors">
                  All Movies & Showtimes
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="hover:text-white transition-colors">
                  My Ticket Reservations
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-amber-400 transition-colors">
                  Admin Control Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Architecture & Stack
            </h4>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              <span className="bg-gray-800/90 text-gray-300 px-2 py-0.5 rounded border border-gray-700">React.js 19</span>
              <span className="bg-gray-800/90 text-gray-300 px-2 py-0.5 rounded border border-gray-700">Node.js Express</span>
              <span className="bg-gray-800/90 text-gray-300 px-2 py-0.5 rounded border border-gray-700">MongoDB & Mongoose</span>
              <span className="bg-gray-800/90 text-gray-300 px-2 py-0.5 rounded border border-gray-700">JWT & bcrypt</span>
              <span className="bg-gray-800/90 text-gray-300 px-2 py-0.5 rounded border border-gray-700">Tailwind CSS</span>
              <span className="bg-gray-800/90 text-gray-300 px-2 py-0.5 rounded border border-gray-700">Atomic Concurrency</span>
            </div>
          </div>

          {/* Database & Demo Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-400" />
              Database Status
            </h4>
            <p className="text-xs text-gray-400 mb-3">
              Connected to MongoDB with automatic sample records and admin credentials.
            </p>
            <button
              onClick={handleResetData}
              disabled={seeding}
              className="text-xs bg-gray-800/80 hover:bg-gray-700 text-gray-200 px-3 py-1.5 rounded-lg border border-gray-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {seedSuccess ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Database Refreshed!</span>
                </>
              ) : (
                <>
                  <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-red-400' : ''}`} />
                  <span>{seeding ? 'Re-seeding...' : 'Reset Sample Records'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} IMovies Cinema Platform. Designed for Portfolio & Demonstration.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live REST API
            </span>
            <span>Demonstration Checkout Mode</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
