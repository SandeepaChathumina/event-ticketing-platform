interface NavbarProps { onNavigateHome: () => void; }

export default function Navbar({ onNavigateHome }: NavbarProps) {
  return (
    <nav className="fixed w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10 px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 onClick={onNavigateHome} className="text-2xl font-black text-rose-500 cursor-pointer">DONS PLAZA</h1>
        <div className="flex items-center gap-8 text-sm font-bold text-neutral-300">
          <button onClick={onNavigateHome} className="hover:text-white transition">MOVIES</button>
          <a href="/admin" className="hover:text-white transition">ADMIN</a>
          <a href="#contact" className="hover:text-white transition">CONTACT</a>
          <button onClick={onNavigateHome} className="bg-rose-600 text-white px-5 py-2 rounded-full hover:bg-rose-700 transition">BOOK TICKETS</button>
        </div>
      </div>
    </nav>
  );
}