import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { MessageSquare, Star } from 'lucide-react';
import './UlasanFeedback.css';

const UlasanFeedback = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Menghubungkan langsung ke koleksi 'reviews' sesuai database aslimu
    const unsubscribe = onSnapshot(collection(db, 'reviews'), (snapshot) => {
      const reviewList = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        reviewList.push({
          id: doc.id,
          email: data.email || 'Anonymous',
          comment: data.comment || '',
          rating: data.rating || 0,
          sprint: data.sprint || 'Umum',
          createdAt: data.createdAt ? data.createdAt.toDate().toLocaleDateString('id-ID') : 'Tidak ada tanggal'
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

  return (
    <div className="uf-wrapper">
      <div className="uf-header">
        <h1 className="uf-title">Ulasan & Feedback</h1>
        <p className="uf-subtitle">Data feedback real-time dari mahasiswa pengguna BudJet</p>
      </div>

      {loading ? (
        <p className="uf-loading">Memuat ulasan dari Firestore...</p>
      ) : reviews.length > 0 ? (
        <div className="uf-grid">
          {reviews.map((rev) => (
            <div key={rev.id} className="uf-card">
              <div className="uf-card-top">
                <span className="uf-user-email">{rev.email}</span>
                <span className="uf-sprint-badge">{rev.sprint}</span>
              </div>
              
              <div className="uf-stars">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={16} 
                    fill={i < rev.rating ? "#F59E0B" : "none"} 
                    stroke={i < rev.rating ? "#F59E0B" : "#CBD5E1"} 
                  />
                ))}
              </div>

              <p className="uf-comment">"{rev.comment}"</p>
              <span className="uf-date">{rev.createdAt}</span>
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