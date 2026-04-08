"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, User, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-bg">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], x: [0, -100, 0], y: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="glass w-full max-w-md p-10 md:p-12 rounded-[48px] shadow-2xl relative"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 mx-auto mb-6 shadow-xl shadow-primary/10"
          >
            <LogIn className="w-8 h-8 text-primary" />
          </motion.div>
          
          <h2 className="text-accent font-black tracking-[.3em] text-[10px] uppercase mb-1">SEO Kampany</h2>
          <h1 className="text-4xl font-black text-gradient tracking-tight">Welcome Back</h1>
          <p className="text-text-dim text-sm mt-3 font-medium">Authentication required to access dashboard</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-danger/10 border border-danger/20 text-danger text-xs font-bold p-4 rounded-2xl mb-8 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-[.2em] ml-1">Username</label>
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-glass-border rounded-2xl p-4 pl-12 focus:outline-none transition-all font-bold tracking-tight text-text-main"
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-[.2em] ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left" />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-glass-border rounded-2xl p-4 pl-12 focus:outline-none transition-all font-bold tracking-tight text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 btn-primary rounded-[20px] font-black text-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-xs mt-4"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Authorize Session'}
          </button>
        </form>

        <p className="text-center mt-10 text-xs font-bold text-text-dim">
          First time here? <Link href="/register" className="text-primary hover:underline ml-1">Secure Registration</Link>
        </p>
      </motion.div>
    </div>
  );
}
