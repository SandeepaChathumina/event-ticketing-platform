"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Film, Star, ChevronRight, ArrowLeft, Ticket, CheckCircle, AlertCircle, MonitorPlay, Armchair } from "lucide-react";

// --- Types matching Spring Boot ---
interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
  durationMinutes: number;
  ageRating: string;
}

interface Screen {
  id: number;
  name: string;
  totalCapacity: number;
}

interface Showtime {
  id: number;
  movie: Movie;
  screen: Screen;
  startTime: string;
  ticketPrice: number;
}

export default function CinemaHome() {
  // --- States ---
  const [view, setView] = useState<'movies' | 'showtimes' | 'seats' | 'checkout' | 'success'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  
  const [userId] = useState(() => "User-" + Math.floor(Math.random() * 10000));
  const [holdMessage, setHoldMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  // Generate a realistic cinema grid (Rows A-E, 8 seats per row)
  const ROWS = ['A', 'B', 'C', 'D', 'E'];
  const SEATS_PER_ROW = 8;

  // --- Initial Load ---
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/catalog/movies");
      setMovies(response.data);
    } catch (err) {
      console.error("Failed to load movies");
    } finally {
      setLoading(false);
    }
  };

  // --- Actions ---
  const handleSelectMovie = async (movie: Movie) => {
    setSelectedMovie(movie);
    setView('showtimes');
    try {
      // Fetch showtimes specific to this movie!
      const response = await axios.get(`http://localhost:8080/api/v1/catalog/showtimes?movieId=${movie.id}`);
      setShowtimes(response.data);
    } catch (err) {
      setErrorMessage("Failed to load showtimes.");
    }
  };

  const handleHoldSeat = async (seatId: string) => {
    setErrorMessage("");
    setHoldMessage("");
    setSelectedSeat(seatId);

    try {
      await axios.post("http://localhost:8080/api/v1/bookings/hold", null, {
        params: { showtimeId: selectedShowtime?.id, seatId, userId }
      });
      
      setHoldMessage(`Seat ${seatId} successfully locked for 10 minutes!`);
      setView('checkout');
    } catch (error: any) {
      if (error.response?.status === 409) {
        setErrorMessage(`Seat ${seatId} is already locked by someone else!`);
        setSelectedSeat(null);
      } else {
        setErrorMessage("An error occurred connecting to the server.");
      }
    }
  };

  const handleCheckout = async () => {
    setErrorMessage("");
    try {
      await axios.post("http://localhost:8080/api/v1/bookings/checkout", null, {
        params: { 
          showtimeId: selectedShowtime?.id, 
          seatId: selectedSeat, 
          userId,
          creditCardNumber: "4111222233334444" 
        }
      });
      setView('success');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Checkout failed. Lock may have expired.");
    }
  };

  const resetFlow = () => {
    setView('movies');
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeat(null);
    setErrorMessage("");
  };

  // --- Renderers ---
  if (loading) return <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center"><Film className="w-12 h-12 text-rose-500 animate-pulse mb-4" /><p className="text-rose-500 font-medium tracking-widest uppercase">Loading CineTicket...</p></div>;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header / Nav */}
        <header className="mb-12 border-b border-neutral-800 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 onClick={resetFlow} className="text-4xl font-black tracking-tighter cursor-pointer bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent inline-block">
              CineTicket
            </h1>
            <p className="text-neutral-500 text-sm font-mono mt-2">Logged in as: {userId}</p>
          </div>
          
          {view !== 'movies' && view !== 'success' && (
            <button onClick={() => setView(view === 'checkout' ? 'seats' : view === 'seats' ? 'showtimes' : 'movies')} className="flex items-center text-sm font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </button>
          )}
        </header>

        {/* Global Error */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 mb-8 rounded-xl flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" /> {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 1: Movie List */}
        {view === 'movies' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {movies.map((movie) => (
              <div key={movie.id} className="group">
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-6 shadow-2xl border border-white/5 cursor-pointer" onClick={() => handleSelectMovie(movie)}>
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
                <button onClick={() => handleSelectMovie(movie)} className="w-full bg-white/5 hover:bg-rose-600 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 border border-white/10 group-hover:border-transparent">
                  View Showtimes <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </motion.div>
        )}

        {/* VIEW 2: Showtimes */}
        {view === 'showtimes' && selectedMovie && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-col md:flex-row gap-12">
              <img src={selectedMovie.posterUrl} alt={selectedMovie.title} className="w-full md:w-1/3 rounded-2xl shadow-2xl border border-white/10 aspect-[2/3] object-cover" />
              <div className="flex-1">
                <h2 className="text-5xl font-bold mb-4">{selectedMovie.title}</h2>
                <p className="text-neutral-400 text-lg mb-10 leading-relaxed">{selectedMovie.description}</p>
                
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3"><MonitorPlay className="text-rose-500" /> Available Showtimes</h3>
                
                {showtimes.length === 0 ? (
                  <p className="text-neutral-500 italic">No showtimes scheduled for this movie yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {showtimes.map(st => (
                      <button 
                        key={st.id} 
                        onClick={() => { setSelectedShowtime(st); setView('seats'); }}
                        className="bg-neutral-900 border border-neutral-800 hover:border-rose-500 p-6 rounded-2xl text-left transition group"
                      >
                        <div className="text-rose-500 font-bold mb-2 uppercase tracking-wider text-sm">{st.screen.name}</div>
                        <div className="text-2xl font-bold mb-2">{new Date(st.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        <div className="text-neutral-400 font-mono flex justify-between items-center">
                          <span>{new Date(st.startTime).toLocaleDateString()}</span>
                          <span className="text-white font-bold">${st.ticketPrice.toFixed(2)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: Seat Map */}
        {view === 'seats' && selectedShowtime && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-2">{selectedShowtime.screen.name}</h2>
              <p className="text-neutral-400">Select your preferred seat</p>
            </div>

            {/* The Cinema Screen */}
            <div className="relative w-full h-24 mb-20 flex justify-center">
              <div className="absolute top-0 w-3/4 h-full bg-gradient-to-b from-white/20 to-transparent rounded-t-[100%] blur-sm opacity-50"></div>
              <div className="absolute top-4 w-2/3 h-2 bg-rose-500/50 shadow-[0_0_30px_10px_rgba(244,63,94,0.3)] rounded-full"></div>
              <p className="absolute top-10 text-neutral-500 uppercase tracking-[0.5em] text-sm font-bold">Screen</p>
            </div>

            {/* The Seat Grid */}
            <div className="flex flex-col gap-4 items-center mb-12">
              {ROWS.map(row => (
                <div key={row} className="flex gap-2 sm:gap-4">
                  {/* Row Label */}
                  <div className="w-8 flex items-center justify-center text-neutral-600 font-bold">{row}</div>
                  
                  {Array.from({ length: SEATS_PER_ROW }).map((_, i) => {
                    const seatId = `${row}${i + 1}`;
                    return (
                      <button
                        key={seatId}
                        onClick={() => handleHoldSeat(seatId)}
                        className="group relative w-10 h-10 sm:w-12 sm:h-12 bg-neutral-800 hover:bg-rose-500 rounded-t-lg rounded-b-sm flex items-center justify-center transition-all border-b-4 border-neutral-950 hover:border-rose-700 hover:-translate-y-1"
                      >
                        <Armchair className="w-5 h-5 text-neutral-600 group-hover:text-white transition" />
                        <span className="absolute -top-8 bg-neutral-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          {seatId}
                        </span>
                      </button>
                    );
                  })}
                  
                  {/* Row Label Right */}
                  <div className="w-8 flex items-center justify-center text-neutral-600 font-bold">{row}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 4: Checkout */}
        {view === 'checkout' && selectedShowtime && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-center gap-3 text-green-400 bg-green-400/10 py-3 rounded-xl mb-8">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold text-sm">Lock Acquired: 10:00 remaining</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-8 text-neutral-300">
                <div className="flex justify-between"><span>Movie</span> <span className="font-bold text-white text-right">{selectedShowtime.movie.title}</span></div>
                <div className="flex justify-between"><span>Screen</span> <span className="font-bold text-white">{selectedShowtime.screen.name}</span></div>
                <div className="flex justify-between"><span>Seat</span> <span className="font-bold text-rose-400">{selectedSeat}</span></div>
                <div className="flex justify-between pt-4 border-t border-neutral-800">
                  <span>Total</span> <span className="font-bold text-xl text-white">${selectedShowtime.ticketPrice.toFixed(2)}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition hover:-translate-y-1">
                Confirm & Pay
              </button>
            </div>
          </motion.div>
        )}

        {/* VIEW 5: Success */}
        {view === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-4xl font-black mb-4">You're going to the movies!</h2>
            <p className="text-neutral-400 text-lg mb-10 max-w-lg mx-auto">Your ticket for seat <span className="text-white font-bold">{selectedSeat}</span> has been permanently saved to the PostgreSQL database.</p>
            
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm mx-auto mb-10 flex items-center justify-center gap-4">
              <Ticket className="w-8 h-8 text-rose-500" />
              <div className="text-left">
                <div className="text-xs text-neutral-500 uppercase tracking-widest">Entry Code</div>
                <div className="font-mono text-xl font-bold tracking-widest">{selectedSeat}-{userId.split('-')[1]}</div>
              </div>
            </div>

            <button onClick={resetFlow} className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-neutral-200 transition">
              Book Another Ticket
            </button>
          </motion.div>
        )}

      </div>
    </main>
  );
}