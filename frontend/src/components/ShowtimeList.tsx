import { useState } from "react";
import { motion } from "framer-motion";
import { MonitorPlay, Calendar } from "lucide-react";
import { Movie, Showtime } from "../types";

interface ShowtimeListProps {
  selectedMovie?: Movie;
  showtimes: Showtime[];
  onSelectShowtime: (showtime: Showtime) => void;
}

export default function ShowtimeList({ selectedMovie, showtimes, onSelectShowtime }: ShowtimeListProps) {
  // 1. FIX PAST TIME BUG: Use exact current Date/Time instead of midnight
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(now.getDate() + 7);

  // Filter showtimes to ONLY include those in the next 7 days AND after the current exact time
  const validShowtimes = (showtimes || []).filter(st => {
    const stDate = new Date(st.startTime);
    return stDate > now && stDate <= nextWeek; 
  });

  // Extract unique dates for tab grouping
  const uniqueDates = Array.from(new Set(validShowtimes.map(st => new Date(st.startTime).toLocaleDateString())));
  const [selectedDate, setSelectedDate] = useState(uniqueDates[0] || "");

  const filteredBySelectedDate = validShowtimes.filter(st => new Date(st.startTime).toLocaleDateString() === selectedDate);

  if (!selectedMovie) return null;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* 2. FIX IMAGE ALIGNMENT: Added a fixed-width container to prevent squishing */}
        <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
          <img 
            src={selectedMovie.posterUrl || "/placeholder.jpg"} 
            alt={selectedMovie.title} 
            className="w-full rounded-2xl shadow-2xl border border-white/10 aspect-[2/3] object-cover" 
          />
        </div>

        <div className="flex-1">
          <h2 className="text-5xl font-black mb-4 tracking-tight">{selectedMovie.title}</h2>
          <p className="text-neutral-400 text-lg mb-10 leading-relaxed max-w-3xl">{selectedMovie.description}</p>
          
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <MonitorPlay className="text-rose-500" /> Bookable Dates (Next 7 Days)
          </h3>

          {uniqueDates.length === 0 ? (
            <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl text-center">
              <p className="text-neutral-400 text-lg">There are no upcoming showtimes available for this movie.</p>
            </div>
          ) : (
            <>
              {/* Date Tabs */}
              <div className="flex gap-2 overflow-x-auto mb-8 pb-2 scrollbar-hide">
                {uniqueDates.map(dateStr => (
                  <button 
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold whitespace-nowrap transition ${
                      selectedDate === dateStr ? "bg-rose-600 text-white" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"
                    }`}
                  >
                    <Calendar className="w-4 h-4" /> {dateStr}
                  </button>
                ))}
              </div>

              {/* Showtimes for selected date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredBySelectedDate.map(st => (
                  <button 
                    key={st.id} 
                    onClick={() => onSelectShowtime(st)}
                    className="bg-neutral-900 border border-neutral-800 hover:border-rose-500 p-6 rounded-2xl text-left transition group shadow-lg"
                  >
                    <div className="text-rose-500 font-bold mb-2 uppercase tracking-wider text-sm">
                      {st.screen?.name || "Unknown Screen"}
                    </div>
                    <div className="text-3xl font-black mb-2 text-white group-hover:text-rose-400 transition">
                      {new Date(st.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="text-neutral-400 font-mono flex justify-between items-center">
                      <span>${st.ticketPrice?.toFixed(2) || "0.00"}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}