// src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns'; // Untuk format tanggal

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // State untuk form artikel baru
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]); // Untuk dropdown kategori & manajemen kategori
  const [loading, setLoading] = useState(false); // Untuk submit artikel
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);

  // State untuk daftar artikel pengguna
  const [userArticles, setUserArticles] = useState([]);
  const [loadingUserArticles, setLoadingUserArticles] = useState(true);
  const [errorUserArticles, setErrorUserArticles] = useState(null);

  // State untuk manajemen user (khusus admin)
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(true);
  const [errorAllUsers, setErrorAllUsers] = useState(null);
  const [selectedRole, setSelectedRole] = useState({}); // Untuk menyimpan peran yang dipilih per user

  // State untuk manajemen kategori (khusus admin)
  const [newCategoryName, setNewCategoryName] = useState('');
  const [loadingCategoryAction, setLoadingCategoryAction] = useState(false);
  const [categoryActionError, setCategoryActionError] = useState(null);
  const [categoryActionSuccess, setCategoryActionSuccess] = useState(null);


  useEffect(() => {
    // Redirect jika user tidak punya akses atau belum login
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'writer'))) {
      navigate('/');
      return;
    }

    // Ambil daftar kategori untuk dropdown artikel & manajemen kategori
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/all');
        setCategories(response.data.data);
        setLoadingCategories(false);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setErrorCategories("Gagal memuat daftar kategori.");
        setLoadingCategories(false);
      }
    };
    fetchCategories();

    // Ambil daftar artikel yang dibuat oleh user yang login
    // Hanya fetch jika user adalah writer
    const fetchUserArticles = async () => {
      if (user && user.id && user.role === 'writer') {
        try {
          const response = await api.get(`/articles/user/${user.id}`);
          setUserArticles(response.data.data);
          setLoadingUserArticles(false);
        } catch (err) {
          console.error("Error fetching user articles:", err);
          setErrorUserArticles("Gagal memuat artikel Anda.");
          setLoadingUserArticles(false);
        }
      } else {
        setLoadingUserArticles(false);
      }
    };
    fetchUserArticles();

    // Ambil semua user jika role adalah 'admin'
    const fetchAllUsers = async () => {
      if (user && user.role === 'admin') {
        try {
          const response = await api.get('/user/all');
          setAllUsers(response.data.data);
          const initialRoles = {};
          response.data.data.forEach(u => {
            initialRoles[u.id] = u.role;
          });
          setSelectedRole(initialRoles);
          setLoadingAllUsers(false);
        } catch (err) {
          console.error("Error fetching all users:", err);
          setErrorAllUsers("Gagal memuat daftar semua pengguna.");
          setLoadingAllUsers(false);
        }
      } else {
        setLoadingAllUsers(false);
      }
    };
    fetchAllUsers();

  }, [user, authLoading, navigate]);

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!title || !content || !categoryId) {
      setError("Judul, konten, dan kategori tidak boleh kosong.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('categoryId', categoryId);
    if (imageFile) {
      formData.append('imageUrl', imageFile);
    }

    try {
      const response = await api.post('/articles/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccess(response.data.message || "Artikel berhasil dibuat!");
      setUserArticles(prevArticles => [...prevArticles, response.data.data]);
      setTitle('');
      setContent('');
      setCategoryId('');
      setImageFile(null);
    } catch (err) {
      console.error("Error creating article:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Gagal membuat artikel.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus artikel ini?")) {
      try {
        await api.delete(`/articles/delete/${articleId}`);
        setSuccess("Artikel berhasil dihapus!");
        setUserArticles(prevArticles => prevArticles.filter(article => article.id !== articleId));
      } catch (err) {
        console.error("Error deleting article:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Gagal menghapus artikel.");
      }
    }
  };

  const handleRoleChange = (userId, newRole) => {
    setSelectedRole(prevRoles => ({ ...prevRoles, [userId]: newRole }));
  };

  const handleUpdateRole = async (userId) => {
    const roleToUpdate = selectedRole[userId];
    if (!roleToUpdate) return;

    if (window.confirm(`Apakah Anda yakin ingin mengubah peran pengguna ${userId} menjadi ${roleToUpdate}?`)) {
      try {
        const response = await api.put(`/user/role/${userId}`, { newRole: roleToUpdate });
        setSuccess(response.data.message || `Peran pengguna ${userId} berhasil diperbarui.`);
        setAllUsers(prevUsers => prevUsers.map(u => 
            u.id === userId ? { ...u, role: roleToUpdate } : u
        ));
      } catch (err) {
        console.error("Error updating user role:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Gagal memperbarui peran pengguna.");
      }
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus pengguna ${username}?`)) {
      try {
        await api.delete(`/user/delete/${userId}`);
        setSuccess(`Pengguna ${username} berhasil dihapus!`);
        setAllUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      } catch (err) {
        console.error("Error deleting user:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Gagal menghapus pengguna.");
      }
    }
  };

  // Fungsi untuk membuat kategori baru (khusus admin)
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    setLoadingCategoryAction(true);
    setCategoryActionError(null);
    setCategoryActionSuccess(null);

    if (!newCategoryName.trim()) {
      setCategoryActionError("Nama kategori tidak boleh kosong.");
      setLoadingCategoryAction(false);
      return;
    }

    try {
      // Endpoint: POST /api/categories/new
      const response = await api.post('/categories/new', { name: newCategoryName });
      setCategoryActionSuccess(response.data.message || "Kategori berhasil dibuat!");
      setCategories(prevCategories => [...prevCategories, response.data.data]); // Tambahkan ke daftar kategori
      setNewCategoryName(''); // Reset input
    } catch (err) {
      console.error("Error creating category:", err.response?.data?.message || err.message);
      setCategoryActionError(err.response?.data?.message || "Gagal membuat kategori.");
    } finally {
      setLoadingCategoryAction(false);
    }
  };

  // Fungsi untuk menghapus kategori (khusus admin)
  const handleDeleteCategory = async (categoryIdToDelete, categoryNameToDelete) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryNameToDelete}"? Artikel yang terkait mungkin akan terpengaruh.`)) {
      setLoadingCategoryAction(true);
      setCategoryActionError(null);
      setCategoryActionSuccess(null);
      try {
        // Endpoint: DELETE /api/categories/delete/:id
        await api.delete(`/categories/delete/${categoryIdToDelete}`);
        setCategoryActionSuccess(`Kategori "${categoryNameToDelete}" berhasil dihapus!`);
        setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryIdToDelete)); // Hapus dari daftar
      } catch (err) {
        console.error("Error deleting category:", err.response?.data?.message || err.message);
        setCategoryActionError(err.response?.data?.message || "Gagal menghapus kategori.");
      } finally {
        setLoadingCategoryAction(false);
      }
    }
  };


  // Tampilkan loading spinner jika sedang memuat status autentikasi atau kategori/artikel/user
  if (authLoading || loadingCategories || (user?.role === 'writer' && loadingUserArticles) || (user?.role === 'admin' && loadingAllUsers)) {
    return <LoadingSpinner />;
  }

  // Tampilkan pesan jika user tidak punya akses
  if (!user || (user.role !== 'admin' && user.role !== 'writer')) {
      return (
          <div className="container has-text-centered">
              <h2 className="title is-3 has-text-danger">Akses Ditolak</h2>
              <p>Anda tidak memiliki izin untuk mengakses halaman ini.</p>
          </div>
      );
  }

  return (
    <div className="container">
      <h2 className="title is-2 has-text-centered mb-5">Dashboard {user.role === 'admin' ? 'Admin' : 'Penulis'}</h2>
      
      {/* Bagian Buat Artikel Baru (Hanya untuk Writer) */}
      {user.role === 'writer' && (
        <>
          <h3 className="title is-4">Buat Artikel Baru</h3>
          <div className="box mb-6">
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
                      {errorCategories ? (
                        <option disabled>Gagal memuat kategori</option>
                      ) : categories.length === 0 ? (
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

              {/* Gambar Artikel (File Upload) */}
              <div className="field">
                <label className="label">Gambar Artikel</label>
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
                        {imageFile ? imageFile.name : 'Pilih gambar...'}
                      </span>
                    </span>
                    <span className="file-name">
                      {imageFile ? imageFile.name : 'Tidak ada file yang dipilih'}
                    </span>
                  </label>
                </div>
                {error && error.includes("Invalid file type") && (
                  <p className="help is-danger">Tipe file tidak valid. Hanya JPG, PNG, GIF, dan WebP yang diizinkan.</p>
                )}
              </div>

              {/* Pesan Error dan Sukses */}
              {error && <div className="notification is-danger is-light mt-4">{error}</div>}
              {success && <div className="notification is-success is-light mt-4">{success}</div>}

              {/* Tombol Submit */}
              <div className="field mt-5">
                <div className="control">
                  <button
                    type="submit"
                    className={`button is-primary is-large is-fullwidth ${loading ? 'is-loading' : ''}`}
                    disabled={loading}
                  >
                    Buat Artikel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Bagian Daftar Artikel Anda (Hanya untuk Writer) */}
      {user.role === 'writer' && (
        <>
          <hr className="my-6" />
          <h3 className="title is-4">Artikel Anda ({userArticles.length})</h3>
          {errorUserArticles && <div className="notification is-danger is-light">{errorUserArticles}</div>}
          
          {userArticles.length === 0 ? (
            <p className="has-text-centered">Anda belum memiliki artikel.</p>
          ) : (
            <div className="table-container">
              <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Judul</th>
                    <th>Kategori</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {userArticles.map((article, index) => (
                    <tr key={article.id}>
                      <td>{index + 1}</td>
                      <td>
                        <Link to={`/article/${article.id}`}>
                          {article.title}
                        </Link>
                      </td>
                      <td>{article.Category?.name || 'Tidak Diketahui'}</td>
                      <td>{article.createdAt ? format(new Date(article.createdAt), 'dd MMM yyyy') : 'N/A'}</td>
                      <td>
                        <div className="buttons is-small">
                          <Link to={`/dashboard/edit-article/${article.id}`} className="button is-info is-light">
                            Edit
                          </Link>
                          <button 
                            onClick={() => handleDeleteArticle(article.id)} 
                            className="button is-danger is-light"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Bagian Manajemen Pengguna (Hanya Admin) */}
      {user.role === 'admin' && (
        <div className="admin-section mt-6">
          <hr className="my-6" />
          <h3 className="title is-4">Manajemen Pengguna</h3>
          {errorAllUsers && <div className="notification is-danger is-light">{errorAllUsers}</div>}

          {allUsers.length === 0 ? (
            <p className="has-text-centered">Tidak ada pengguna terdaftar.</p>
          ) : (
            <div className="table-container">
              <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Nama Lengkap</th>
                    <th>Peran</th>
                    <th>Bergabung</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u, index) => (
                    <tr key={u.id}>
                      <td>{index + 1}</td>
                      <td>{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.fullName}</td>
                      <td>
                        {u.id === user.id ? ( // Admin tidak bisa mengubah role dirinya sendiri melalui dropdown ini
                          <span className="tag is-info is-light">{u.role}</span>
                        ) : (
                          <div className="select is-small">
                            <select
                              value={selectedRole[u.id] || u.role}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            >
                              <option value="reader">reader</option>
                              <option value="writer">writer</option>
                              <option value="admin">admin</option>
                            </select>
                          </div>
                        )}
                      </td>
                      <td>{u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : 'N/A'}</td>
                      <td>
                        <div className="buttons is-small">
                          {u.id !== user.id && ( // Admin tidak bisa menghapus akunnya sendiri
                            <button
                              onClick={() => handleUpdateRole(u.id)}
                              className="button is-success is-light"
                              disabled={selectedRole[u.id] === u.role || !selectedRole[u.id]}
                            >
                              Perbarui Peran
                            </button>
                          )}
                          {u.id !== user.id && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.username)}
                              className="button is-danger is-light"
                            >
                              Hapus
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Bagian Manajemen Kategori (Hanya Admin) */}
      {user.role === 'admin' && (
        <div className="admin-section mt-6">
          <hr className="my-6" />
          <h3 className="title is-4">Manajemen Kategori</h3>
          
          {/* Form Buat Kategori Baru */}
          <div className="box mb-4">
            <h4 className="title is-5">Buat Kategori Baru</h4>
            <form onSubmit={handleCreateCategory}>
              <div className="field is-grouped">
                <div className="control is-expanded">
                  <input
                    className="input"
                    type="text"
                    placeholder="Nama Kategori Baru"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    required
                  />
                </div>
                <div className="control">
                  <button
                    type="submit"
                    className={`button is-primary ${loadingCategoryAction ? 'is-loading' : ''}`}
                    disabled={loadingCategoryAction}
                  >
                    Tambah Kategori
                  </button>
                </div>
              </div>
              {categoryActionError && <p className="help is-danger">{categoryActionError}</p>}
              {categoryActionSuccess && <p className="help is-success">{categoryActionSuccess}</p>}
            </form>
          </div>

          {/* Daftar Kategori */}
          <h4 className="title is-5">Daftar Kategori</h4>
          {loadingCategories ? (
            <LoadingSpinner />
          ) : errorCategories ? (
            <div className="notification is-danger is-light">{errorCategories}</div>
          ) : categories.length === 0 ? (
            <p className="has-text-centered">Tidak ada kategori.</p>
          ) : (
            <div className="table-container">
              <table className="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Kategori</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, index) => (
                    <tr key={cat.id}>
                      <td>{index + 1}</td>
                      <td>{cat.name}</td> {/* Tampilkan nama kategori saja */}
                      <td>
                        <div className="buttons is-small">
                          {/* Tombol Edit Kategori dihapus */}
                          <button 
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="button is-danger is-light"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DashboardPage;