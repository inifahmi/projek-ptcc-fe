// src/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext'; // Untuk mengecek apakah user yang login adalah pemilik profil
import { format } from 'date-fns';

function ProfilePage() {
  const { id } = useParams(); // ID pengguna dari URL
  const { user: loggedInUser } = useAuth(); // Pengguna yang sedang login
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultProfilePicture = 'https://placehold.co/128x128/cccccc/333333?text=User';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/user/users/${id}`);
        setProfile(response.data.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="has-text-danger has-text-centered">Terjadi kesalahan saat memuat profil: {error.message}</p>;
  if (!profile) return <p className="has-text-centered">Profil tidak ditemukan.</p>;

  // Cek apakah user yang sedang login adalah pemilik profil ini
  const isOwner = loggedInUser && loggedInUser.id === profile.id;

  return (
    <div className="container is-max-desktop" style={{ maxWidth: '600px', margin: 'auto', paddingTop: '50px' }}>
      <div className="box has-text-centered">
        <figure className="image is-128x128 is-inline-block mb-4">
          <img
            className="is-rounded"
            src={profile.profilePicture || defaultProfilePicture}
            alt={profile.username}
            onError={(e) => { e.target.onerror = null; e.target.src = defaultProfilePicture; }}
            style={{ objectFit: 'cover', objectPosition: 'center' }} // <--- Tambahkan style ini
          />
        </figure>
        <h1 className="title is-3">{profile.fullName || profile.username}</h1>
        <h2 className="subtitle is-5 has-text-grey">@{profile.username}</h2>
        <p className="mb-2">Email: {profile.email}</p>
        <p className="mb-2">Peran: <span className="tag is-info is-light">{profile.role}</span></p>
        <p className="mb-4">Bergabung sejak: {profile.createdAt ? format(new Date(profile.createdAt), 'dd MMMM yyyy') : 'Invalid Date'}</p>

        {isOwner && (
          <div className="buttons is-centered">
            <Link to={`/profile/edit/${profile.id}`} className="button is-primary is-outlined">
              Edit Profil
            </Link>
            {/* Tombol hapus akun (dengan konfirmasi) */}
            <button className="button is-danger is-outlined">Hapus Akun</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
