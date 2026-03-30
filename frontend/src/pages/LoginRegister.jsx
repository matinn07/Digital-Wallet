import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginRegister() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { setIsAuthed } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'register') {
        await apiFetch('/register', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        // Register creates the user + wallet, but does not set the JWT cookie.
        // We immediately log in so the cookie is available for protected routes.
        await apiFetch('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      }
      if (mode === 'login') {
        await apiFetch('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
      }
      setIsAuthed(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Request failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>{mode === 'login' ? 'Login' : 'Register'}</div>
          <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            JWT stored in an httpOnly cookie.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" onClick={() => setMode('login')} style={{ opacity: mode === 'login' ? 1 : 0.7 }}>
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{ opacity: mode === 'register' ? 1 : 0.7 }}
          >
            Register
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} style={{ marginTop: 18 }}>
        <div className="row" style={{ flexDirection: 'column' }}>
          <div>
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div style={{ marginTop: 12 }}>
            <label>Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="At least 8 characters"
            />
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create account'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

