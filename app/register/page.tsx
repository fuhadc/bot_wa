"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, User, Lock } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess('Access Node Provisioned Successfully');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setError(data.error || 'Identity Provisioning Failed');
      }
    } catch (err) {
      setError('Neural connection failure');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-spacing-scale-4 relative bg-bg selection:bg-accent/30">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-[480px] z-10"
      >
        <Card 
          header={
            <div className="text-center w-full">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 mx-auto mb-spacing-scale-8 shadow-2xl shadow-accent/10"
              >
                <UserPlus className="w-8 h-8 text-accent" />
              </motion.div>
              <h2 className="text-primary font-black tracking-[.6em] text-[10px] uppercase mb-spacing-scale-2">Node Provisioning</h2>
              <h1 className="text-5xl font-black text-gradient tracking-tighter leading-none mb-spacing-scale-4">Sign Up</h1>
              <p className="text-text-dim text-sm font-medium opacity-50">Join the Collective Network</p>
            </div>
          }
        >
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-danger/10 border border-danger/20 text-danger text-[11px] font-black uppercase tracking-widest p-spacing-scale-4 rounded-2xl mb-spacing-scale-8 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="bg-primary/10 border border-primary/20 text-primary text-[11px] font-black uppercase tracking-widest p-spacing-scale-4 rounded-2xl mb-spacing-scale-8 flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {success}
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-spacing-scale-6">
            <Input 
              label="Chosen Identity"
              id="username"
              type="text"
              placeholder="Username"
              icon={<User className="w-4 h-4" />}
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
              required
            />
            
            <Input 
              label="Encryption Passkey"
              id="password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />

            <Button 
              type="submit" 
              isLoading={loading} 
              className="w-full mt-spacing-scale-4"
              rightIcon={<UserPlus />}
            >
              Initialize Profile
            </Button>
          </form>

          <div className="text-center mt-spacing-scale-8">
            <p className="text-[11px] font-bold text-text-dim opacity-50">
              Verified User? 
              <Link href="/login" className="text-accent hover:text-primary transition-colors ml-2 underline underline-offset-4 decoration-accent/20">Access Session</Link>
            </p>
          </div>
        </Card>
      </motion.div>

      {/* Static System Trace */}
      <div className="absolute bottom-spacing-scale-8 inset-x-0 text-center pointer-events-none opacity-20">
        <Badge variant="ghost">Security Cluster Zone • Node v2.2.8 Alpha</Badge>
      </div>
    </div>
  );
}
