import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Film,
  Ticket,
  Shield,
  User as UserIcon,
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  X,
  Compass,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0c10]/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-wider text-white flex items-center">
                I<span className="text-red-500">MOVIES</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-gray-400 font-semibold -mt-1">
                Cinema Premiere
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/movies')
                  ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                  : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Movies
            </Link>

            {user && (
              <Link
                to="/my-bookings"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/my-bookings')
                    ? 'bg-red-600/10 text-red-500 border border-red-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Ticket className="w-4 h-4" />
                My Bookings
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-950/40'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" />
                Admin Dashboard
              </Link>
            )}
          </div>

          {/* Right side buttons & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1.5 rounded-lg border border-gray-700 flex items-center gap-1.5 transition-colors"
                title="Quick 1-Click Demo Accounts"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Demo Access</span>
              </button>

              {demoMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl p-2 z-50"
                  onMouseLeave={() => setDemoMenuOpen(false)}
                >
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                    Instant Demo Login
                  </p>
                  <button
                    onClick={async () => {
                      await quickLogin('user');
                      setDemoMenuOpen(false);
                      navigate('/movies');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-gray-200 hover:bg-gray-800 rounded-lg flex items-center justify-between"
                  >
                    <span>Login as Demo User</span>
                    <span className="text-[10px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded">User</span>
                  </button>
                  <button
                    onClick={async () => {
                      await quickLogin('admin');
                      setDemoMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/40 rounded-lg flex items-center justify-between"
                  >
                    <span>Login as Admin</span>
                    <span className="text-[10px] text-amber-400 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-800">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-gray-400 capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800/80 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-md shadow-red-600/30 hover:shadow-red-600/50 transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-800 bg-[#0f1117] px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-gray-800"
          >
            Home
          </Link>
          <Link
            to="/movies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-gray-800"
          >
            Explore Movies
          </Link>
          {user && (
            <Link
              to="/my-bookings"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-gray-200 hover:bg-gray-800"
            >
              My Bookings
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-amber-400 hover:bg-amber-950/40"
            >
              Admin Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-gray-800 flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  await quickLogin('user');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-gray-800 text-gray-300 rounded-lg border border-gray-700"
              >
                Demo User
              </button>
              <button
                onClick={async () => {
                  await quickLogin('admin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 text-xs bg-amber-950/60 text-amber-300 rounded-lg border border-amber-800"
              >
                Demo Admin
              </button>
            </div>

            {user ? (
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm text-gray-300">{user.name} ({user.role})</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-400 flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm bg-gray-800 text-white rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-sm bg-red-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
