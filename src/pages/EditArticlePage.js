// src/pages/EditArticlePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // <-- Tambahkan 'Link' di sini
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext'; // Untuk otorisasi

function EditArticlePage() {
  const { id } = useParams(); // Ambil ID artikel dari URL
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  // State untuk form artikel
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // Untuk menampilkan gambar saat ini
  const [newImageFile, setNewImageFile] = useState(null); // Untuk file gambar baru

  // State untuk data lain
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true); // Loading keseluruhan halaman
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false); // Loading saat submit form

  const defaultImageUrl = 'https://placehold.co/600x400/cccccc/333333?text=No+Image';

  useEffect(() => {
    // Redirect jika user tidak punya akses atau belum login (proteksi tambahan)
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'writer'))) {
      navigate('/'); 
      return;
    }

    const fetchArticleData = async () => {
      try {
        // Ambil data artikel yang akan diedit
        // Endpoint: GET /api/articles/articles/:id
        const articleResponse = await api.get(`/articles/articles/${id}`);
        const articleData = articleResponse.data.data;

        // Cek otorisasi user: hanya penulis artikel atau admin yang bisa mengedit
        if (user.role !== 'admin' && articleData.userId !== user.id) {
          setError("Anda tidak memiliki izin untuk mengedit artikel ini.");
          setLoading(false);
          return;
        }

        setTitle(articleData.title);
        setContent(articleData.content);
        setCategoryId(articleData.categoryId);
        setCurrentImageUrl(articleData.imageUrl || ''); // Set gambar saat ini

        // Ambil daftar kategori untuk dropdown
        const categoriesResponse = await api.get('/categories/all');
        setCategories(categoriesResponse.data.data); // Sesuaikan dengan struktur respons backend
        setLoading(false);

      } catch (err) {
        console.error("Error fetching article or categories:", err);
        setError(err.response?.data?.message || "Gagal memuat data artikel.");
        setLoading(false);
      }
    };

    if (!authLoading && user) { // Pastikan data user dari AuthContext sudah tersedia
      fetchArticleData();
    }
  }, [id, user, authLoading, navigate]); // Dependensi: ID artikel, user, status loading auth, navigate

  const handleFileChange = (e) => {
    setNewImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!title || !content || !categoryId) {
      setError("Judul, konten, dan kategori tidak boleh kosong.");
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('categoryId', categoryId);
    if (newImageFile) {
      formData.append('imageUrl', newImageFile); // Nama field harus sesuai dengan Multer di backend
    }

    try {
      // Endpoint: PUT /api/articles/edit/:id
      const response = await api.put(`/articles/edit/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(response.data.message || "Artikel berhasil diperbarui!");
      // Setelah sukses, mungkin update URL gambar jika ada yang baru diupload
      if (response.data.data.imageUrl) {
        setCurrentImageUrl(response.data.data.imageUrl);
      }
      setNewImageFile(null); // Reset input file
      // Redirect kembali ke dashboard atau halaman detail artikel setelah sukses
      // navigate('/dashboard'); 
    } catch (err) {
      console.error("Error updating article:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Gagal memperbarui artikel.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  // Tampilkan pesan jika user tidak punya akses atau otorisasi
  if (!user || (user.role !== 'admin' && user.role !== 'writer') || error?.includes("izin")) { // Tambahan cek error izin
      return (
          <div className="container has-text-centered">
              <h2 className="title is-3 has-text-danger">Akses Ditolak</h2>
              <p>{error || "Anda tidak memiliki izin untuk mengakses halaman ini atau mengedit artikel ini."}</p>
          </div>
      );
  }

  return (
    <div className="container">
      <h2 className="title is-2 has-text-centered mb-5">Edit Artikel</h2>
      <div className="box">
        <form onSubmit={handleSubmit}>
          {/* Judul Artikel */}
          <div className="field">
            <label className="label">Judul Artikel</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Masukkan judul artikel"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Konten Artikel */}
          <div className="field">
            <label className="label">Konten Artikel</label>
            <div className="control">
              <textarea
                className="textarea"
                placeholder="Tulis konten artikel di sini..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="8"
                required
              ></textarea>
            </div>
          </div>

          {/* Kategori Artikel */}
          <div className="field">
            <label className="label">Kategori</label>
            <div className="control">
              <div className="select is-fullwidth">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.length === 0 ? (
                    <option disabled>Tidak ada kategori</option>
                  ) : (
                    categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* Gambar Artikel Saat Ini */}
          {currentImageUrl && (
            <div className="field mb-4">
              <label className="label">Gambar Saat Ini</label>
              <figure className="image is-128x128">
                <img 
                  src={currentImageUrl} 
                  alt="Current Article" 
                  onError={(e) => { e.target.onerror = null; e.target.src = defaultImageUrl; }}
                />
              </figure>
            </div>
          )}

          {/* Upload Gambar Artikel Baru */}
          <div className="field">
            <label className="label">Ubah Gambar Artikel (opsional)</label>
            <div className="file has-name is-fullwidth">
              <label className="file-label">
                <input
                  className="file-input"
                  type="file"
                  name="imageUrl"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fas fa-upload"></i>
                  </span>
                  <span className="file-label">
                    {newImageFile ? newImageFile.name : 'Pilih gambar baru...'}
                  </span>
                </span>
                <span className="file-name">
                  {newImageFile ? newImageFile.name : 'Tidak ada file baru yang dipilih'}
                </span>
              </label>
            </div>
          </div>

          {/* Pesan Error dan Sukses */}
          {error && <div className="notification is-danger is-light mt-4">{error}</div>}
          {success && <div className="notification is-success is-light mt-4">{success}</div>}

          {/* Tombol Submit */}
          <div className="field mt-5">
            <div className="control">
              <button
                type="submit"
                className={`button is-primary is-large is-fullwidth ${submitting ? 'is-loading' : ''}`}
                disabled={submitting}
              >
                Perbarui Artikel
              </button>
            </div>
          </div>
          <div className="field mt-3 has-text-centered">
            <Link to="/dashboard" className="button is-link is-light">Kembali ke Dashboard</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditArticlePage;