import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
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
        const response = await axios.post("http://localhost:8080/api/v1/auth/login", { email, password });
        onLoginSuccess(response.data.token, email, response.data.roles || []);
      } else {
        await axios.post("http://localhost:8080/api/v1/auth/register", { email, password });
        // Automatically log in after register
        const loginResponse = await axios.post("http://localhost:8080/api/v1/auth/login", { email, password });
        onLoginSuccess(loginResponse.data.token, email, loginResponse.data.roles || []);
      }
    } catch (err: any) {
      // This pulls the specific message thrown from AuthService.java
      const message = err.response?.data?.message || err.response?.data || "Authentication failed.";
      setError(message);
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
          <h2 className="text-3xl font-bold mb-8">{isLogin ? "Welcome Back" : "Create Account"}</h2>
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl mb-6 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-neutral-400 mb-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:outline-none focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-neutral-400 mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-neutral-950 border border-neutral-800 text-white p-3 rounded-xl focus:outline-none focus:border-rose-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? "Sign In" : "Register")}
            </button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full text-center mt-4 text-neutral-500 hover:text-white text-sm">
            {isLogin ? "Need an account? Register" : "Already have an account? Sign In"}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}