import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Loader2 } from "lucide-react";
import axios from "axios";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string, email: string, roles: string[]) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLogin) {
        // Handle Login
        const response = await axios.post("http://localhost:8080/api/v1/auth/login", { email, password });
        console.log("Login response:", response.data);
        console.log("Roles:", response.data.roles);
        onLoginSuccess(response.data.token, response.data.email, response.data.roles || []);
      } else {
        // Handle Registration & Auto-Login
        await axios.post("http://localhost:8080/api/v1/auth/register", { email, password });
        const loginResponse = await axios.post("http://localhost:8080/api/v1/auth/login", { email, password });
        console.log("Auto-login response:", loginResponse.data);
        console.log("Roles:", loginResponse.data.roles);
        onLoginSuccess(loginResponse.data.token, loginResponse.data.email, loginResponse.data.roles || []);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.response?.data || (isLogin ? "Invalid credentials" : "Registration failed");
      setError(typeof errorMsg === 'string' ? errorMsg : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-3xl font-bold mb-2">{isLogin ? "Welcome Back" : "Create Account"}</h2>
          <p className="text-neutral-400 mb-8">
            {isLogin ? "Sign in to book your tickets." : "Join us for an exclusive cinema experience."}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-400 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 transition"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-neutral-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-rose-500 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition mt-4 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Register")}
            </button>
          </form>

          <p className="text-center text-neutral-400 mt-6 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(""); }}
              className="text-rose-500 font-bold hover:underline"
            >
              {isLogin ? "Register now" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}