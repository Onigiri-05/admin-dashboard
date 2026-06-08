import React, { useState, useEffect } from 'react';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Search, Database } from 'lucide-react';
import './EksplorDatabase.css';

const EksplorDatabase = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'transactions'));
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(list);
    } catch (err) {
      console.error("Gagal mengambil data transaksi:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = transactions.filter(item => 
    item.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.catatan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ color: '#64748B', fontWeight: 600 }}>Menghubungkan ke Firestore Node...</div>;

  return (
    <div className="eksplor-db-container">
      <div className="search-bar-wrapper">
        <Search size={20} className="search-icon" />
        <input 
          type="text" 
          placeholder="Cari transaksi berdasarkan kategori atau catatan..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-card">
        <table className="db-table">
          <thead>
            <tr>
              <th>ID Dokumen</th>
              <th>Kategori</th>
              <th>Tipe</th>
              <th>Jumlah</th>
              <th>Catatan</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#94A3B8', padding: '2rem' }}>Data dokumen transaksi tidak ditemukan.</td>
              </tr>
            ) : (
              filteredData.map((tx) => (
                <tr key={tx.id}>
                  <td className="doc-id-text">{tx.id}</td>
                  <td><span className="category-label">{tx.kategori}</span></td>
                  <td>
                    <span className={`type-badge ${tx.tipe === 'pengeluaran' ? 'type-out' : 'type-in'}`}>
                      {tx.tipe}
                    </span>
                  </td>
                  <td className="table-amount">Rp {(tx.jumlah || 0).toLocaleString('id-ID')}</td>
                  <td>{tx.catatan || '-'}</td>
                  <td>{tx.tanggal ? new Date(tx.tanggal.seconds * 1000).toLocaleDateString('id-ID') : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EksplorDatabase;