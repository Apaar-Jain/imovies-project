import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Film,
  Ticket,
  Printer,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { IBooking } from '../types/index.ts';

interface BookingConfirmationModalProps {
  booking: IBooking;
  onClose: () => void;
}

export const BookingConfirmationModal: React.FC<BookingConfirmationModalProps> = ({
  booking,
  onClose,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Fire celebratory confetti on modal render
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#ffffff'],
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative bg-[#0f1118] border border-gray-700/80 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-3 shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Booking Confirmed!
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Your movie tickets are safely reserved in our cinema database.
          </p>
        </div>

        {/* Digital Ticket Pass Card */}
        <div className="bg-[#151822] border border-gray-700/70 rounded-2xl overflow-hidden shadow-xl mb-6 relative">
          {/* Top Movie Header Strip */}
          <div className="p-4 bg-gradient-to-r from-red-950/60 via-red-900/30 to-gray-900 border-b border-gray-700/60 flex items-start gap-3">
            <div className="w-12 h-16 rounded-lg overflow-hidden bg-gray-950 shrink-0 border border-gray-700">
              <img
                src={booking.movie.posterUrl}
                alt={booking.movie.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-red-400 tracking-wider uppercase">
                Cinema Premiere Pass
              </span>
              <h3 className="text-base font-bold text-white truncate">
                {booking.movie.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                <span>{booking.movie.certificate || 'PG-13'}</span>
                <span>•</span>
                <span>{booking.movie.duration}m</span>
                <span>•</span>
                <span>{booking.screenName}</span>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="p-5 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Booking Reference
              </span>
              <span className="font-mono text-sm font-bold text-red-400 tracking-wider">
                {booking.bookingReference}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                Payment Status
              </span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified & Confirmed
              </span>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin className="w-3 h-3 text-red-400" /> Cinema Location
              </span>
              <p className="font-semibold text-white truncate">{booking.cinema.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{booking.cinema.address}</p>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-red-400" /> Date & Time
              </span>
              <p className="font-semibold text-white">{formattedDate}</p>
              <p className="text-[11px] text-red-300 font-medium">{formattedTime}</p>
            </div>

            <div className="col-span-2 pt-2 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    Reserved Seats ({booking.seats.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {booking.seats.map((seat) => (
                      <span
                        key={seat.seatNumber}
                        className="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-red-300 font-bold text-xs"
                      >
                        {seat.seatNumber}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    Total Paid
                  </span>
                  <span className="text-lg font-black text-white">
                    ${booking.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Barcode Strip */}
          <div className="bg-black/60 p-3 border-t border-dashed border-gray-700/80 flex items-center justify-between">
            <div className="flex items-center gap-1 font-mono tracking-[0.25em] text-[10px] text-gray-400">
              ||||| ||| |||| |||||| ||||| ||| |||||||
            </div>
            <span className="text-[10px] text-gray-400 font-mono">
              SCAN AT ENTRANCE
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handlePrint}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-200 bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print / Save Pass
          </button>

          <button
            onClick={() => {
              onClose();
              navigate('/my-bookings');
            }}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            View in My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};
