import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { MessageSquare, Star, Trash2 } from 'lucide-react';
import './UlasanFeedback.css';

const UlasanFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener real-time ke koleksi 'reviews' di Firestore
    const unsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const reviewList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reviewList.push({
          id: doc.id,
          email: data.email || 'Anonymous',
          comment: data.comment || '',
          rating: data.rating || 0,
          sprint: data.sprint || 'Sprint 1',
          createdAt: data.createdAt 
            ? data.createdAt.toDate().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) 
            : 'Tidak ada tanggal'
        });
      });
      setReviews(reviewList);
      setLoading(false);
    }, (error) => {
      console.error("Gagal mengambil data ulasan:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fungsi untuk menghapus ulasan dari database
  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus ulasan ini?")) {
      try {
        await deleteDoc(doc(db, 'reviews', id));
      } catch (error) {
        console.error("Gagal menghapus dokumen:", error);
      }
    }
  };

  return (
    <div className="ringkasan-root">
      {/* HEADER UTAMA */}
      <div className="ringkasan-header-row">
        <div>
          <h1 className="main-title-text">Ulasan & Feedback Aplikasi</h1>
          <p className="subtitle-text">Panel Kontrol Utama BudJet • Sinkronisasi Database Dua Arah Aktif</p>
        </div>
        <div className="database-status-badge">
          <span className="status-dot-pulse"></span>
          Database Terhubung
        </div>
      </div>

      {/* BANNER SUMMARY CONTROLLER */}
      <div className="feedback-summary-banner">
        <div className="banner-left">
          <div className="banner-icon-wrapper">
            <MessageSquare size={20} className="title-inline-icon-lime" />
          </div>
          <span className="banner-title">Feedback Hasil Pengujian Sprint 1 & Sprint 2</span>
        </div>
        <div className="banner-badge-count">
          {reviews.length} TOTAL ULASAN
        </div>
      </div>

      {/* GRID DAFTAR KARTU ULASAN */}
      {loading ? (
        <p className="uf-loading">Memuat ulasan dari Firestore...</p>
      ) : reviews.length > 0 ? (
        <div className="feedback-cards-grid">
          {reviews.map((rev) => (
            <div key={rev.id} className="feedback-item-card">
              
              {/* Baris Atas: Tag Sprint & Rating Bintang */}
              <div className="card-top-row">
                <span className={`sprint-tag ${rev.sprint.toLowerCase().replace(/\s+/g, '-')}`}>
                  {rev.sprint}
                </span>
                <div className="stars-indicator-flex">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={16} 
                      fill={i < rev.rating ? "#F59E0B" : "none"} 
                      stroke={i < rev.rating ? "#F59E0B" : "#E2E8F0"} 
                    />
                  ))}
                </div>
              </div>

              {/* Isi Teks Komentar */}
              <p className="feedback-body-text">"{rev.comment}"</p>
              
              {/* Baris Bawah: Identitas Pengguna & Tombol Aksi */}
              <div className="card-bottom-row">
                <div className="user-meta-info">
                  <span className="user-email-display">{rev.email}</span>
                  <span className="feedback-timestamp">📅 {rev.createdAt}</span>
                </div>
                <button 
                  className="delete-feedback-btn" 
                  onClick={() => handleDelete(rev.id)}
                  title="Hapus Ulasan"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <p className="uf-empty">Belum ada ulasan yang masuk di database.</p>
      )}
    </div>
  );
};

export default UlasanFeedback;