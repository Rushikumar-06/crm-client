'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase/config';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserFromBackend = async (firebaseUser) => {
    try {
      const token = await firebaseUser.getIdToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchUserFromBackend(firebaseUser);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const register = async (email, password, displayName) => {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      throw new Error(data.error || 'Registration failed');
    }
    await signInWithEmailAndPassword(auth, email, password);
    await fetchUserFromBackend(auth.currentUser);
  };

  const login = async (email, password) => {
    setLoading(true);
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setLoading(false);
      throw new Error(data.error || 'Login failed');
    }
    await signInWithEmailAndPassword(auth, email, password);
    await fetchUserFromBackend(auth.currentUser);
    return data.token;
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/save-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await fetchUserFromBackend(result.user);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, register, login, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
