// src/pages/ArticleDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext'; // <--- PERBAIKAN DI SINI: Ubah dari '../contexts/Auth'
import { format } from 'date-fns';

function ArticleDetailPage() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [commentSuccess, setCommentSuccess] = useState(null);

  // State baru untuk fitur edit komentar
  const [editingCommentId, setEditingCommentId] = useState(null); // ID komentar yang sedang diedit
  const [editingCommentContent, setEditingCommentContent] = useState(''); // Konten komentar yang sedang diedit

  const defaultImageUrl = 'https://placehold.co/800x600/cccccc/333333?text=No+Image';

  useEffect(() => {
    const fetchArticleAndComments = async () => {
      try {
        const articleResponse = await api.get(`/articles/articles/${id}`);
        setArticle(articleResponse.data.data);

        const commentsResponse = await api.get(`/comments/article/${id}`);
        setComments(commentsResponse.data.data);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching article or comments:", err);
        setError(err);
        setLoading(false);
      }
    };
    fetchArticleAndComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError(null);
    setCommentSuccess(null);
    if (!newComment.trim()) {
      setCommentError("Komentar tidak boleh kosong.");
      return;
    }

    try {
      const response = await api.post(`/comments/new/${id}`, { content: newComment });
      setComments(prevComments => [...prevComments, response.data.data]);
      setNewComment('');
      setCommentSuccess("Komentar berhasil ditambahkan!");
    } catch (err) {
      console.error("Error submitting comment:", err.response?.data?.message || err.message);
      setCommentError(err.response?.data?.message || "Gagal mengirim komentar.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      try {
        await api.delete(`/comments/delete/${commentId}`);
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
        setCommentSuccess("Komentar berhasil dihapus!");
      } catch (err) {
        console.error("Error deleting comment:", err.response?.data?.message || err.message);
        setCommentError(err.response?.data?.message || "Gagal menghapus komentar.");
      }
    }
  };

  // Fungsi baru untuk memulai mode edit
  const handleEditClick = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  // Fungsi baru untuk membatalkan mode edit
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  // Fungsi baru untuk menyimpan perubahan komentar
  const handleUpdateComment = async (commentId) => {
    setCommentError(null);
    setCommentSuccess(null);
    if (!editingCommentContent.trim()) {
      setCommentError("Konten komentar tidak boleh kosong.");
      return;
    }

    try {
      // Endpoint: PUT /api/comments/edit/:id
      const response = await api.put(`/comments/edit/${commentId}`, { content: editingCommentContent });
      setComments(prevComments => 
        prevComments.map(comment => 
          comment.id === commentId ? { ...comment, content: response.data.data.content } : comment // Update konten komentar
        )
      );
      setCommentSuccess("Komentar berhasil diperbarui!");
      setEditingCommentId(null); // Keluar dari mode edit
      setEditingCommentContent('');
    } catch (err) {
      console.error("Error updating comment:", err.response?.data?.message || err.message);
      setCommentError(err.response?.data?.message || "Gagal memperbarui komentar.");
    }
  };


  if (loading) return <LoadingSpinner />;
  if (error) return <p className="has-text-danger has-text-centered">Terjadi kesalahan saat memuat artikel: {error.message}</p>;
  if (!article) return <p className="has-text-centered">Artikel tidak ditemukan.</p>;

  return (
    <div className="container">
      <div className="box">
        <h1 className="title is-2">{article.title}</h1>
        <p className="subtitle is-6 has-text-grey">
          Oleh: {article.User?.fullName || article.User?.username || 'Anonim'} | Kategori: {article.Category?.name || 'Tidak Diketahui'} | Dipublikasikan: 
          {/* PERBAIKAN DI SINI: Ubah 'iedenis' menjadi 'yyyy' */}
          {article.createdAt ? format(new Date(article.createdAt), 'dd MMMM yyyy HH:mm') : 'Tanggal tidak tersedia'}
        </p>
        {/* PERBAIKAN DI SINI: Kontrol ukuran gambar */}
        {/* Hapus kelas is-4by3 dari figure, tambahkan style max-width dan margin auto untuk centering */}
        <figure className="image mb-4 is-flex is-justify-content-center" style={{ maxWidth: '800px', margin: '0 auto' }}> 
          <img 
            src={article.imageUrl || defaultImageUrl} 
            alt={article.title} 
            onError={(e) => { e.target.onerror = null; e.target.src = defaultImageUrl; }}
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }} // Pastikan gambar mengisi figure dan menjaga rasio
          />
        </figure>
        <div className="content" dangerouslySetInnerHTML={{ __html: article.content }}>
          {/* Konten artikel */}
        </div>
      </div>

      <div className="box mt-5">
        <h3 className="title is-4">Komentar ({comments.length})</h3>
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="field">
              <div className="control">
                <textarea
                  className="textarea"
                  placeholder="Tambahkan komentar Anda..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows="3"
                ></textarea>
              </div>
            </div>
            {commentError && <p className="help is-danger">{commentError}</p>}
            {commentSuccess && <p className="help is-success">{commentSuccess}</p>}
            <div className="field">
              <div className="control">
                <button type="submit" className="button is-primary">Kirim Komentar</button>
              </div>
            </div>
          </form>
        ) : (
          <p className="mb-4">Silakan <Link to="/login">login</Link> untuk menambahkan komentar.</p>
        )}

        {comments.length === 0 ? (
          <p>Belum ada komentar untuk artikel ini.</p>
        ) : (
          <div>
            {comments.map(comment => (
              <article key={comment.id} className="media mb-4">
                <figure className="media-left">
                  <p className="image is-48x48">
                    <img 
                      className="is-rounded" 
                      src={comment.User?.profilePicture || 'https://placehold.co/48x48/cccccc/333333?text=User'} 
                      alt={comment.User?.username || 'User'} 
                      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/48x48/cccccc/333333?text=User'; }}
                    />
                  </p>
                </figure>
                <div className="media-content">
                  {editingCommentId === comment.id ? ( // Jika komentar ini sedang diedit
                    <div className="field">
                      <div className="control">
                        <textarea
                          className="textarea"
                          value={editingCommentContent}
                          onChange={(e) => setEditingCommentContent(e.target.value)}
                          rows="3"
                        ></textarea>
                      </div>
                      <div className="buttons mt-2">
                        <button 
                          className="button is-small is-primary"
                          onClick={() => handleUpdateComment(comment.id)}
                        >
                          Simpan
                        </button>
                        <button 
                          className="button is-small is-light"
                          onClick={handleCancelEdit}
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : ( // Jika tidak sedang diedit, tampilkan konten biasa
                    <div className="content">
                      <p>
                        <strong>{comment.User?.fullName || comment.User?.username || 'Anonim'}</strong> <small>
                          {/* PERBAIKAN DI SINI: Ubah 'iedenis' menjadi 'yyyy' */}
                          {comment.createdAt ? format(new Date(comment.createdAt), 'dd MMMM yyyy HH:mm') : 'Tanggal tidak tersedia'}
                        </small>
                        <br />
                        {comment.content}
                      </p>
                    </div>
                  )}
                </div>
                {/* Tombol Aksi Komentar (Hapus & Edit) */}
                {/* Hanya pemilik komentar yang bisa mengedit */}
                {(isAuthenticated && user && user.id === comment.userId) && (
                  <div className="media-right">
                    {editingCommentId !== comment.id && ( // Tampilkan tombol edit jika tidak sedang diedit
                      <button 
                        onClick={() => handleEditClick(comment)}
                        className="button is-small is-info is-light mr-2"
                      >
                        Edit
                      </button>
                    )}
                    {/* Tombol Hapus: Tetap bisa dihapus oleh pemilik atau Admin */}
                    {(user.id === comment.userId || user.role === 'admin') && (
                      <button 
                        onClick={() => handleDeleteComment(comment.id)}
                        className="delete" // Bulma delete icon
                        aria-label="delete"
                      ></button>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArticleDetailPage;