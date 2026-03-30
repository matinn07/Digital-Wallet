import React, { useEffect } from 'react';
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { apiFetch } from './api/client.js';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginRegister from './pages/LoginRegister.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SendMoney from './pages/SendMoney.jsx';
import TransactionHistory from './pages/TransactionHistory.jsx';
import Profile from './pages/Profile.jsx';

function TopNav() {
  const { isAuthed, setIsAuthed } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    // Clear JWT cookie on the server, then go back to auth screen.
    try {
      await apiFetch('/logout', { method: 'POST' });
    } catch (err) {
      // Even if logout fails, clearing the cookie client-side via redirect
      // ensures the protected calls will fail.
    } finally {
      setIsAuthed(false);
      navigate('/');
    }
  }

  return (
    <div className="panel" style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 700, letterSpacing: 0.2 }}>Digital Wallet</div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>JWT cookie auth + SERIALIZABLE transfers</div>
        </div>
        {isAuthed && (
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/send">Send</Link>
            <Link to="/transactions">Transactions</Link>
            <Link to="/profile">Profile</Link>
            <button
              type="button"
              onClick={onLogout}
              style={{
                borderRadius: 10,
                padding: '10px 12px',
                background: 'rgba(248, 113, 113, 0.12)',
                border: '1px solid rgba(248, 113, 113, 0.4)',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="wrap">
        <TopNav />
        <Routes>
          <Route path="/" element={<LoginRegister />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<SendMoney />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

