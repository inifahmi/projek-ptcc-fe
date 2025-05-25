// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner'; // Import LoadingSpinner

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // Tampilkan spinner saat memuat status autentikasi
  }

  if (!isAuthenticated) {
    // Jika belum login, redirect ke halaman login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Jika user tidak memiliki peran yang diizinkan, redirect ke halaman yang tidak diizinkan
    // Atau tampilkan pesan error
    return <Navigate to="/" replace />; // Contoh: redirect ke homepage
  }

  // Jika sudah login dan memiliki peran yang diizinkan, tampilkan konten rute
  return <Outlet />;
};

export default ProtectedRoute;
