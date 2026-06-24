interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateBrowse?: () => void;
  onNavigateAdmin?: () => void;
  isAdmin?: boolean;
  userEmail?: string | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

export default function Navbar({
  onNavigateHome,
  onNavigateBrowse,
  onNavigateAdmin,
  isAdmin,
  userEmail,
  onLoginClick,
  onLogout,
}: NavbarProps) {
  return (
    <nav className="fixed w-full z-50 bg-neutral-950/80 backdrop-blur-lg border-b border-white/10 p-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1
          onClick={onNavigateHome}
          className="text-2xl font-black cursor-pointer bg-gradient-to-r from-rose-500 to-orange-400 bg-clip-text text-transparent"
        >
          DONS PLAZA
        </h1>
        <div className="flex gap-8 text-sm font-bold text-neutral-400 items-center">
          <button onClick={onNavigateHome} className="hover:text-white transition">MOVIES</button>
          
          {onNavigateBrowse && (
            <button onClick={onNavigateBrowse} className="hover:text-white transition">BROWSE</button>
          )}

          {isAdmin && onNavigateAdmin && (
            <button onClick={onNavigateAdmin} className="hover:text-white transition text-rose-500 underline underline-offset-4">
              ADMIN
            </button>
          )}

          {userEmail ? (
            <div className="flex items-center gap-4 border-l border-neutral-800 pl-6 ml-2">
              <span className="text-rose-400">{userEmail}</span>
              <button onClick={onLogout} className="hover:text-white transition text-xs">LOGOUT</button>
            </div>
          ) : (
            <button onClick={onLoginClick} className="bg-rose-600 text-white px-6 py-2 rounded-full hover:bg-rose-700 transition ml-2">
              LOGIN / REGISTER
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}