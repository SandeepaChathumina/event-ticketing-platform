"use client";

import { useEffect, useMemo, useState } from "react";
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
  const router = useRouter();
  const [view, setView] = useState<
    | "movies"
    | "browse"
    | "showtimes"
    | "seats"
    | "checkout"
    | "success"
    | "dashboard"
  >("movies");

  // Master Data State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [allShowtimes, setAllShowtimes] = useState<Showtime[]>([]); // Stores all showtimes globally

  // Selection State
  const [showtimes, setShowtimes] = useState<Showtime[]>([]); // Showtimes specifically for the selected movie
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie>();
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime>();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Filter movies that exist in the master allShowtimes list AND are in the future
  const scheduledMovies = useMemo(() => {
    const now = new Date();
    // 1. Filter out past showtimes
    const activeShowtimes = allShowtimes.filter(
      (s) => new Date(s.startTime) >= now,
    );
    // 2. Map only the active showtimes to their movie IDs
    const movieIdsWithShowtimes = new Set(
      activeShowtimes.map((s) => s.movie?.id),
    );
    // 3. Return the filtered movies
    return movies.filter((movie) => movieIdsWithShowtimes.has(movie.id));
  }, [movies, allShowtimes]);

  // User & Auth State
  const [user, setUser] = useState<{
    token: string;
    email: string;
    roles: string[];
  } | null>(null);
  const [userId, setUserId] = useState(
    () => "User-" + Math.floor(Math.random() * 10000),
  );
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const getErrorMessage = (error: any, fallback: string): string => {
    if (typeof error?.response?.data === "string") return error.response.data;
    if (typeof error?.response?.data?.message === "string")
      return error.response.data.message;
    if (typeof error?.message === "string") return error.message;
    return fallback;
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const sessionId = query.get("session_id");
    const urlSeatIds = query.get("seat_ids");
    const urlShowtimeId = query.get("showtime_id");
    const urlUserId = query.get("user_id");

    if (sessionId && urlSeatIds && urlShowtimeId && urlUserId) {
      axios
        .post("http://localhost:8080/api/v1/bookings/checkout", null, {
          params: {
            showtimeId: urlShowtimeId,
            seatIds: urlSeatIds,
            userId: urlUserId,
            creditCardNumber: "stripe_session_" + sessionId,
          },
        })
        .then(() => {
          setSelectedSeats(urlSeatIds.split(","));
          setUserId(urlUserId);
          setView("success");
          window.history.replaceState(null, "", "/");
        })
        .catch((err) => console.error("Failed to finalize booking", err));
    }
  }, []);

  // FIX: Fetch movies first, then fetch showtimes per movie to avoid 400 Bad Request
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch all movies
        const moviesRes = await axios.get(
          "http://localhost:8080/api/v1/catalog/movies",
        );
        const fetchedMovies = moviesRes.data;
        setMovies(fetchedMovies);

        // 2. Fetch showtimes for each movie individually
        const showtimePromises = fetchedMovies.map(
          (movie: Movie) =>
            axios
              .get(
                `http://localhost:8080/api/v1/catalog/showtimes?movieId=${movie.id}`,
              )
              .then((res) => res.data)
              .catch(() => []), // If one fails, just return an empty array for that movie
        );

        // Wait for all showtimes to load and flatten the arrays
        const showtimesArrays = await Promise.all(showtimePromises);
        setAllShowtimes(showtimesArrays.flat());
      } catch (err) {
        console.error("Failed to fetch initial data", err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (view === "seats" && selectedShowtime) {
      const interval = setInterval(
        () => handleRefreshSeats(selectedShowtime.id),
        3000,
      );
      return () => clearInterval(interval);
    }
  }, [view, selectedShowtime]);

  const handleRefreshSeats = async (showtimeId: number) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/v1/bookings/tickets?showtimeId=${showtimeId}`,
      );
      setBookedSeats(response.data.map((t: any) => t.seatId));
    } catch (err) {
      console.error("Could not refresh seat map.", err);
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    axios
      .get(`http://localhost:8080/api/v1/catalog/showtimes?movieId=${movie.id}`)
      .then((res) => setShowtimes(res.data))
      .catch((err) => setErrorMessage("Failed to load showtimes."));
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
      await axios.post(`http://localhost:8080/api/v1/bookings/hold`, null, {
        params: {
          showtimeId: selectedShowtime?.id,
          seatIds: seatIds.join(","),
          userId: userId,
        },
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
      const response = await axios.post(
        "http://localhost:8080/api/v1/payments/create-checkout-session",
        {
          showtimeId: selectedShowtime?.id,
          seatIds: selectedSeats,
          userId: userId,
          amount: selectedShowtime?.ticketPrice,
        },
      );
      if (response.data && response.data.url) {
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      setErrorMessage(getErrorMessage(error, "Checkout failed."));
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

  const handleLoginSuccess = (
    token: string,
    email: string,
    roles: string[],
  ) => {
    setUser({ token, email, roles });
    setIsAuthModalOpen(false);
    setUserId(email.trim().toLowerCase());
    setView(roles.includes("ROLE_ADMIN") ? "dashboard" : "movies");
  };

  const isAdmin = user?.roles?.includes("ROLE_ADMIN") ?? false;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 relative">
      <Navbar
        onNavigateHome={resetFlow}
        onNavigateBrowse={() => setView("browse")}
        onNavigateAdmin={() => setView("dashboard")}
        isAdmin={isAdmin}
        userEmail={user?.email}
        onLoginClick={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          setUser(null);
          setUserId("User-" + Math.floor(Math.random() * 10000));
          setView("movies");
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {isProcessingPayment && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-neutral-950/90 backdrop-blur-md">
          <Loader2 className="w-12 h-12 text-rose-500 animate-spin" />
        </div>
      )}

      {/* Hero Section Restored */}
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
                onClick={() =>
                  setView(view === "checkout" ? "seats" : "movies")
                }
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

            {/* View Renders */}
            {view === "movies" && (
              <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
            )}
            {view === "browse" && (
              <BrowseMovies
                movies={scheduledMovies}
                onSelectMovie={handleSelectMovie}
              />
            )}
            {view === "showtimes" && selectedMovie && (
              <ShowtimeList
                selectedMovie={selectedMovie}
                showtimes={showtimes}
                onSelectShowtime={handleSelectShowtime}
              />
            )}
            {view === "seats" && selectedShowtime && (
              <SeatMap
                selectedShowtime={selectedShowtime}
                bookedSeats={bookedSeats}
                onHoldSeats={handleHoldSeats}
              />
            )}
            {view === "checkout" &&
              selectedShowtime &&
              selectedSeats.length > 0 && (
                <CheckoutPanel
                  selectedShowtime={selectedShowtime}
                  selectedSeats={selectedSeats}
                  onCheckout={handleCheckout}
                />
              )}
            {view === "success" && selectedSeats.length > 0 && (
              <SuccessTicket
                selectedSeats={selectedSeats}
                userId={userId}
                onReset={resetFlow}
              />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
