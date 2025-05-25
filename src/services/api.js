// src/services/api.js
import axios from 'axios';

// Dapatkan URL backend dari variabel lingkungan
// Pastikan Anda membuat file .env di root folder frontend Anda
// Contoh: REACT_APP_BACKEND_URL=http://localhost:5000/api
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Penting untuk mengirim cookies (jika backend menggunakan cookie untuk refresh token)
});

// Interceptor untuk menambahkan token akses ke setiap request yang dilindungi
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken'); // Ambil token dari localStorage
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani refresh token atau logout otomatis jika token expired/invalid
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Jika error adalah 401 (Unauthorized) dan bukan dari request login atau register
    // dan belum mencoba refresh token untuk request ini
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Tandai request ini sudah dicoba refresh

      try {
        // Panggil endpoint refresh token dari backend
        // Backend Anda harus menyediakan endpoint ini untuk mendapatkan token akses baru
        const response = await axios.post(`${API_BASE_URL}/user/refresh-token`, {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken; // Asumsi backend merespons dengan accessToken baru

        localStorage.setItem('accessToken', newAccessToken); // Simpan token baru
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`; // Set header default
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`; // Update header request asli

        return api(originalRequest); // Coba lagi request yang gagal
      } catch (refreshError) {
        // Jika refresh token gagal (misal refresh token expired/invalid), paksa logout
        console.error('Refresh token failed, forcing logout:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user'); // Hapus juga info user dari local storage
        // Redirect ke halaman login atau tampilkan pesan error
        window.location.href = '/login'; // Contoh redirect
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;