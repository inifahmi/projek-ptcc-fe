// src/pages/RegisterPage.js
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok.");
      setLoading(false);
      return;
    }

    try {
      // Endpoint: POST /api/user/register (publik)
      const response = await api.post('/user/register', {
        username,
        email,
        password,
        fullName,
      });
      setSuccess(response.data.message || "Registrasi berhasil! Silakan login.");
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setTimeout(() => {
        navigate('/login'); // Redirect ke halaman login setelah registrasi sukses
      }, 2000);
    } catch (err) {
      console.error('Registration failed:', err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Registrasi gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container is-max-desktop" style={{ maxWidth: '500px', margin: 'auto', paddingTop: '50px' }}>
      <div className="box">
        <h2 className="title is-3 has-text-centered">Daftar Akun Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Username</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Pilih username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Full Name</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                className="input"
                type="email"
                placeholder="Masukkan alamat email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Password</label>
            <div className="control">
              <input
                className="input"
                type="password"
                placeholder="Buat password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Konfirmasi Password</label>
            <div className="control">
              <input
                className="input"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="help is-danger has-text-centered">{error}</p>}
          {success && <p className="help is-success has-text-centered">{success}</p>}

          <div className="field is-grouped is-grouped-centered mt-4">
            <div className="control">
              <button
                type="submit"
                className={`button is-primary ${loading ? 'is-loading' : ''}`}
                disabled={loading}
              >
                Daftar
              </button>
            </div>
          </div>
          <p className="has-text-centered mt-3">
            Sudah punya akun? <Link to="/login">Login di sini</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;