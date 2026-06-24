import { useState, useEffect } from "react";
import axios from "axios";
// FIX: Added the 'Edit' icon to the imports
import { Users, Film, BarChart3, PlusCircle, CalendarDays, CheckCircle, Trash2, MonitorPlay, TrendingUp, Ticket, DollarSign, Edit } from "lucide-react";
import { Movie, Showtime } from "../types";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const REVENUE_DATA = [
  { name: 'Mon', revenue: 1200 },
  { name: 'Tue', revenue: 1900 },
  { name: 'Wed', revenue: 1500 },
  { name: 'Thu', revenue: 2200 },
  { name: 'Fri', revenue: 3800 },
  { name: 'Sat', revenue: 5100 },
  { name: 'Sun', revenue: 4200 },
];

const MOVIE_PERFORMANCE_DATA = [
  { title: 'Dune: Part Two', sales: 450 },
  { title: 'Deadpool & Wolverine', sales: 380 },
  { title: 'Inside Out 3', sales: 520 },
  { title: 'Oppenheimer', sales: 210 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics'); // Defaulting to analytics to see it immediately
  const [successMessage, setSuccessMessage] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);

  // --- Bulk Scheduling State ---
  const [bulkForm, setBulkForm] = useState({
    movieId: "",
    screenId: "",
    startDate: "",
    endDate: "",
    startTimes: "", 
    ticketPrice: ""
  });

  // --- Cancellation / Manage Schedule State ---
  const [manageMovieId, setManageMovieId] = useState("");
  const [existingShowtimes, setExistingShowtimes] = useState<Showtime[]>([]);

  // --- Users State ---
  const [usersList, setUsersList] = useState([]);

  // --- Add Movie State ---
  const [isAddingMovie, setIsAddingMovie] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<number | null>(null); // NEW: Track which movie is being edited
  const [movieSuccess, setMovieSuccess] = useState("");
  const [movieForm, setMovieForm] = useState({
    title: "",
    description: "",
    posterUrl: "",
    durationMinutes: "",
    ageRating: ""
  });

  // Fetch movies on load for dropdowns
  useEffect(() => {
    fetchMovies();
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/users");
      setUsersList(response.data);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/v1/catalog/movies");
      setMovies(response.data);
    } catch (err) {
      console.error("Failed to load movies for admin dashboard", err);
    }
  };

  // --- Handlers ---
  const handleBulkSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedTimes = bulkForm.startTimes
        .split(",")
        .map(time => time.trim().replace(/\./g, ':') + ":00");

      await axios.post("http://localhost:8080/api/v1/catalog/showtimes/bulk", {
        movieId: parseInt(bulkForm.movieId),
        screenId: parseInt(bulkForm.screenId),
        startDate: bulkForm.startDate,
        endDate: bulkForm.endDate,
        startTimes: formattedTimes,
        ticketPrice: parseFloat(bulkForm.ticketPrice)
      });
      
      setSuccessMessage("Showtimes successfully generated for the selected date range!");
      setTimeout(() => setSuccessMessage(""), 5000);
      setBulkForm({ movieId: "", screenId: "", startDate: "", endDate: "", startTimes: "", ticketPrice: "" });
      
      // Refresh showtimes if the admin is currently managing the same movie
      if (manageMovieId === bulkForm.movieId) fetchShowtimes(manageMovieId);
    } catch (err) {
      console.error("Failed to schedule in bulk", err);
      alert("Failed to create bulk schedule. Please check the backend connection and time format.");
    }
  };

  // FIX: Combined Add and Update logic into a single Save handler
  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMovieId) {
        // UPDATE Existing Movie
        await axios.put(`http://localhost:8080/api/v1/catalog/movies/${editingMovieId}`, {
          title: movieForm.title,
          description: movieForm.description,
          posterUrl: movieForm.posterUrl,
          durationMinutes: parseInt(movieForm.durationMinutes as string),
          ageRating: movieForm.ageRating
        });
        setMovieSuccess("Movie updated successfully!");
      } else {
        // ADD New Movie
        await axios.post("http://localhost:8080/api/v1/catalog/movies", {
          title: movieForm.title,
          description: movieForm.description,
          posterUrl: movieForm.posterUrl,
          durationMinutes: parseInt(movieForm.durationMinutes as string),
          ageRating: movieForm.ageRating
        });
        setMovieSuccess("Movie added successfully!");
      }
      
      setMovieForm({ title: "", description: "", posterUrl: "", durationMinutes: "", ageRating: "" });
      setEditingMovieId(null);
      fetchMovies(); // Refresh the dropdowns and tables
      
      setTimeout(() => {
        setMovieSuccess("");
        setIsAddingMovie(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to save movie", err);
      alert("Failed to save movie. Please check your backend.");
    }
  };

  // NEW: Handle Edit Button Click
  const handleEditClick = (movie: Movie) => {
    setEditingMovieId(movie.id);
    setMovieForm({
      title: movie.title,
      description: movie.description,
      posterUrl: movie.posterUrl,
      durationMinutes: movie.durationMinutes.toString(),
      ageRating: movie.ageRating
    });
    setIsAddingMovie(true); // Open the form
  };

  // NEW: Handle Delete Button Click
  const handleDeleteMovie = async (id: number) => {
    if (!confirm("Are you sure you want to delete this movie? Note: You cannot delete a movie if it has active showtimes or bookings linked to it.")) return;
    try {
      await axios.delete(`http://localhost:8080/api/v1/catalog/movies/${id}`);
      fetchMovies(); // Refresh list after deletion
    } catch (err) {
      console.error("Failed to delete movie", err);
      alert("Failed to delete movie. Ensure all showtimes linked to this movie are deleted first.");
    }
  };

  const fetchShowtimes = async (movieId: string) => {
    setManageMovieId(movieId);
    if (!movieId) {
      setExistingShowtimes([]);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/api/v1/catalog/showtimes?movieId=${movieId}`);
      
      // FIX: Filter out past showtimes so the admin only sees current and future ones
      const now = new Date();
      const upcomingShowtimes = response.data.filter((st: Showtime) => {
        return new Date(st.startTime) >= now;
      });
      
      setExistingShowtimes(upcomingShowtimes);
    } catch (err) {
      console.error("Failed to fetch showtimes", err);
    }
  };

  const handleCancelShowtime = async (showtimeId: number) => {
    if (!confirm("Are you sure you want to cancel this showtime? Users will no longer be able to book it.")) return;
    
    try {
      await axios.patch(`http://localhost:8080/api/v1/catalog/showtimes/${showtimeId}/cancel`);
      // Remove it from the local list instantly
      setExistingShowtimes(existingShowtimes.filter(st => st.id !== showtimeId));
    } catch (err) {
      console.error("Failed to cancel showtime", err);
      alert("Failed to cancel the showtime.");
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
      <div className="flex-1 p-8 overflow-y-auto max-h-[800px] scrollbar-hide">
        
        {/* --- ANALYTICS TAB --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-3xl font-black mb-2">Dashboard Overview</h1>
              <p className="text-neutral-400">Welcome back. Here is what's happening at Dons Plaza today.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-500/10 text-green-500 rounded-xl"><DollarSign className="w-6 h-6" /></div>
                  <div className="text-neutral-400 font-bold">Total Revenue (7d)</div>
                </div>
                <div className="text-4xl font-black text-white">$19,900</div>
                <div className="text-green-500 text-sm font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +12.5% from last week</div>
              </div>
              
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><Ticket className="w-6 h-6" /></div>
                  <div className="text-neutral-400 font-bold">Tickets Sold (7d)</div>
                </div>
                <div className="text-4xl font-black text-white">1,560</div>
                <div className="text-rose-500 text-sm font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> +8.2% from last week</div>
              </div>

              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><Users className="w-6 h-6" /></div>
                  <div className="text-neutral-400 font-bold">Active Users</div>
                </div>
                <div className="text-4xl font-black text-white">842</div>
                <div className="text-neutral-500 text-sm font-bold mt-2">Currently registered in system</div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Area Chart */}
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-lg">
                <h2 className="text-xl font-bold mb-6">Weekly Revenue Trend</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                      <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
                        itemStyle={{ color: '#e11d48', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Movie Performance Bar Chart */}
              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800 shadow-lg">
                <h2 className="text-xl font-bold mb-6">Ticket Sales by Movie</h2>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOVIE_PERFORMANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#262626" horizontal={false} />
                      <XAxis type="number" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="title" type="category" stroke="#a3a3a3" fontSize={11} tickLine={false} axisLine={false} width={100} />
                      <RechartsTooltip 
                        cursor={{fill: '#171717'}}
                        contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', color: '#fff' }}
                      />
                      <Bar dataKey="sales" fill="#e11d48" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold mb-6">User Management</h1>
            <p className="text-neutral-400 mb-8">View all registered users and administrators in the system.</p>
            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                  <tr>
                    <th className="p-4 font-bold">ID</th>
                    <th className="p-4 font-bold">Email</th>
                    <th className="p-4 font-bold">Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-neutral-900/50 transition">
                      <td className="p-4 font-mono text-neutral-500">{u.id}</td>
                      <td className="p-4 text-white font-medium">{u.email}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {u.roles?.map((role: string) => (
                            <span key={role} className="bg-rose-500/10 text-rose-400 text-xs px-3 py-1 rounded-md border border-rose-500/20 font-bold tracking-wider">
                              {role.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {usersList.length === 0 && (
                <div className="p-8 text-center text-neutral-500">No users found.</div>
              )}
            </div>
          </div>
        )}
        
        {/* --- MOVIES TAB --- */}
        {activeTab === 'movies' && (
          <div className="max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Movie Management</h1>
              {!isAddingMovie && (
                <button onClick={() => { setEditingMovieId(null); setMovieForm({ title: "", description: "", posterUrl: "", durationMinutes: "", ageRating: "" }); setIsAddingMovie(true); }} className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 px-4 py-2 rounded-lg font-bold transition">
                  <PlusCircle className="w-5 h-5" /> Add Movie
                </button>
              )}
            </div>

            {movieSuccess && (
              <div className="flex items-center gap-2 bg-green-500/20 text-green-400 p-4 rounded-xl mb-6 border border-green-500/30">
                <CheckCircle className="w-5 h-5" /> {movieSuccess}
              </div>
            )}

            {isAddingMovie ? (
              <form onSubmit={handleSaveMovie} className="space-y-6 bg-neutral-950 p-6 rounded-2xl border border-neutral-800 mb-8">
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Movie Title</label>
                  <input type="text" required value={movieForm.title} onChange={e => setMovieForm({...movieForm, title: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Description</label>
                  <textarea required value={movieForm.description} onChange={e => setMovieForm({...movieForm, description: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none min-h-[100px]" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-neutral-400 mb-2">Poster URL (Image Link)</label>
                  <input type="url" required value={movieForm.posterUrl} onChange={e => setMovieForm({...movieForm, posterUrl: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none" placeholder="https://..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-400 mb-2">Duration (Minutes)</label>
                    <input type="number" required value={movieForm.durationMinutes} onChange={e => setMovieForm({...movieForm, durationMinutes: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none" placeholder="120" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-400 mb-2">Age Rating</label>
                    <input type="text" required value={movieForm.ageRating} onChange={e => setMovieForm({...movieForm, ageRating: e.target.value})} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none" placeholder="PG-13, R, G..." />
                  </div>
                </div>

                <div className="flex gap-4 pt-2">
                  <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 rounded-xl transition">
                    {editingMovieId ? "Update Movie" : "Save Movie"}
                  </button>
                  <button type="button" onClick={() => { setIsAddingMovie(false); setEditingMovieId(null); }} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-4 rounded-xl transition">
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              // NEW: Movie List Table
              <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900 border-b border-neutral-800 text-neutral-400">
                    <tr>
                      <th className="p-4 font-bold">Title</th>
                      <th className="p-4 font-bold">Duration</th>
                      <th className="p-4 font-bold">Rating</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {movies.map(m => (
                      <tr key={m.id} className="hover:bg-neutral-900/50 transition">
                        <td className="p-4 text-white font-medium flex items-center gap-3">
                          <img src={m.posterUrl} alt={m.title} className="w-10 h-14 object-cover rounded shadow-sm border border-neutral-800" />
                          {m.title}
                        </td>
                        <td className="p-4 text-neutral-400">{m.durationMinutes}m</td>
                        <td className="p-4 text-neutral-400">{m.ageRating}</td>
                        <td className="p-4 flex justify-end gap-2 items-center h-full mt-2">
                          <button onClick={() => handleEditClick(m)} className="p-2 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition" title="Edit Movie">
                            <Edit className="w-5 h-5" />
                          </button>
                          <button onClick={() => handleDeleteMovie(m.id)} className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition" title="Delete Movie">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {movies.length === 0 && (
                  <div className="p-8 text-center text-neutral-500">No movies found in the database.</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- BULK SCHEDULE & CANCELLATION TAB --- */}
        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
            {/* Left Column: Generator */}
            <div>
              <h1 className="text-2xl font-bold mb-6">Bulk Schedule Generator</h1>
              <p className="text-neutral-400 mb-8">Automatically generate daily showtimes for a specific date range.</p>
              
              {successMessage && (
                <div className="flex items-center gap-2 bg-green-500/20 text-green-400 p-4 rounded-xl mb-6 border border-green-500/30">
                  <CheckCircle className="w-5 h-5" /> {successMessage}
                </div>
              )}

              <form onSubmit={handleBulkSchedule} className="space-y-6 bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-400 mb-2">Select Movie</label>
                    <select 
                      required 
                      value={bulkForm.movieId} 
                      onChange={e => setBulkForm({...bulkForm, movieId: e.target.value})} 
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none appearance-none"
                    >
                      <option value="" disabled>Select a movie...</option>
                      {movies.map(m => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
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
                    <label className="block text-sm font-bold text-neutral-400 mb-2">Daily Times (e.g. 10:30, 14:00)</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="10:30, 14:00, 18:30" 
                      value={bulkForm.startTimes} 
                      onChange={e => setBulkForm({...bulkForm, startTimes: e.target.value})} 
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none" 
                    />
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

            {/* Right Column: Manage & Cancel */}
            <div>
              <h1 className="text-2xl font-bold mb-6">Manage & Cancel Dates</h1>
              <p className="text-neutral-400 mb-8">View active schedules and cancel specific dates (like holidays).</p>

              <div className="bg-neutral-950 p-6 rounded-2xl border border-neutral-800">
                <label className="block text-sm font-bold text-neutral-400 mb-2">Select Movie to Manage</label>
                <select 
                  value={manageMovieId} 
                  onChange={e => fetchShowtimes(e.target.value)} 
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-rose-500 focus:outline-none appearance-none mb-6"
                >
                  <option value="">Select a movie...</option>
                  {movies.map(m => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                  {existingShowtimes.length === 0 && manageMovieId && (
                    <p className="text-neutral-500 text-center py-4">No active showtimes found for this movie.</p>
                  )}
                  {existingShowtimes.map(st => (
                    <div key={st.id} className="flex justify-between items-center bg-neutral-900 p-4 rounded-xl border border-neutral-800">
                      <div>
                        <div className="font-bold text-white mb-1 flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-rose-500" />
                          {new Date(st.startTime).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-neutral-400 font-mono flex items-center gap-2">
                          <MonitorPlay className="w-3.5 h-3.5" />
                          {new Date(st.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleCancelShowtime(st.id)}
                        className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white p-3 rounded-lg transition"
                        title="Cancel this specific showtime"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}