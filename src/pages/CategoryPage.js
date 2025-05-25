// src/pages/CategoryPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import NewsCard from '../components/NewsCard';
import LoadingSpinner from '../components/LoadingSpinner';

function CategoryPage() {
  const { categoryId } = useParams(); // Ambil ID kategori dari URL
  const [articles, setArticles] = useState([]);
  const [categoryName, setCategoryName] = useState('Memuat...');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticlesByCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        // Endpoint: GET /api/categories/categories/:id (untuk mendapatkan nama kategori)
        const categoryResponse = await api.get(`/categories/categories/${categoryId}`);
        // PERBAIKAN DI SINI: Akses nama kategori dari response.data.data.name
        setCategoryName(categoryResponse.data.data.name); // <--- UBAH INI

        // Endpoint: GET /api/articles/category/:categoryId (publik)
        const articlesResponse = await api.get(`/articles/category/${categoryId}`);
        // PERBAIKAN DI SINI: Akses array artikel dari response.data.data
        setArticles(articlesResponse.data.data); // <--- UBAH INI
        setLoading(false);
      } catch (err) {
        console.error("Error fetching category or articles:", err);
        setError(err);
        setLoading(false);
      }
    };
    fetchArticlesByCategory();
  }, [categoryId]); // Jalankan ulang jika ID kategori berubah

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="has-text-danger has-text-centered">Terjadi kesalahan saat memuat kategori atau artikel: {error.message}</p>;

  return (
    <div className="container">
      <h2 className="title is-2 has-text-centered mb-5">Artikel Kategori: {categoryName}</h2>
      {articles.length === 0 ? (
        <p className="has-text-centered">Belum ada artikel dalam kategori ini.</p>
      ) : (
        <div className="columns is-multiline">
          {articles.map(article => (
            <div key={article.id} className="column is-one-third-desktop is-half-tablet is-full-mobile">
              <NewsCard article={article} />
            </div>
          ))}
        </div>
      )}
      <div className="has-text-centered mt-5">
        <Link to="/" className="button is-link is-outlined">Kembali ke Home</Link>
      </div>
    </div>
  );
}

export default CategoryPage;