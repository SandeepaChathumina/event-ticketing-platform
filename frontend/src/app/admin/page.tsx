"use client";

import { useState } from "react";
import axios from "axios";
import { PlusCircle, Film, Monitor } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'movie' | 'screen'>('movie');

  // Form states
  const [movie, setMovie] = useState({ title: '', description: '', posterUrl: '', durationMinutes: 0, ageRating: '' });
  const [screen, setScreen] = useState({ name: '', totalCapacity: 0 });

  const addMovie = async () => {
    await axios.post("http://localhost:8080/api/v1/catalog/movies", movie);
    alert("Movie Added!");
  };

  const addScreen = async () => {
    await axios.post("http://localhost:8080/api/v1/catalog/screens", screen);
    alert("Screen Added!");
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-black mb-8 text-rose-500">Admin Dashboard</h1>
        
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button onClick={() => setActiveTab('movie')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'movie' ? 'bg-rose-600' : 'bg-neutral-800'}`}>Add Movie</button>
          <button onClick={() => setActiveTab('screen')} className={`px-6 py-2 rounded-full font-bold ${activeTab === 'screen' ? 'bg-rose-600' : 'bg-neutral-800'}`}>Add Screen</button>
        </div>

        {/* Movie Form */}
        {activeTab === 'movie' && (
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 space-y-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Film /> New Movie</h2>
            <input placeholder="Title" className="w-full bg-neutral-800 p-4 rounded-xl" onChange={e => setMovie({...movie, title: e.target.value})} />
            <textarea placeholder="Description" className="w-full bg-neutral-800 p-4 rounded-xl" onChange={e => setMovie({...movie, description: e.target.value})} />
            <input placeholder="Poster URL" className="w-full bg-neutral-800 p-4 rounded-xl" onChange={e => setMovie({...movie, posterUrl: e.target.value})} />
            <div className="flex gap-4">
              <input type="number" placeholder="Duration (min)" className="w-1/2 bg-neutral-800 p-4 rounded-xl" onChange={e => setMovie({...movie, durationMinutes: parseInt(e.target.value)})} />
              <input placeholder="Rating (e.g., PG-13)" className="w-1/2 bg-neutral-800 p-4 rounded-xl" onChange={e => setMovie({...movie, ageRating: e.target.value})} />
            </div>
            <button onClick={addMovie} className="w-full bg-rose-600 py-4 rounded-xl font-bold">Save Movie</button>
          </div>
        )}

        {/* Screen Form */}
        {activeTab === 'screen' && (
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 space-y-4">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Monitor /> New Screen</h2>
            <input placeholder="Screen Name (e.g., Plaza)" className="w-full bg-neutral-800 p-4 rounded-xl" onChange={e => setScreen({...screen, name: e.target.value})} />
            <input type="number" placeholder="Total Capacity" className="w-full bg-neutral-800 p-4 rounded-xl" onChange={e => setScreen({...screen, totalCapacity: parseInt(e.target.value)})} />
            <button onClick={addScreen} className="w-full bg-rose-600 py-4 rounded-xl font-bold">Save Screen</button>
          </div>
        )}
      </div>
    </main>
  );
}