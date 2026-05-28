"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        login(data.user);
        router.push('/dashboard');
      } else {
        setError(data.message || 'Credenciales inválidas.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-200 border border-surface-500 rounded-md p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2" style={{ fontFamily: 'var(--font-unbounded), sans-serif' }}>NEXOVIBE.</h1>
          <p className="text-status-pending tracking-[0.2em] text-xs uppercase">Sistema Core</p>
        </div>

        {error && <div className="mb-4 p-3 bg-primary/10 border border-primary text-primary text-sm rounded">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-200 border border-surface-600 rounded px-4 py-2 text-foreground placeholder-surface-600 focus:outline-none focus:border-primary transition-colors"
              placeholder="admin@nexovibe.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-200 border border-surface-600 rounded px-4 py-2 text-foreground placeholder-surface-600 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-red-600 text-white font-bold py-3 px-4 rounded transition-colors uppercase tracking-wider text-sm"
          >
            Acceder al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
