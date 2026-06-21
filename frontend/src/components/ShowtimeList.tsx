import { motion } from "framer-motion";
import { MonitorPlay } from "lucide-react";
import { Movie, Showtime } from "../types";

interface ShowtimeListProps {
  selectedMovie?: Movie;
  showtimes: Showtime[];
  onSelectShowtime: (showtime: Showtime) => void;
}

export default function ShowtimeList({ selectedMovie, showtimes, onSelectShowtime }: ShowtimeListProps) {
  // If no movie is selected, return null to prevent rendering errors
  if (!selectedMovie) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex flex-col md:flex-row gap-12">
        <img 
          src={selectedMovie.posterUrl || "/placeholder.jpg"} 
          alt={selectedMovie.title || "Movie Poster"} 
          className="w-full md:w-1/3 rounded-2xl shadow-2xl border border-white/10 aspect-2/3 object-cover" 
        />
        <div className="flex-1">
          <h2 className="text-5xl font-bold mb-4">{selectedMovie.title}</h2>
          <p className="text-neutral-400 text-lg mb-10 leading-relaxed">{selectedMovie.description}</p>
          
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><MonitorPlay className="text-rose-500" /> Available Showtimes</h3>
          
          {(!showtimes || showtimes.length === 0) ? (
            <p className="text-neutral-500 italic">No showtimes scheduled for this movie yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {showtimes.map(st => (
                <button 
                  key={st.id} 
                  onClick={() => onSelectShowtime(st)}
                  className="bg-neutral-900 border border-neutral-800 hover:border-rose-500 p-6 rounded-2xl text-left transition group"
                >
                  <div className="text-rose-500 font-bold mb-2 uppercase tracking-wider text-sm">
                    {st.screen?.name || "Unknown Screen"}
                  </div>
                  <div className="text-2xl font-bold mb-2">
                    {new Date(st.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="text-neutral-400 font-mono flex justify-between items-center">
                    <span>{new Date(st.startTime).toLocaleDateString()}</span>
                    <span className="text-white font-bold">${st.ticketPrice?.toFixed(2) || "0.00"}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}