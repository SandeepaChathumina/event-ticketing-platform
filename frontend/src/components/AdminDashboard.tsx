import { useState } from "react";
import axios from "axios";
import { Users, Film, BarChart3, PlusCircle, CalendarDays, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('schedule');
  const [successMessage, setSuccessMessage] = useState("");

  // Bulk Scheduling State
  const [bulkForm, setBulkForm] = useState({
    movieId: "",
    screenId: "",
    startDate: "",
    endDate: "",
    startTime: "",
    ticketPrice: ""
  });

  const handleBulkSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/api/v1/catalog/showtimes/bulk", {
        movieId: parseInt(bulkForm.movieId),
        screenId: parseInt(bulkForm.screenId),
        startDate: bulkForm.startDate,
        endDate: bulkForm.endDate,
        startTime: bulkForm.startTime + ":00", // Format to HH:mm:ss for backend
        ticketPrice: parseFloat(bulkForm.ticketPrice)
      });
      setSuccessMessage("Showtimes successfully generated for the selected date range!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      console.error("Failed to schedule in bulk", err);
      alert("Failed to create bulk schedule. Please check the backend connection.");
    }
  };

  return (
    <div className="flex min-h-[600px] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-950 p-6 space-y-4">
        <h2 className="text-xl font-black text-rose-500 mb-8">ADMIN PANEL</h2>
        {['analytics', 'users', 'movies', 'schedule'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === tab ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'}`}
          >
            {tab === 'analytics' && <BarChart3 className="w-5 h-5" />}
            {tab === 'users' && <Users className="w-5 h-5" />}
            {tab === 'movies' && <Film className="w-5 h-5" />}
            {tab === 'schedule' && <CalendarDays className="w-5 h-5" />}
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8">
        {activeTab === 'analytics' && <h1 className="text-2xl font-bold">Analytics Overview</h1>}
        {activeTab === 'users' && <h1 className="text-2xl font-bold">User Management</h1>}
        
        {activeTab === 'movies' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Movie Management</h1>
              <button className="flex items-center gap-2 bg-rose-600 px-4 py-2 rounded-lg font-bold">
                <PlusCircle className="w-5 h-5" /> Add Movie
              </button>
            </div>
          </div>
        )}

        {/* NEW: Bulk Schedule Manager */}
        {activeTab === 'schedule' && (
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold mb-6">Bulk Schedule Generator</h1>
            <p className="text-neutral-400 mb-8">Automatically generate daily showtimes for a specific date range. Canceled dates can be managed individually later.</p>
            
            {successMessage && (
              <div className="flex items-center gap-2 bg-green-500/20 text-green-400 p-4 rounded-xl mb-6 border border-green-500/30">
                <CheckCircle className="w-5 h-5" /> {successMessage}
              </div>
            )}

            <form onSubmit={handleBulkSchedule} className="space-y-6 bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Movie ID</label>
                  <input type="number" required value={bulkForm.movieId} onChange={e => setBulkForm({...bulkForm, movieId: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Screen ID</label>
                  <input type="number" required value={bulkForm.screenId} onChange={e => setBulkForm({...bulkForm, screenId: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Start Date</label>
                  <input type="date" required value={bulkForm.startDate} onChange={e => setBulkForm({...bulkForm, startDate: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">End Date</label>
                  <input type="date" required value={bulkForm.endDate} onChange={e => setBulkForm({...bulkForm, endDate: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none [color-scheme:dark]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Daily Time</label>
                  <input type="time" required value={bulkForm.startTime} onChange={e => setBulkForm({...bulkForm, startTime: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none [color-scheme:dark]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Ticket Price ($)</label>
                  <input type="number" step="0.01" required value={bulkForm.ticketPrice} onChange={e => setBulkForm({...bulkForm, ticketPrice: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none" />
                </div>
              </div>

              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition">
                Generate Recurring Schedule
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}