import React from 'react';
import { Armchair, Sparkles, Check, AlertCircle } from 'lucide-react';

interface SeatMapProps {
  rows: number;
  cols: number;
  bookedSeats: string[];
  selectedSeats: string[];
  onToggleSeat: (seatId: string) => void;
  pricing: {
    standard: number;
    premium: number;
    vip: number;
  };
  maxSelectable?: number;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  rows,
  cols,
  bookedSeats,
  selectedSeats,
  onToggleSeat,
  pricing,
  maxSelectable = 8,
}) => {
  // Row letters: A, B, C, D, E, F...
  const rowLetters = Array.from({ length: rows }, (_, i) => String.fromCharCode(65 + i));

  // Determine tier based on row index
  const getTier = (rowIndex: number): 'vip' | 'premium' | 'standard' => {
    if (rowIndex <= 1) return 'vip';
    if (rowIndex <= Math.floor(rows / 2)) return 'premium';
    return 'standard';
  };

  const getTierColor = (tier: 'vip' | 'premium' | 'standard') => {
    switch (tier) {
      case 'vip':
        return 'border-amber-500/50 text-amber-400';
      case 'premium':
        return 'border-purple-500/50 text-purple-400';
      case 'standard':
        return 'border-blue-500/50 text-blue-400';
    }
  };

  return (
    <div className="w-full bg-[#0d0f17] border border-gray-800 rounded-3xl p-4 sm:p-8 flex flex-col items-center select-none shadow-2xl">
      {/* Cinema Screen Curve */}
      <div className="w-full max-w-2xl mb-12 text-center">
        <div className="cinema-screen-curve w-full mx-auto mb-2 flex items-center justify-center">
          <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-sky-400/80 -mt-1 drop-shadow">
            All Eyes On Screen
          </span>
        </div>
        <p className="text-[10px] tracking-widest text-gray-400 uppercase font-semibold">
          Auditorium Projection View
        </p>
      </div>

      {/* Seating Grid with Row Labels */}
      <div className="w-full max-w-3xl overflow-x-auto pb-4">
        <div className="min-w-[480px] flex flex-col gap-3 items-center">
          {rowLetters.map((letter, rowIndex) => {
            const tier = getTier(rowIndex);

            return (
              <div key={letter} className="flex items-center gap-3">
                {/* Left Row Label with Tier Tag */}
                <div className="w-12 text-right flex items-center justify-end gap-1.5">
                  <span
                    className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${getTierColor(
                      tier
                    )} bg-gray-900`}
                  >
                    {tier.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-gray-400 w-3 text-center">{letter}</span>
                </div>

                {/* Seats in this row */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: cols }, (_, colIndex) => {
                    const seatNumber = `${letter}${colIndex + 1}`;
                    const isBooked = bookedSeats.includes(seatNumber);
                    const isSelected = selectedSeats.includes(seatNumber);

                    // Add a center aisle gap after middle seat
                    const isAisleGap = colIndex === Math.floor(cols / 2) - 1;

                    return (
                      <React.Fragment key={seatNumber}>
                        <button
                          type="button"
                          disabled={isBooked}
                          onClick={() => onToggleSeat(seatNumber)}
                          title={`${seatNumber} • ${tier.toUpperCase()} ($${pricing[tier].toFixed(2)})`}
                          className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-200 group ${
                            isBooked
                              ? 'bg-gray-800/40 text-gray-400 border border-gray-800/80 cursor-not-allowed opacity-40'
                              : isSelected
                              ? 'bg-red-600 text-white shadow-lg shadow-red-600/50 scale-105 border border-red-400 ring-2 ring-red-500/40'
                              : tier === 'vip'
                              ? 'bg-amber-950/25 hover:bg-amber-900/40 border border-amber-600/40 text-amber-200 hover:scale-105'
                              : tier === 'premium'
                              ? 'bg-purple-950/25 hover:bg-purple-900/40 border border-purple-600/40 text-purple-200 hover:scale-105'
                              : 'bg-gray-800/70 hover:bg-gray-700/80 border border-gray-700 text-gray-300 hover:scale-105'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <span className="text-[10px]">{colIndex + 1}</span>
                          )}
                        </button>

                        {/* Center Aisle Spacer */}
                        {isAisleGap && <div className="w-4 sm:w-8"></div>}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Right Row Label */}
                <span className="w-4 text-xs font-bold text-gray-400 text-center">{letter}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Seat Tiers */}
      <div className="w-full max-w-2xl mt-8 pt-6 border-t border-gray-800/80 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gray-800/80 border border-gray-700"></div>
          <span className="text-gray-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-red-600 border border-red-400 flex items-center justify-center text-white">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-white font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-gray-800/40 border border-gray-800/80 opacity-40"></div>
          <span className="text-gray-400">Booked / Occupied</span>
        </div>
      </div>

      {/* Pricing Tiers Badges */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs">
        <span className="px-3 py-1 rounded-full bg-amber-950/40 border border-amber-600/40 text-amber-300 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          VIP (Rows A-B): ${pricing.vip.toFixed(2)}
        </span>
        <span className="px-3 py-1 rounded-full bg-purple-950/40 border border-purple-600/40 text-purple-300">
          Premium (Rows C-D): ${pricing.premium.toFixed(2)}
        </span>
        <span className="px-3 py-1 rounded-full bg-blue-950/40 border border-blue-600/40 text-blue-300">
          Standard (Rows E-F): ${pricing.standard.toFixed(2)}
        </span>
      </div>

      {selectedSeats.length >= maxSelectable && (
        <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/30 border border-amber-800/50 px-3 py-1 rounded-lg">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Maximum of {maxSelectable} seats selectable per single reservation.</span>
        </div>
      )}
    </div>
  );
};
