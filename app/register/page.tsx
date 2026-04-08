"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
        setMessage(data.message);
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass w-full max-w-md p-10 rounded-[32px] shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-700">
        <div className="text-center mb-8">
          <h2 className="text-accent font-bold tracking-widest text-sm uppercase mb-1">SEO Kampany</h2>
          <h1 className="text-3xl font-bold text-gradient">Create Account</h1>
          <p className="text-text-dim text-sm mt-2">Join our platform to manage your businesses</p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger text-sm p-4 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-primary/10 border border-primary/20 text-primary text-sm p-4 rounded-xl mb-6 text-center">
            {message} Redirecting to login...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-text-dim uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-glass-border rounded-xl p-3 focus:outline-none focus:border-primary transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-br from-primary to-primary-dark rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-text-dim">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
