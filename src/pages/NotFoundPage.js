// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <section className="hero is-fullheight-with-navbar is-danger">
      <div className="hero-body">
        <div className="container has-text-centered">
          <p className="title is-1">
            404
          </p>
          <p className="subtitle is-3">
            Halaman Tidak Ditemukan
          </p>
          <p className="mb-5">
            Maaf, halaman yang Anda cari tidak ada.
          </p>
          <Link to="/" className="button is-light is-large">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFoundPage;