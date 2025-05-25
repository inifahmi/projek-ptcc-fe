// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bulma/css/bulma.min.css'; // Pastikan Bulma diimpor

// Import Context Provider
import { AuthProvider } from './contexts/AuthContext';

// Import Components (Header, Footer)
import Header from './components/Header';
import Footer from './components/Footer';

// Import Pages
import HomePage from './pages/HomePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import CategoryPage from './pages/CategoryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage'; // Contoh halaman admin/writer
import NotFoundPage from './pages/NotFoundPage'; // Halaman 404
import EditArticlePage from './pages/EditArticlePage';

// Import ProtectedRoute (akan kita buat nanti)
import ProtectedRoute from './components/ProtectedRoute';
import EditProfilePage from './pages/EditProfilePage';

function App() {
  return (
    <Router>
      {/* AuthProvider membungkus seluruh aplikasi agar state autentikasi bisa diakses di mana saja */}
      <AuthProvider>
        <div className="App">
          <Header /> {/* Header akan selalu muncul di setiap halaman */}
          <main className="section"> {/* Bulma section untuk padding konten */}
            <div className="container"> {/* Bulma container untuk lebar konten */}
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/article/:id" element={<ArticleDetailPage />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/profile/:id" element={<ProfilePage />} /> {/* Bisa dilihat publik, tapi edit butuh auth */}
                

                {/* Protected Routes (Contoh) */}
                {/* Hanya user dengan role 'admin' atau 'writer' yang bisa akses Dashboard */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'writer']} />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  {/* Tambahkan rute lain yang dilindungi di sini, misalnya /article/new, /article/edit/:id */}
                  {/* Kita akan bahas lebih lanjut di bagian masing-masing komponen */}
                  <Route path="/dashboard/edit-article/:id" element={<EditArticlePage />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['reader', 'writer', 'admin']} />}> {/* Semua role yang login bisa mengedit profilnya sendiri */}
                  <Route path="/profile/edit/:id" element={<EditProfilePage />} /> {/* <--- TAMBAH RUTE BARU INI */}
                </Route>

                {/* Catch-all route for 404 Not Found */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </main>
          <Footer /> {/* Footer akan selalu muncul di setiap halaman */}
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
