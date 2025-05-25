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
  const [isActive, setIsActive] = useState(false); // State untuk mengontrol status aktif navbar burger
  const [isCategoryDropdownActive, setIsCategoryDropdownActive] = useState(false); // State baru untuk dropdown kategori

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

  // Fungsi untuk mengaktifkan/menonaktifkan navbar burger
  const toggleNavbarBurger = () => {
    setIsActive(!isActive);
    setIsCategoryDropdownActive(false); // Tutup dropdown kategori saat burger diklik
  };

  // Fungsi untuk mengaktifkan/menonaktifkan dropdown kategori
  const toggleCategoryDropdown = () => {
    setIsCategoryDropdownActive(!isCategoryDropdownActive);
  };

  // Fungsi untuk menutup semua menu saat item diklik
  const closeAllMenus = () => {
    setIsActive(false);
    setIsCategoryDropdownActive(false);
  };

  return (
    <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item" to="/">
          <h1 className="title is-4 has-text-white">Portal Berita</h1>
        </Link>
        {/* Burger menu untuk mobile */}
        <a 
          role="button" 
          className={`navbar-burger burger ${isActive ? 'is-active' : ''}`}
          aria-label="menu" 
          aria-expanded={isActive ? 'true' : 'false'}
          data-target="navbarBasicExample"
          onClick={toggleNavbarBurger}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div id="navbarBasicExample" className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
        <div className="navbar-start">
          <Link className="navbar-item" to="/" onClick={closeAllMenus}>Home</Link>
          
          {/* PERBAIKAN DI SINI: Tambahkan kelas 'is-active' kondisional dan onClick handler */}
          <div className={`navbar-item has-dropdown ${isCategoryDropdownActive ? 'is-active' : ''}`}> 
            <a className="navbar-link" onClick={toggleCategoryDropdown}> {/* <--- Tambahkan onClick handler */}
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
                categories.map(category => (
                  <Link key={category.id} className="navbar-item" to={`/category/${category.id}`} onClick={closeAllMenus}> {/* Tutup semua menu setelah klik */}
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
                  <Link to="/dashboard" className="button is-info" onClick={closeAllMenus}>
                    Dashboard
                  </Link>
                ) : null}
                <Link to={`/profile/${user.id}`} className="button is-light" onClick={closeAllMenus}>
                  Profil ({user.username})
                </Link>
                <button onClick={() => { logout(); closeAllMenus(); }} className="button is-danger"> {/* Tutup menu setelah logout */}
                  Logout
                </button>
              </div>
            ) : (
              <div className="buttons">
                <Link to="/register" className="button is-primary" onClick={closeAllMenus}>
                  <strong>Daftar</strong>
                </Link>
                <Link to="/login" className="button is-light" onClick={closeAllMenus}>
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
