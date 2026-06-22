"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Film, ArrowLeft } from "lucide-react";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MovieList from "../components/MovieList";
import BrowseMovies from "../components/BrowseMovies";
import ShowtimeList from "../components/ShowtimeList";
import SeatMap from "../components/SeatMap";
import CheckoutPanel from "../components/CheckoutPanel";
import SuccessTicket from "../components/SuccessTicket";
import { Movie, Showtime } from "../types";

export default function CinemaHome() {
  const [view, setView] = useState<'movies' | 'browse' | 'showtimes' | 'seats' | 'checkout' | 'success'>('movies');
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

  // Polling effect: Refreshes booked seats every 3 seconds while in 'seats' view
  useEffect(() => {
    if (view === 'seats' && selectedShowtime) {
      const interval = setInterval(() => {
        fetchBookedSeats(selectedShowtime.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [view, selectedShowtime]);

  const fetchMovies = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/catalog/movies");
      setMovies(response.data);
    } catch (err) { console.error("Failed to load movies"); }
    finally { setLoading(false); }
  };

  const fetchBookedSeats = async (showtimeId: number) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/bookings/tickets?showtimeId=${showtimeId}`);
      setBookedSeats(response.data.map((t: any) => t.seatId));
    } catch (err) { console.error("Could not refresh seat map."); }
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
    fetchBookedSeats(st.id);
  };

  const handleHoldSeat = async (seatId: string) => {
    setErrorMessage("");
    try {
      await axios.post("http://localhost:8080/api/v1/bookings/hold", null, {
        params: { showtimeId: selectedShowtime?.id, seatId, userId }
      });
      setSelectedSeat(seatId);
      setView('checkout');
    } catch (error: any) {
      const message = error.response?.data && typeof error.response.data === 'string'
        ? error.response.data
        : (error.response?.data?.message || "Seat unavailable. Please try another.");
      setErrorMessage(message);
    }
  };

  const handleCheckout = async () => {
    try {
      await axios.post("http://localhost:8080/api/v1/bookings/checkout", null, {
        params: { showtimeId: selectedShowtime?.id, seatId: selectedSeat, userId, creditCardNumber: "4111222233334444" }
      });
      setView('success');
    } catch (error: any) { 
      const message = error.response?.data && typeof error.response.data === 'string'
        ? error.response.data
        : (error.response?.data?.message || "Checkout failed.");
      setErrorMessage(message);
    }
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
      <Navbar onNavigateHome={resetFlow} onNavigateBrowse={() => setView('browse')} />
      
      {view === 'movies' && (
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
            GREAT STORIES. <span className="text-rose-600">BIG SCREEN.</span>
          </motion.h1>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-6 py-12">
        {view !== 'movies' && view !== 'success' && (
          <button onClick={() => setView(view === 'checkout' ? 'seats' : 'movies')} className="mb-8 flex items-center text-rose-400 font-bold uppercase text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </button>
        )}

        {errorMessage && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 mb-8 rounded-xl">{errorMessage}</div>}

        {view === 'movies' && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
        {view === 'browse' && <BrowseMovies movies={movies} onSelectMovie={handleSelectMovie} />}
        {view === 'showtimes' && selectedMovie && <ShowtimeList selectedMovie={selectedMovie} showtimes={showtimes} onSelectShowtime={handleSelectShowtime} />}
        {view === 'seats' && selectedShowtime && <SeatMap selectedShowtime={selectedShowtime} bookedSeats={bookedSeats} onHoldSeat={handleHoldSeat} />}
        {view === 'checkout' && selectedShowtime && selectedSeat && <CheckoutPanel selectedShowtime={selectedShowtime} selectedSeat={selectedSeat} onCheckout={handleCheckout} />}
        {view === 'success' && selectedSeat && <SuccessTicket selectedSeat={selectedSeat} userId={userId} onReset={resetFlow} />}
      </main>

      <Footer />
    </div>
  );
}