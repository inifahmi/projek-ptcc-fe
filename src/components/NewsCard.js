// src/components/NewsCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function NewsCard({ article }) {
  // Fungsi untuk memotong konten agar menjadi excerpt
  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const defaultImageUrl = 'https://placehold.co/600x400/cccccc/333333?text=No+Image'; // Placeholder jika tidak ada gambar

  return (
    <div className="card is-shadowless" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-image">
        <figure className="image is-4by3">
          <img 
            src={article.imageUrl || defaultImageUrl} 
            alt={article.title} 
            onError={(e) => { e.target.onerror = null; e.target.src = defaultImageUrl; }} // Fallback error
          />
        </figure>
      </div>
      <div className="card-content" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <p className="title is-5 mb-2">
          <Link to={`/article/${article.id}`} className="has-text-dark">
            {article.title}
          </Link>
        </p>
        <p className="subtitle is-7 has-text-grey mb-3">
          Oleh: {article.User?.fullName || article.User?.username || 'Anonim'} | Kategori: {article.Category?.name || 'Tidak Diketahui'} | {new Date(article.createdAt).toLocaleDateString()}
        </p>
        <div className="content" style={{ flexGrow: 1 }}>
          {getExcerpt(article.content)}
        </div>
        <div className="has-text-right">
          <Link to={`/article/${article.id}`} className="button is-small is-primary is-outlined">
            Baca Selengkapnya
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NewsCard;