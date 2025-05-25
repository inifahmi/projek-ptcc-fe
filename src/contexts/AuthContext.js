// src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Ambil user dari localStorage saat inisialisasi, jika ada
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [loading, setLoading] = useState(true); // Untuk menandakan sedang memuat status auth
  const navigate = useNavigate();

  // Efek untuk memverifikasi token saat aplikasi dimuat
  useEffect(() => {
    const verifyAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
      let userId = null;

      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          userId = parsedUser.id;
        } catch (error) {
          console.error("Failed to parse user from localStorage for verification", error);
        }
      }

      if (accessToken && userId) {
        try {
          const response = await api.get(`/user/users/${userId}`);
          const userData = response.data.data;

          setUser(userData);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(userData));
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/user/login', { email, password });
      const { accessToken, user: userData } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error.response?.data?.message || error.message);
      return { success: false, message: error.response?.data?.message || 'Login gagal.' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/user/logout');
    } catch (error) {
      console.error('Logout failed on backend:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  // PERBAIKAN DI SINI: Tambahkan setUser ke dalam objek value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    setUser, // <--- TAMBAHKAN BARIS INI
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook untuk menggunakan AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
