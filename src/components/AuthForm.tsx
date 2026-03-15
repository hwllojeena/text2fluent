'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        
        if (!res.ok) {
          setError(data.error || 'Registration failed');
          setLoading(false);
          return;
        }

        // Auto login after successful registration
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        if (result?.error) setError(result.error);
      } else {
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        if (result?.error) setError(result.error);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-card animate-fade-in">
      <h2 style={{ fontSize: '3.5rem', marginBottom: '0.5rem', textAlign: 'center' }}>
        {isSignUp ? 'Join Us' : 'Welcome'}
      </h2>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
        {isSignUp ? 'Create your account to start speaking' : 'Sign in to continue your journey'}
      </p>

      {error && (
        <div style={{ background: '#fef2f2', color: 'var(--error)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <input
          type="email"
          placeholder="Email Address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="premium-input"
        />
        <input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="premium-input"
        />
        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>OR</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--card-border)' }} />
      </div>

      <button
        className="btn-primary"
        onClick={() => signIn('google')}
        style={{
          width: '100%',
          background: 'white',
          color: 'var(--foreground)',
          border: '1px solid var(--card-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.8rem'
        }}
      >
        <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px' }} />
        Continue with Google
      </button>

      <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '1rem' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 500 }}
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </span>
      </p>
    </div>
  );
}
