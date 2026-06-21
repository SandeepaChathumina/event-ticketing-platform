import { useState } from "react";
import { Movie } from "../types";
// Corrected import path for the MovieList component
import MovieList from "./MovieList"; 
import { Search } from "lucide-react";

interface BrowseMoviesProps {
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export default function BrowseMovies({ movies, onSelectMovie }: BrowseMoviesProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMovies = movies.filter((m) =>
    m.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <h2 className="text-4xl font-black">All Available Movies</h2>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search movies by title..."
            className="w-full bg-neutral-900 border border-neutral-800 text-white pl-12 pr-6 py-4 rounded-full focus:outline-none focus:border-rose-500 transition"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredMovies.length > 0 ? (
        <MovieList movies={filteredMovies} onSelectMovie={onSelectMovie} />
      ) : (
        <div className="text-center py-20 border border-neutral-900 rounded-3xl">
          <p className="text-neutral-500 text-lg">No movies found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}