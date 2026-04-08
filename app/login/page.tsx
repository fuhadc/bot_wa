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
        className="glass w-full max-w-[500px] p-12 md:p-14 rounded-[48px] shadow-2xl relative"
      >
        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center border border-primary/20 mx-auto mb-8 shadow-2xl shadow-primary/10"
          >
            <LogIn className="w-10 h-10 text-primary" />
          </motion.div>
          
          <h2 className="text-accent font-black tracking-[.4em] text-[11px] uppercase mb-2">SEO Kampany</h2>
          <h1 className="text-5xl font-black text-gradient tracking-tighter">Welcome</h1>
          <p className="text-text-dim text-base mt-4 font-medium opacity-80">Authentication required for access</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-danger/10 border border-danger/20 text-danger text-sm font-bold p-5 rounded-2xl mb-10 flex items-center gap-4"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-text-dim uppercase tracking-[.3em] ml-1">Username Reference</label>
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left z-10" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-2xl h-[72px] pl-14 pr-6 focus:outline-none transition-all font-bold text-lg tracking-tight text-white shadow-inner"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-[11px] font-black text-text-dim uppercase tracking-[.3em] ml-1">Secure Passkey</label>
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left z-10" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-2xl h-[72px] pl-14 pr-6 focus:outline-none transition-all font-bold text-lg tracking-tight text-white shadow-inner"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[72px] btn-primary rounded-2xl font-black text-white hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/30 disabled:opacity-50 flex items-center justify-center gap-4 uppercase tracking-[.25em] text-sm mt-6"
          >
            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : (
              <>
                <LogIn className="w-5 h-5" />
                Auth Session
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-12 text-sm font-bold text-text-dim opacity-70">
          New system user? <Link href="/register" className="text-primary hover:text-accent ml-1 transition-colors">Secure Registration</Link>
        </p>
      </motion.div>
    </div>
  );
}
