// src/context/AuthContext.jsx
import React, { createContext, useEffect, useState } from 'react';
import API from '../Api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const stored = JSON.parse(localStorage.getItem('user')) || null;
  const [user, setUser] = useState(stored);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  }, [user, token]);

  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    setUser(res.data.user || null);
    setToken(res.data.token);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await API.post('/auth/register', { name, email, password });
    setUser(res.data.user || null);
    setToken(res.data.token);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
