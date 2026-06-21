import { motion } from "framer-motion";
import { Clock, ChevronRight } from "lucide-react";
import { Movie } from "../types";

interface MovieListProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export default function MovieList({ movies, onSelectMovie }: MovieListProps) {
  // Safely fallback to an empty array if the API returns an error object or undefined
  const movieList = Array.isArray(movies) ? movies : [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {movieList.map((movie) => (
        <div key={movie.id} className="group">
          <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/5 cursor-pointer" onClick={() => onSelectMovie(movie)}>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10 opacity-80 group-hover:opacity-60 transition" />
            <img src={movie.posterUrl} alt={movie.title} className="object-cover w-full h-full group-hover:scale-110 transition duration-700 ease-out" />
            <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-bold uppercase tracking-wider">
              {movie.ageRating}
            </div>
            <div className="absolute bottom-6 left-6 z-20">
               <h2 className="text-2xl font-bold mb-1">{movie.title}</h2>
               <div className="flex items-center gap-3 text-sm text-neutral-300 font-medium">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {movie.durationMinutes}m</span>
              </div>
            </div>
          </div>
          <button onClick={() => onSelectMovie(movie)} className="w-full bg-white/5 hover:bg-rose-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 border border-white/10 group-hover:border-transparent">
            View Showtimes <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ))}
    </motion.div>
  );
}