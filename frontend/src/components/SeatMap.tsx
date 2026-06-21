import { motion } from "framer-motion";
import { Armchair } from "lucide-react";
import { Showtime } from "../types";

interface SeatMapProps {
  selectedShowtime?: Showtime;
  bookedSeats: string[];
  onHoldSeat: (seatId: string) => void;
}

export default function SeatMap({ selectedShowtime, bookedSeats, onHoldSeat }: SeatMapProps) {
  const ROWS = ['A', 'B', 'C', 'D', 'E'];
  const SEATS_PER_ROW = 8;

  // Early return if data is not yet available to prevent crash
  if (!selectedShowtime) return null;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-2">{selectedShowtime.screen?.name || "Screen"}</h2>
        <p className="text-neutral-400">Select your preferred seat</p>
      </div>

      <div className="relative w-full h-24 mb-20 flex justify-center">
        <div className="absolute top-0 w-3/4 h-full bg-linear-to-b from-white/20 to-transparent rounded-t-[100%] blur-sm opacity-50"></div>
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

              return (
                <button
                  key={seatId}
                  onClick={() => onHoldSeat(seatId)}
                  disabled={isBooked}
                  className={`group relative w-10 h-10 sm:w-12 sm:h-12 rounded-t-lg rounded-b-sm flex items-center justify-center transition-all border-b-4 
                    ${isBooked 
                      ? "bg-neutral-900 border-neutral-950 opacity-40 cursor-not-allowed" 
                      : "bg-neutral-800 border-neutral-950 hover:bg-rose-500 hover:border-rose-700 hover:-translate-y-1"
                    }`}
                >
                  <Armchair className={`w-5 h-5 transition ${isBooked ? "text-neutral-800" : "text-neutral-600 group-hover:text-white"}`} />
                  {!isBooked && (
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
    </motion.div>
  );
}