import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Showtime } from "../types";

interface CheckoutPanelProps {
  selectedShowtime?: Showtime;
  selectedSeats: string[];
  onCheckout: () => void;
}

export default function CheckoutPanel({ selectedShowtime, selectedSeats, onCheckout }: CheckoutPanelProps) {
  if (!selectedShowtime || selectedSeats.length === 0) return null;

  const movieTitle = selectedShowtime.movie?.title || "Unknown Movie";
  const screenName = selectedShowtime.screen?.name || "Unknown Screen";
  
  // Calculate total price based on array length
  const unitPrice = selectedShowtime.ticketPrice || 0;
  const totalPrice = (unitPrice * selectedSeats.length).toFixed(2);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md mx-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex items-center justify-center gap-3 text-green-400 bg-green-400/10 py-3 rounded-xl mb-8">
          <CheckCircle className="w-5 h-5" />
          <span className="font-bold text-sm">Lock Acquired: 10:00 remaining</span>
        </div>
        
        <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">Order Summary</h2>
        
        <div className="space-y-4 mb-8 text-neutral-300">
          <div className="flex justify-between"><span>Movie</span> <span className="font-bold text-white text-right">{movieTitle}</span></div>
          <div className="flex justify-between"><span>Screen</span> <span className="font-bold text-white">{screenName}</span></div>
          <div className="flex justify-between">
            <span>Seats ({selectedSeats.length})</span> 
            <span className="font-bold text-rose-400">{selectedSeats.join(", ")}</span>
          </div>
          <div className="flex justify-between pt-4 border-t border-neutral-800">
            <span>Total</span> <span className="font-bold text-xl text-white">LKR {totalPrice}</span>
          </div>
        </div>

        <button onClick={onCheckout} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(225,29,72,0.4)] transition hover:-translate-y-1">
          Confirm & Pay
        </button>
      </div>
    </motion.div>
  );
}