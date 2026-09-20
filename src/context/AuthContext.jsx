"use client";
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCurrentUser(data.user);
          }
        }
      } catch (error) {
        console.error("Failed to check session", error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const signup = async (email, password, name, stream) => {
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email,
          stream,
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Add role if it's the admin
      if (data.user.email === 'parthibdutta947@gmail.com') {
        data.user.role = 'admin';
      } else {
        data.user.role = 'student';
      }

      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to log in');
      }

      if (data.user.email === 'parthibdutta947@gmail.com') {
        data.user.role = 'admin';
      } else {
        data.user.role = 'student';
      }

      setCurrentUser(data.user);
      return data.user;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
    } catch (e) {
      console.error("Logout failed", e);
    }
    setCurrentUser(null);
  };

  const updateCurrentUser = (updates) => {
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
  };

  const isAdmin = currentUser?.role === 'admin';

  const value = {
    currentUser,
    isAdmin,
    login,
    signup,
    logout,
    updateCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

