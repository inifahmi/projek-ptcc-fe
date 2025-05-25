// src/pages/EditProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

function EditProfilePage() {
  const { id } = useParams(); // ID user dari URL
  const navigate = useNavigate();
  const { user: loggedInUser, loading: authLoading, setUser } = useAuth(); // Ambil user dan fungsi setUser dari AuthContext

  // State untuk form profil
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentProfilePicture, setCurrentProfilePicture] = useState('');
  const [newProfilePictureFile, setNewProfilePictureFile] = useState(null);

  // State untuk data lain
  const [loading, setLoading] = useState(true); // Loading keseluruhan halaman
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false); // Loading saat submit form

  const defaultProfilePicture = 'https://placehold.co/128x128/cccccc/333333?text=User';

  useEffect(() => {
    // Redirect jika user tidak punya akses atau belum login
    if (!authLoading && (!loggedInUser)) {
      navigate('/login'); // Arahkan ke login jika tidak login
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Ambil data profil user yang akan diedit
        const response = await api.get(`/user/users/${id}`);
        const profileData = response.data.data;

        // Otorisasi frontend: Hanya user yang login atau admin yang bisa edit profil ini
        // Backend juga akan melakukan otorisasi ini.
        if (loggedInUser.role !== 'admin' && profileData.id !== loggedInUser.id) {
          setError("Anda tidak memiliki izin untuk mengedit profil ini.");
          setLoading(false);
          return;
        }

        setUsername(profileData.username);
        setEmail(profileData.email);
        setFullName(profileData.fullName);
        setCurrentProfilePicture(profileData.profilePicture || ''); // Set gambar saat ini
        setLoading(false);

      } catch (err) {
        console.error("Error fetching profile data:", err);
        setError(err.response?.data?.message || "Gagal memuat data profil.");
        setLoading(false);
      }
    };

    if (!authLoading && loggedInUser) { // Pastikan data user dari AuthContext sudah tersedia
      fetchProfileData();
    }
  }, [id, loggedInUser, authLoading, navigate]);

  const handleFileChange = (e) => {
    setNewProfilePictureFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Password baru dan konfirmasi password tidak cocok.");
      setSubmitting(false);
      return;
    }

    // Gunakan FormData untuk mengirim data (termasuk file jika ada)
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('fullName', fullName);
    if (password) { // Hanya kirim password jika diisi
      formData.append('password', password);
    }
    if (newProfilePictureFile) {
      formData.append('profilePicture', newProfilePictureFile); // Nama field harus sesuai dengan Multer di backend
    }

    try {
      // Endpoint: PUT /api/user/edit/:id
      const response = await api.put(`/user/edit/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Penting untuk pengiriman file
        },
      });
      setSuccess(response.data.message || "Profil berhasil diperbarui!");
      
      // Jika profil yang diedit adalah profil user yang sedang login, update state di AuthContext
      if (loggedInUser && loggedInUser.id === parseInt(id)) {
        // Backend harus mengembalikan data user yang diupdate di response.data.data
        const updatedUserData = response.data.data;
        setUser(updatedUserData); // Update user di AuthContext
        localStorage.setItem('user', JSON.stringify(updatedUserData)); // Update localStorage
      }

      // Update URL gambar profil yang ditampilkan
      if (response.data.data.profilePicture) {
        setCurrentProfilePicture(response.data.data.profilePicture);
      }
      setNewProfilePictureFile(null); // Reset input file
      setPassword(''); // Kosongkan field password setelah submit
      setConfirmPassword('');

      // Redirect kembali ke halaman profil setelah sukses
      navigate(`/profile/${id}`); 
    } catch (err) {
      console.error("Error updating profile:", err.response?.data?.message || err.message);
      setError(err.response?.data?.message || "Gagal memperbarui profil.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return <LoadingSpinner />;
  }

  // Tampilkan pesan jika user tidak punya akses atau otorisasi
  if (!loggedInUser || (loggedInUser.role !== 'admin' && loggedInUser.id !== parseInt(id)) || error?.includes("izin")) {
      return (
          <div className="container has-text-centered">
              <h2 className="title is-3 has-text-danger">Akses Ditolak</h2>
              <p>{error || "Anda tidak memiliki izin untuk mengedit profil ini."}</p>
          </div>
      );
  }

  return (
    <div className="container is-max-desktop" style={{ maxWidth: '600px', margin: 'auto', paddingTop: '50px' }}>
      <div className="box">
        <h2 className="title is-3 has-text-centered">Edit Profil</h2>
        <form onSubmit={handleSubmit}>
          {/* Gambar Profil Saat Ini */}
          <div className="field has-text-centered">
            <figure className="image is-128x128 is-inline-block">
              <img 
                className="is-rounded" 
                src={currentProfilePicture || defaultProfilePicture} 
                alt="Profile" 
                onError={(e) => { e.target.onerror = null; e.target.src = defaultProfilePicture; }}
              />
            </figure>
          </div>

          {/* Upload Gambar Profil Baru */}
          <div className="field">
            <label className="label">Ubah Gambar Profil (opsional)</label>
            <div className="file has-name is-fullwidth">
              <label className="file-label">
                <input
                  className="file-input"
                  type="file"
                  name="profilePicture" // Nama field harus sesuai dengan Multer di backend
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleFileChange}
                />
                <span className="file-cta">
                  <span className="file-icon">
                    <i className="fas fa-upload"></i>
                  </span>
                  <span className="file-label">
                    {newProfilePictureFile ? newProfilePictureFile.name : 'Pilih gambar baru...'}
                  </span>
                </span>
                <span className="file-name">
                  {newProfilePictureFile ? newProfilePictureFile.name : 'Tidak ada file baru yang dipilih'}
                </span>
              </label>
            </div>
          </div>

          {/* Username */}
          <div className="field">
            <label className="label">Username</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="field">
            <label className="label">Nama Lengkap</label>
            <div className="control">
              <input
                className="input"
                type="text"
                placeholder="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="field">
            <label className="label">Email</label>
            <div className="control">
              <input
                className="input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Baru (Opsional) */}
          <div className="field">
            <label className="label">Password Baru (kosongkan jika tidak ingin mengubah)</label>
            <div className="control">
              <input
                className="input"
                type="password"
                placeholder="Password Baru"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Konfirmasi Password Baru */}
          <div className="field">
            <label className="label">Konfirmasi Password Baru</label>
            <div className="control">
              <input
                className="input"
                type="password"
                placeholder="Konfirmasi Password Baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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
                Perbarui Profil
              </button>
            </div>
          </div>
          <div className="field mt-3 has-text-centered">
            <Link to={`/profile/${id}`} className="button is-link is-light">Kembali ke Profil</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfilePage;
