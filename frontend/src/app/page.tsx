"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion } from "framer-motion";
import { Film, ArrowLeft, Loader2 } from "lucide-react";

// Components
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MovieList from "../components/MovieList";
import BrowseMovies from "../components/BrowseMovies";
import ShowtimeList from "../components/ShowtimeList";
import SeatMap from "../components/SeatMap";
import CheckoutPanel from "../components/CheckoutPanel";
import SuccessTicket from "../components/SuccessTicket";
import AuthModal from "../components/AuthModal";
import AdminDashboard from "../components/AdminDashboard";

// Types
import { Movie, Showtime } from "../types";

export default function CinemaHome() {
  // State Management
  const router = useRouter();
  const [view, setView] = useState<"movies" | "browse" | "showtimes" | "seats" | "checkout" | "success" | "dashboard">("movies");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  
  const [selectedMovie, setSelectedMovie] = useState<Movie>();
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime>();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]); // NOW AN ARRAY!
  
  const [user, setUser] = useState<{ token: string; email: string } | null>(null);
  const [userId, setUserId] = useState(() => "User-" + Math.floor(Math.random() * 10000));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Helper function to guarantee a string is returned for error messages
  const getErrorMessage = (error: any, fallback: string): string => {
    if (typeof error?.response?.data === "string") return error.response.data;
    if (typeof error?.response?.data?.message === "string") return error.response.data.message;
    if (typeof error?.message === "string") return error.message;
    return fallback;
  };

  // Catch Stripe Redirect & Finalize Booking
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");
    const urlSeatIds = query.get("seat_ids"); // NOW GRABS COMMA SEPARATED IDS
    const urlShowtimeId = query.get("showtime_id");
    const urlUserId = query.get("user_id");

    if (sessionId && urlSeatIds && urlShowtimeId && urlUserId) {
      axios.post("http://localhost:8080/api/v1/bookings/checkout", null, {
        params: {
          showtimeId: urlShowtimeId,
          seatIds: urlSeatIds,
          userId: urlUserId,
          creditCardNumber: "stripe_session_" + sessionId,
        },
      }).then(() => {
        setSelectedSeats(urlSeatIds.split(',')); // Turn back into array
        setUserId(urlUserId); 
        setView("success");
        window.history.replaceState(null, "", "/"); // Clean the URL
      }).catch(err => {
        console.error("Failed to finalize booking", err);
      });
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/v1/catalog/movies");
        setMovies(res.data);
      } catch (err) {
        console.error("Failed to fetch movies", err);
      }
    };
    fetchData();
  }, []);

  // Polling effect: Refreshes booked seats every 3 seconds while in 'seats' view
  useEffect(() => {
    if (view === "seats" && selectedShowtime) {
      const interval = setInterval(() => {
        handleRefreshSeats(selectedShowtime.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [view, selectedShowtime]);

  const handleRefreshSeats = async (showtimeId: number) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/bookings/tickets?showtimeId=${showtimeId}`);
      setBookedSeats(response.data.map((t: any) => t.seatId));
    } catch (err) {
      console.error("Could not refresh seat map.", err);
    }
  };

  // Event Handlers
  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    axios.get(`http://localhost:8080/api/v1/catalog/showtimes?movieId=${movie.id}`)
      .then(res => setShowtimes(res.data))
      .catch(err => setErrorMessage("Failed to load showtimes."));
    setView("showtimes");
  };

  const handleSelectShowtime = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    handleRefreshSeats(showtime.id);
    setView("seats");
  };

  const handleHoldSeats = async (seatIds: string[]) => {
    setErrorMessage("");
    try {
      // Spring Boot reads a comma-separated string as a List<String>
      await axios.post(`http://localhost:8080/api/v1/bookings/hold`, null, {
        params: { showtimeId: selectedShowtime?.id, seatIds: seatIds.join(','), userId: userId }
      });
      setSelectedSeats(seatIds);
      setView("checkout");
    } catch (error: any) {
      setErrorMessage("One or more seats are already taken or unavailable.");
      setSelectedSeats([]);
    }
  };

  const handleCheckout = async () => {
    setErrorMessage("");
    setIsProcessingPayment(true);

    try {
      const response = await axios.post("http://localhost:8080/api/v1/payments/create-checkout-session", {
        showtimeId: selectedShowtime?.id,
        seatIds: selectedSeats, // Send array of seats
        userId: userId,
        amount: selectedShowtime?.ticketPrice
      });

      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Backend did not return a Stripe URL. Please update PaymentService.java.");
      }
    } catch (error: any) {
      console.error("Checkout Error Details:", error);
      setErrorMessage(getErrorMessage(error, "Checkout failed. Is your Spring Boot backend running?"));
      setIsProcessingPayment(false);
    }
  };

  const resetFlow = () => {
    setView("movies");
    setSelectedMovie(undefined);
    setSelectedShowtime(undefined);
    setSelectedSeats([]);
    setErrorMessage("");
  };

  const handleLoginSuccess = (token: string, email: string, roles?: string[]) => {
    setUser({ token, email });
    setIsAuthModalOpen(false);
    setUserId(email.trim().toLowerCase());

    if (roles && roles.includes("ROLE_ADMIN")) {
      setView("dashboard");
    } else {
      setView("movies");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 relative">
      <Navbar 
        onNavigateHome={resetFlow} 
        onNavigateBrowse={() => setView("browse")}
        userEmail={user?.email}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          setUser(null);
          setUserId("User-" + Math.floor(Math.random() * 10000));
          if (view === "dashboard") setView("movies");
        }}
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      {isProcessingPayment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-950/90 backdrop-blur-md">
          <div className="text-center bg-neutral-900 p-10 rounded-3xl border border-neutral-800 shadow-2xl">
            <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Redirecting to Stripe...</h2>
            <p className="text-neutral-400">Securely communicating with the payment gateway...</p>
          </div>
        </div>
      )}

      {view === "movies" && (
        <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black mb-6 tracking-tighter"
          >
            GREAT STORIES. <span className="text-rose-600">BIG SCREEN.</span>
          </motion.h1>
        </section>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-12">
        {view === "dashboard" ? (
          <AdminDashboard />
        ) : (
          <>
            {view !== "movies" && view !== "success" && (
              <button
                onClick={() => setView(view === "checkout" ? "seats" : "movies")}
                className="mb-8 flex items-center text-rose-400 font-bold uppercase text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </button>
            )}

            {errorMessage && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 mb-8 rounded-xl">
                {errorMessage}
              </div>
            )}

            {view === "movies" && <MovieList movies={movies} onSelectMovie={handleSelectMovie} />}
            {view === "browse" && <BrowseMovies movies={movies} onSelectMovie={handleSelectMovie} />}
            
            {view === "showtimes" && selectedMovie && (
              <ShowtimeList selectedMovie={selectedMovie} showtimes={showtimes} onSelectShowtime={handleSelectShowtime} />
            )}
            
            {view === "seats" && selectedShowtime && (
              <SeatMap selectedShowtime={selectedShowtime} bookedSeats={bookedSeats} onHoldSeats={handleHoldSeats} />
            )}
            
            {view === "checkout" && selectedShowtime && selectedSeats.length > 0 && (
              <CheckoutPanel selectedShowtime={selectedShowtime} selectedSeats={selectedSeats} onCheckout={handleCheckout} />
            )}
            
            {view === "success" && selectedSeats.length > 0 && (
              <SuccessTicket selectedSeats={selectedSeats} userId={userId} onReset={resetFlow} />
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}