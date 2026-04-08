"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, User, Lock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage(data.message || 'Account created successfully!');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error || 'Registration failed');
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
        animate={{ scale: [1, 1.2, 1], x: [0, -100, 0], y: [0, 50, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], x: [0, 100, 0], y: [0, -50, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10"
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
            className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center border border-accent/20 mx-auto mb-8 shadow-2xl shadow-accent/10"
          >
            <UserPlus className="w-10 h-10 text-accent" />
          </motion.div>
          
          <h2 className="text-primary font-black tracking-[.4em] text-[11px] uppercase mb-2">SEO Kampany</h2>
          <h1 className="text-5xl font-black text-gradient tracking-tighter">Sign Up</h1>
          <p className="text-text-dim text-base mt-4 font-medium opacity-80">Provisioning your enterprise access</p>
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

        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-primary/10 border border-primary/20 text-primary text-sm font-bold p-5 rounded-2xl mb-10 flex items-center gap-4"
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            {message}
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="space-y-8">
          <div className="space-y-4">
            <label className="text-[11px] font-black text-text-dim uppercase tracking-[.3em] ml-1">Identity Reference</label>
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-accent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left z-10" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Ex. brandmanager"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/5 rounded-2xl h-[72px] pl-14 pr-6 focus:outline-none transition-all font-bold text-lg tracking-tight text-white shadow-inner"
                required
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="text-[11px] font-black text-text-dim uppercase tracking-[.3em] ml-1">Secure Encryption Key</label>
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-accent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left z-10" />
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent transition-colors">
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
            className="w-full h-[72px] bg-gradient-to-br from-accent to-blue-600 rounded-2xl font-black text-white hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-accent/30 disabled:opacity-50 flex items-center justify-center gap-4 uppercase tracking-[.25em] text-sm mt-6"
          >
            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : (
              <>
                <UserPlus className="w-5 h-5" />
                Initialize Identity
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-12 text-sm font-bold text-text-dim opacity-70">
          Already verified? <Link href="/login" className="text-accent hover:text-blue-400 ml-1 transition-colors">Access Session</Link>
        </p>
      </motion.div>
    </div>
  );
}
