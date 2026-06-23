import { useState } from "react";
import { motion } from "framer-motion";
import { Armchair, ArrowRight } from "lucide-react";
import { Showtime } from "../types";

interface SeatMapProps {
  selectedShowtime?: Showtime;
  bookedSeats: string[];
  onHoldSeats: (seatIds: string[]) => void;
}

export default function SeatMap({ selectedShowtime, bookedSeats, onHoldSeats }: SeatMapProps) {
  const [localSelected, setLocalSelected] = useState<string[]>([]);
  const ROWS = ['A', 'B', 'C', 'D', 'E'];
  const SEATS_PER_ROW = 8;
  const MAX_SEATS = 5;

  if (!selectedShowtime) return null;

  const toggleSeat = (seatId: string) => {
    if (localSelected.includes(seatId)) {
      setLocalSelected(localSelected.filter(id => id !== seatId));
    } else {
      if (localSelected.length >= MAX_SEATS) {
        alert(`You can only book a maximum of ${MAX_SEATS} seats at a time.`);
        return;
      }
      setLocalSelected([...localSelected, seatId]);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">{selectedShowtime.screen?.name || "Screen"}</h2>
        <p className="text-neutral-400">Select up to {MAX_SEATS} seats</p>
      </div>

      <div className="relative w-full h-24 mb-20 flex justify-center">
        <div className="absolute top-0 w-3/4 h-full bg-gradient-to-b from-white/20 to-transparent rounded-t-[100%] blur-sm opacity-50"></div>
        <div className="absolute top-4 w-2/3 h-2 bg-rose-500/50 shadow-[0_0_30px_10px_rgba(244,63,94,0.3)] rounded-full"></div>
        <p className="absolute top-10 text-neutral-500 uppercase tracking-[0.5em] text-sm font-bold">Screen</p>
      </div>

      <div className="flex flex-col gap-4 items-center mb-12">
        {ROWS.map(row => (
          <div key={row} className="flex gap-2 sm:gap-4">
            <div className="w-8 flex items-center justify-center text-neutral-600 font-bold">{row}</div>
            {Array.from({ length: SEATS_PER_ROW }).map((_, i) => {
              const seatId = `${row}${i + 1}`;
              const isBooked = Array.isArray(bookedSeats) && bookedSeats.includes(seatId);
              const isSelected = localSelected.includes(seatId);

              return (
                <button
                  key={seatId}
                  onClick={() => toggleSeat(seatId)}
                  disabled={isBooked}
                  className={`group relative w-10 h-10 sm:w-12 sm:h-12 rounded-t-lg rounded-b-sm flex items-center justify-center transition-all border-b-4 
                    ${isBooked 
                      ? "bg-neutral-900 border-neutral-950 opacity-40 cursor-not-allowed" 
                      : isSelected
                        ? "bg-rose-500 border-rose-700 -translate-y-2 shadow-lg shadow-rose-500/50"
                        : "bg-neutral-800 border-neutral-950 hover:bg-neutral-700 hover:border-neutral-800"
                    }`}
                >
                  <Armchair className={`w-5 h-5 transition ${isBooked ? "text-neutral-800" : isSelected ? "text-white" : "text-neutral-600 group-hover:text-white"}`} />
                  {!isBooked && !isSelected && (
                    <span className="absolute -top-8 bg-neutral-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {seatId}
                    </span>
                  )}
                </button>
              );
            })}
            <div className="w-8 flex items-center justify-center text-neutral-600 font-bold">{row}</div>
          </div>
        ))}
      </div>

      {/* Confirmation Bar */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-neutral-400 font-bold mb-1">Seats Selected ({localSelected.length}/{MAX_SEATS})</div>
          <div className="text-xl font-bold text-rose-500">{localSelected.length > 0 ? localSelected.join(", ") : "None"}</div>
        </div>
        <button 
          onClick={() => onHoldSeats(localSelected)}
          disabled={localSelected.length === 0}
          className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-xl transition flex items-center gap-2"
        >
          Proceed <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}