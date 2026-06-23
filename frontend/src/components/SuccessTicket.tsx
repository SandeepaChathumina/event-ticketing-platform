import { motion } from "framer-motion";
import { CheckCircle, Ticket } from "lucide-react";

interface SuccessTicketProps {
  selectedSeats: string[];
  userId?: string;
  onReset: () => void;
}

export default function SuccessTicket({ selectedSeats, userId = "", onReset }: SuccessTicketProps) {
  const userCode = userId && typeof userId === 'string' && userId.includes('-') ? userId.split('-')[1] : "0000";

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
      <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      <h2 className="text-4xl font-black mb-4">You're going to the movies!</h2>
      <p className="text-neutral-400 text-lg mb-10 max-w-lg mx-auto">
        Your tickets for seats <span className="text-white font-bold">{selectedSeats.join(", ")}</span> have been permanently saved!
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10">
        {selectedSeats.map(seat => (
           <div key={seat} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex items-center justify-center gap-4">
             <Ticket className="w-8 h-8 text-rose-500" />
             <div className="text-left">
               <div className="text-xs text-neutral-500 uppercase tracking-widest">Entry Code</div>
               <div className="font-mono text-xl font-bold tracking-widest">{seat}-{userCode}</div>
             </div>
           </div>
        ))}
      </div>

      <button onClick={onReset} className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-neutral-200 transition">
        Book Another Ticket
      </button>
    </motion.div>
  );
}