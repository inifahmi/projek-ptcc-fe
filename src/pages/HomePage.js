// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import api from '../services/api'; // Menggunakan instance Axios yang sudah dikonfigurasi
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        // Endpoint: GET /api/articles/articles (publik)
        const response = await api.get('/articles/articles');
        setArticles(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching articles:", err);
        setError(err);
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="has-text-danger has-text-centered">Terjadi kesalahan saat memuat berita: {error.message}</p>;

  return (
    <div className="container">
      <h2 className="title is-2 has-text-centered mb-5">Berita Terbaru</h2>
      {articles.length === 0 ? (
        <p className="has-text-centered">Belum ada berita yang tersedia.</p>
      ) : (
        <div className="columns is-multiline">
          {articles.map(article => (
            <div key={article.id} className="column is-one-third-desktop is-half-tablet is-full-mobile">
              <NewsCard article={article} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;