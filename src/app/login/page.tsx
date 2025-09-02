"use client";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';

export default function LoginPage() {
  const { signIn, loading, user, userData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  if (user && userData) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
        <h2 className="text-xl font-bold mb-2">Welcome, {userData.email}</h2>
        <p className="mb-2">Role: <b>{userData.role}</b></p>
        <p>Club: <b>{userData.clubId || 'N/A'}</b></p>
        <p className="mt-4 text-green-600">You are logged in!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {error && <Alert variant="destructive">{error}</Alert>}
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="mb-3"
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="mb-3"
        required
      />
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
