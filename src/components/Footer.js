// src/components/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="content has-text-centered">
        <p>
          <strong>Portal Berita</strong> Dibuat dengan React dan Bulma.
        </p>
        <p>
          &copy; {new Date().getFullYear()} Semua Hak Cipta Dilindungi.
        </p>
      </div>
    </footer>
  );
}

export default Footer;