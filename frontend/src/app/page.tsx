"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Ticket, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

// Types matching your Spring Boot backend
interface Event {
  id: number;
  name: string;
  venue: string;
  eventDate: string;
  totalSeats: number;
  availableSeats: number;
}

export default function BookingEngine() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  
  // A unique user ID for this browser tab to test Redis locking
  const [userId] = useState(() => "User-" + Math.floor(Math.random() * 10000));
  
  // Booking States
  const [holdMessage, setHoldMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // A small dummy grid of seats for the UI
  const availableSeatsGrid = ["A1", "A2", "A3", "A4", "B1", "B2", "B3", "B4", "C1", "C2", "C3", "C4"];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/events");
      setEvents(response.data);
    } catch (err) {
      setErrorMessage("Failed to load events. Is Spring Boot running?");
    } finally {
      setLoading(false);
    }
  };

  // STEP 1: Attempt to hold the seat using Redis
  const handleHoldSeat = async (seatId: string) => {
    setErrorMessage("");
    setHoldMessage("");
    setSelectedSeat(seatId);

    try {
      // Axios POST with query params exactly as Spring Boot expects
      await axios.post("http://localhost:8080/api/v1/bookings/hold", null, {
        params: { eventId: selectedEvent?.id, seatId, userId }
      });
      
      setHoldMessage(`Seat ${seatId} successfully locked for 10 minutes!`);
      setIsCheckingOut(true);
    } catch (error: any) {
      // If Spring Boot returns 409 Conflict, the Redis lock failed!
      if (error.response?.status === 409) {
        setErrorMessage(`Seat ${seatId} is already being purchased by someone else!`);
        setSelectedSeat(null);
      } else {
        setErrorMessage("An error occurred connecting to the server.");
      }
    }
  };

  // STEP 2: Process the payment and save to PostgreSQL
  const handleCheckout = async () => {
    setErrorMessage("");
    try {
      await axios.post("http://localhost:8080/api/v1/bookings/checkout", null, {
        params: { 
          eventId: selectedEvent?.id, 
          seatId: selectedSeat, 
          userId,
          creditCardNumber: "4111222233334444" // Dummy card
        }
      });
      
      setPaymentSuccess(true);
      fetchEvents(); // Refresh the event list to see availableSeats drop!
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Checkout failed. Your 10-minute hold may have expired.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Ticket className="animate-bounce w-12 h-12 text-blue-600" /></div>;

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation / Header */}
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Event Ticketing Platform</h1>
            <p className="text-gray-500 font-mono text-sm mt-1">Logged in as: {userId}</p>
          </div>
          {selectedEvent && !paymentSuccess && (
            <button onClick={() => setSelectedEvent(null)} className="flex items-center text-blue-600 hover:text-blue-800 transition">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
            </button>
          )}
        </header>

        {/* Global Error Banner */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-3" /> {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* VIEW 1: Event Dashboard */}
        {!selectedEvent && (
          <div className="grid md:grid-cols-2 gap-6">
            {events.map((event) => (
              <motion.div key={event.id} whileHover={{ y: -4 }} className="bg-white p-6 rounded-2xl shadow border border-gray-100">
                <h2 className="text-2xl font-bold mb-4">{event.name}</h2>
                <div className="space-y-2 mb-6 text-gray-600">
                  <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.venue}</p>
                  <p className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {new Date(event.eventDate).toLocaleDateString()}</p>
                  <p className="flex items-center gap-2 font-medium text-blue-600"><Ticket className="w-4 h-4" /> {event.availableSeats} Seats Remaining</p>
                </div>
                <button 
                  onClick={() => setSelectedEvent(event)}
                  className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition"
                >
                  Select Seats
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* VIEW 2: Seat Map & Checkout */}
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-8 rounded-2xl shadow border border-gray-100">
            
            {/* Success State */}
            {paymentSuccess ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                <p className="text-gray-600 mb-8">Your ticket for Seat {selectedSeat} has been secured in PostgreSQL.</p>
                <button onClick={() => { setSelectedEvent(null); setPaymentSuccess(false); setSelectedSeat(null); setIsCheckingOut(false); }} className="bg-blue-600 text-white px-8 py-3 rounded-xl">
                  Browse More Events
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-12">
                
                {/* Left Side: Seat Grid */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Stage / Screen</h3>
                  <div className="w-full h-8 bg-gray-200 rounded-t-3xl mb-8 border-b-4 border-gray-300"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {availableSeatsGrid.map((seat) => (
                      <button
                        key={seat}
                        onClick={() => handleHoldSeat(seat)}
                        disabled={isCheckingOut}
                        className={`py-4 rounded-xl font-bold transition-all ${
                          selectedSeat === seat 
                            ? "bg-blue-600 text-white ring-4 ring-blue-200 shadow-lg scale-105" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        } disabled:opacity-50`}
                      >
                        {seat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Side: Checkout Panel */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col justify-center">
                  {!isCheckingOut ? (
                    <div className="text-center text-gray-500">
                      <Ticket className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Select a seat on the map to begin the 10-minute hold process.</p>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                      <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 flex items-start gap-3 border border-blue-200">
                        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{holdMessage}</p>
                      </div>
                      
                      <h4 className="font-bold text-lg mb-4">Checkout Details</h4>
                      <div className="space-y-4 mb-8">
                        <input type="text" disabled value={selectedEvent.name} className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-gray-500" />
                        <input type="text" disabled value={`Seat: ${selectedSeat}`} className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl font-bold" />
                        <input type="text" disabled value="Visa ending in 4444" className="w-full bg-white border border-gray-300 px-4 py-3 rounded-xl text-gray-500" />
                      </div>

                      <button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1">
                        Confirm & Pay Now
                      </button>
                    </motion.div>
                  )}
                </div>

              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  );
}