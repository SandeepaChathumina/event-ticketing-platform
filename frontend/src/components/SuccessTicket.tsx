import { motion } from "framer-motion";
import { CheckCircle, Ticket } from "lucide-react";

interface SuccessTicketProps {
  selectedSeat?: string;
  userId?: string;
  onReset: () => void;
}

export default function SuccessTicket({ selectedSeat = "XX", userId = "", onReset }: SuccessTicketProps) {
  // Safely extract the ID part of the userId, or default to a placeholder if undefined/malformed
  const userCode = userId && typeof userId === 'string' && userId.includes('-') 
    ? userId.split('-')[1] 
    : "0000";

  // Prevent React "Objects are not valid as a React child" errors if an object is accidentally passed
  const safeSeat = typeof selectedSeat === 'string' ? selectedSeat : "XX";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-4xl font-black mb-4">You're going to the movies!</h2>
      <p className="text-neutral-400 text-lg mb-10 max-w-lg mx-auto">Your ticket for seat <span className="text-white font-bold">{safeSeat}</span> has been permanently saved to the PostgreSQL database.</p>
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-sm mx-auto mb-10 flex items-center justify-center gap-4">
        <Ticket className="w-8 h-8 text-rose-500" />
        <div className="text-left">
          <div className="text-xs text-neutral-500 uppercase tracking-widest">Entry Code</div>
          <div className="font-mono text-xl font-bold tracking-widest">{safeSeat}-{userCode}</div>
        </div>
      </div>

      <button onClick={onReset} className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-neutral-200 transition">
        Book Another Ticket
      </button>
    </motion.div>
  );
}