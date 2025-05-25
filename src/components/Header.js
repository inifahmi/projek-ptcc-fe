// src/components/Header.js
import React, { useState, useEffect } from 'react'; // Import useState dan useEffect
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api'; // Import instance Axios kita

function Header() {
  const { user, logout } = useAuth();
  const [categories, setCategories] = useState([]); // State untuk menyimpan kategori
  const [loadingCategories, setLoadingCategories] = useState(true); // State untuk loading kategori
  const [errorCategories, setErrorCategories] = useState(null); // State untuk error kategori

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Endpoint: GET /api/categories/all (publik)
        const response = await api.get('/categories/all');
        // Akses array kategori dari properti 'data' di dalam response.data
        setCategories(response.data.data); 
        setLoadingCategories(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setErrorCategories(err);
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []); // Jalankan sekali saat komponen dimuat

  return (
    <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item" to="/">
          <h1 className="title is-4 has-text-white">Portal Berita</h1>
        </Link>
        {/* Burger menu untuk mobile */}
        <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" className="navbar-menu">
        <div className="navbar-start">
          <Link className="navbar-item" to="/">Home</Link>
          
          <div className="navbar-item has-dropdown is-hoverable">
            <a className="navbar-link">
              Kategori
            </a>
            <div className="navbar-dropdown">
              {loadingCategories ? (
                <span className="navbar-item">Memuat kategori...</span>
              ) : errorCategories ? (
                <span className="navbar-item has-text-danger">Gagal memuat kategori</span>
              ) : categories.length === 0 ? (
                <span className="navbar-item">Tidak ada kategori</span>
              ) : (
                // Render kategori secara dinamis dari state
                categories.map(category => (
                  <Link key={category.id} className="navbar-item" to={`/category/${category.id}`}>
                    {category.name}
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="navbar-end">
          <div className="navbar-item">
            {user ? (
              <div className="buttons">
                {user.role === 'admin' || user.role === 'writer' ? (
                  <Link to="/dashboard" className="button is-info">
                    Dashboard
                  </Link>
                ) : null}
                <Link to={`/profile/${user.id}`} className="button is-light">
                  Profil ({user.username})
                </Link>
                <button onClick={logout} className="button is-danger">
                  Logout
                </button>
              </div>
            ) : (
              <div className="buttons">
                <Link to="/register" className="button is-primary">
                  <strong>Daftar</strong>
                </Link>
                <Link to="/login" className="button is-light">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Header;