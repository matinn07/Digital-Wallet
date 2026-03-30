import React, { createContext, useState, useEffect } from 'react';
import { apiFetch } from '../api/client.js';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated by trying to access a protected endpoint
    async function checkAuth() {
      try {
        const userInfo = await apiFetch('/profile');
        setIsAuthed(true);
        setUser(userInfo);
      } catch (err) {
        setIsAuthed(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthed, setIsAuthed, user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
