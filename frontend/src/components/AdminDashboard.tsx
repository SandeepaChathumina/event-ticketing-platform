import { useState } from "react";
import { Users, Film, BarChart3, PlusCircle } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="flex min-h-[600px] bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-950 p-6 space-y-4">
        <h2 className="text-xl font-black text-rose-500 mb-8">ADMIN PANEL</h2>
        {['analytics', 'users', 'movies'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${activeTab === tab ? 'bg-rose-600 text-white' : 'text-neutral-400 hover:bg-neutral-800'}`}
          >
            {tab === 'analytics' && <BarChart3 className="w-5 h-5" />}
            {tab === 'users' && <Users className="w-5 h-5" />}
            {tab === 'movies' && <Film className="w-5 h-5" />}
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
            {/* Movie List/Form will go here */}
          </div>
        )}
      </div>
    </div>
  );
}