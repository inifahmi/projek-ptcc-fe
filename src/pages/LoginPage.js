// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="container is-max-desktop" style={{ maxWidth: '400px', margin: 'auto', paddingTop: '50px' }}>
      <div className="box">
        <h2 className="title is-3 has-text-centered">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                className="input"
                type="email"
                placeholder="Masukkan email Anda"
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
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && <p className="help is-danger has-text-centered">{error}</p>}

          <div className="field is-grouped is-grouped-centered mt-4">
            <div className="control">
              <button
                type="submit"
                className={`button is-primary ${loading ? 'is-loading' : ''}`}
                disabled={loading}
              >
                Login
              </button>
            </div>
          </div>
          <p className="has-text-centered mt-3">
            Belum punya akun? <Link to="/register">Daftar di sini</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
