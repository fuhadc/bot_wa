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
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-bg">
      {/* Dynamic Background Elements */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], x: [0, -80, 0], y: [0, 48, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10"
      />
      <motion.div 
        animate={{ scale: [1, 1.3, 1], x: [0, 80, 0], y: [0, -48, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10"
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass w-full max-w-[480px] p-10 md:p-12 rounded-[40px] shadow-2xl relative flex flex-col items-center"
      >
        <div className="text-center w-full mb-10">
          <motion.div
            initial={{ y: -16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 mx-auto mb-8 shadow-2xl shadow-accent/10"
          >
            <UserPlus className="w-8 h-8 text-accent" />
          </motion.div>
          
          <h2 className="text-primary font-black tracking-[.4em] text-[10px] uppercase mb-2 leading-none">SEO Kampany</h2>
          <h1 className="text-4xl font-black text-gradient tracking-tight leading-none mb-4">Sign Up</h1>
          <p className="text-text-dim text-sm font-medium opacity-60 leading-relaxed">Provisioning new enterprise identity access</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full bg-danger/10 border border-danger/20 text-danger text-xs font-bold p-4 rounded-xl mb-8 flex items-center gap-3"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">{error}</span>
          </motion.div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="w-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold p-4 rounded-xl mb-8 flex items-center gap-3"
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="leading-none">{message}</span>
          </motion.div>
        )}

        <form onSubmit={handleRegister} className="w-full space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-[.25em] ml-1 leading-none block">Identity Reference</label>
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-accent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left z-10" />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent transition-colors flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Ex. brandmanager"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl h-16 pl-12 pr-5 focus:outline-none transition-all font-bold text-base tracking-tight text-white shadow-inner"
                required
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="text-[10px] font-black text-text-dim uppercase tracking-[.25em] ml-1 leading-none block">Secure Encryption Key</label>
            <div className="relative group">
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-accent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500 origin-left z-10" />
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent transition-colors flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl h-16 pl-12 pr-5 focus:outline-none transition-all font-bold text-base tracking-tight text-white shadow-inner"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-gradient-to-br from-accent to-blue-600 rounded-2xl font-black text-white hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-accent/20 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-[11px] mt-8"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (
              <>
                <UserPlus className="w-4 h-4" />
                Initialize Identity
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-10">
          <p className="text-[11px] font-bold text-text-dim opacity-50 flex items-center gap-2 leading-none">
            Already verified? 
            <Link href="/login" className="text-accent hover:text-blue-400 transition-colors underline underline-offset-4">Access Session</Link>
          </p>
        </div>
      </motion.div>

      {/* Footer System Branding */}
      <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
        <p className="text-[9px] font-black uppercase tracking-[.8em] text-text-dim opacity-20">Security Deployment Node • SEO Kampany v2.2.8</p>
      </div>
    </div>
  );
}
