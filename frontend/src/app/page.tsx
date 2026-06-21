"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, Ticket } from "lucide-react";

// Define the shape of our data based on the Spring Boot model
interface Event {
  id: number;
  name: string;
  venue: string;
  eventDate: string;
  totalSeats: number;
  availableSeats: number;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Hitting your Spring Boot API
        const response = await axios.get("http://localhost:8080/api/v1/events");
        setEvents(response.data);
      } catch (err) {
        setError("Failed to load events. Is your Spring Boot server running?");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Ticket className="w-10 h-10 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8 md:p-16">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Upcoming Events</h1>
          <p className="text-gray-500">Select an event to reserve your seats.</p>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{event.name}</h2>
                
                <div className="space-y-3 mb-6 text-gray-600">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span>{event.venue}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span>
                      {event.availableSeats} / {event.totalSeats} Seats Left
                    </span>
                  </div>
                </div>

                <button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  disabled={event.availableSeats === 0}
                >
                  {event.availableSeats === 0 ? "Sold Out" : "Book Tickets"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}