"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Film, ArrowLeft } from "lucide-react";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MovieList from "../components/MovieList";
import ShowtimeList from "../components/ShowtimeList";
import SeatMap from "../components/SeatMap";
import CheckoutPanel from "../components/CheckoutPanel";
import SuccessTicket from "../components/SuccessTicket";
import { Movie, Showtime } from "../types";

export default function CinemaHome() {
  const [view, setView] = useState<'movies' | 'showtimes' | 'seats' | 'checkout' | 'success'>('movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [userId] = useState(() => "User-" + Math.floor(Math.random() * 10000));
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/catalog/movies");
      setMovies(response.data);
    } catch (err) { console.error("Failed to load movies"); }
    finally { setLoading(false); }
  };

  const handleSelectMovie = async (movie: Movie) => {
    setSelectedMovie(movie);
    setView('showtimes');
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/catalog/showtimes?movieId=${movie.id}`);
      setShowtimes(response.data);
    } catch (err) { setErrorMessage("Failed to load showtimes."); }
  };

  const handleSelectShowtime = async (st: Showtime) => {
    setSelectedShowtime(st);
    setView('seats');
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/bookings/tickets?showtimeId=${st.id}`);
      setBookedSeats(response.data.map((t: any) => t.seatId));
    } catch (err) { setErrorMessage("Could not load seat map."); }
  };

  const handleHoldSeat = async (seatId: string) => {
    setErrorMessage("");
    setSelectedSeat(seatId);
    try {
      await axios.post("http://localhost:8080/api/v1/bookings/hold", null, {
        params: { showtimeId: selectedShowtime?.id, seatId, userId }
      });
      setView('checkout');
    } catch (error: any) {
      setErrorMessage(error.response?.data || "Seat unavailable.");
      setSelectedSeat(null);
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post("http://localhost:8080/api/v1/bookings/checkout", null, {
        params: { showtimeId: selectedShowtime?.id, seatId: selectedSeat, userId, creditCardNumber: "4111222233334444" }
      });
      setView('success');
    } catch (error: any) { setErrorMessage("Checkout failed."); }
  };

  const resetFlow = () => {
    setView('movies');
    setSelectedMovie(null);
    setSelectedShowtime(null);
    setSelectedSeat(null);
    setErrorMessage("");
  };

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><Film className="w-12 h-12 text-rose-500 animate-pulse" /></div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      {/* Pass resetFlow to Navbar */}
      <Navbar onNavigateHome={resetFlow} />
      
      {/* Hero Section - Only show on 'movies' view */}
      {view === 'movies' && (
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter"
          >
            GREAT STORIES. <span className="text-rose-600">BIG SCREEN.</span>
          </motion.h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Book your tickets for the latest blockbusters at Dons Plaza. Comfort, clarity, and the magic of film.
          </p>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view !== 'movies' && view !== 'success' && (
          <button onClick={() => setView(view === 'checkout' ? 'seats' : 'movies')} className="mb-8 flex items-center text-rose-400 font-bold uppercase text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        )}

        {errorMessage && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 mb-8 rounded-xl">{errorMessage}</div>}

        {view === 'movies' && (
          <div className="space-y-20">
            {/* Now Showing Section */}
            <section>
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
                <span className="w-1 h-8 bg-rose-600 rounded-full"></span> Now Showing
              </h2>
              <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
            </section>

            {/* Upcoming Movies Section */}
            <section>
              <h2 className="text-3xl font-bold mb-10 flex items-center gap-3">
                <span className="w-1 h-8 bg-neutral-600 rounded-full"></span> Coming Soon
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl opacity-60">
                    <div className="w-full h-48 bg-neutral-800 rounded-xl mb-4"></div>
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
        
        {view === 'showtimes' && selectedMovie && <ShowtimeList selectedMovie={selectedMovie} showtimes={showtimes} onSelectShowtime={handleSelectShowtime} />}
        {view === 'seats' && selectedShowtime && <SeatMap selectedShowtime={selectedShowtime} bookedSeats={bookedSeats} onHoldSeat={handleHoldSeat} />}
        {view === 'checkout' && selectedShowtime && selectedSeat && <CheckoutPanel selectedShowtime={selectedShowtime} selectedSeat={selectedSeat} onCheckout={handleCheckout} />}
        {view === 'success' && selectedSeat && <SuccessTicket selectedSeat={selectedSeat} userId={userId} onReset={resetFlow} />}
      </main>

      <Footer />
    </div>
  );
}