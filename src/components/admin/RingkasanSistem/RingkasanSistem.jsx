import React from 'react';
import { Users, BarChart3, Wallet, AlertTriangle } from 'lucide-react';
import './RingkasanSistem.css';

const RingkasanSistem = ({ totalUsers, totalAnggaran, totalSaldo, rataAnggaran, loading }) => {
  
  // Fungsi mempersingkat nominal angka rupiah agar seragam & pas di layout komponen
  const formatRupiahSingkat = (angka) => {
    const nilai = Number(angka);
    
    if (!nilai || isNaN(nilai) || nilai === 0) {
      return "Rp0";
    }

    const nilaiAbsolut = Math.abs(nilai);
    const tandaMinus = nilai < 0 ? "-" : "";

    // Deteksi pecahan string berdasarkan tingkat digit nominal uang
    if (nilaiAbsolut >= 1e12) {
      return `${tandaMinus}Rp ${(nilaiAbsolut / 1e12).toFixed(1).replace('.0', '')} T`;
    } 
    if (nilaiAbsolut >= 1e9) {
      return `${tandaMinus}Rp ${(nilaiAbsolut / 1e9).toFixed(1).replace('.0', '')} M`;
    } 
    if (nilaiAbsolut >= 1e6) {
      return `${tandaMinus}Rp ${(nilaiAbsolut / 1e6).toFixed(1).replace('.0', '')} JT`;
    } 
    if (nilaiAbsolut >= 1e3) {
      return `${tandaMinus}Rp ${(nilaiAbsolut / 1e3).toFixed(1).replace('.0', '')} RB`;
    } 

    return `${tandaMinus}Rp ${nilaiAbsolut}`;
  };

  return (
    <div className="ringkasan-root">
      <div className="ringkasan-header-row">
        <div>
          <h1 className="main-title-text">Ringkasan Sistem</h1>
          <p className="subtitle-text">Panel Kontrol Utama BudJet • Sinkronisasi Database Dua Arah Aktif</p>
        </div>
        <div className="database-status-badge">
          <span className="status-dot-pulse"></span> Database Terhubung
        </div>
      </div>

      <div className="cards-grid-layout">
        
        {/* 1. Total Pengguna */}
        <div className="metrics-card">
          <div className="card-header-flex">
            <div className="icon-box-wrapper icon-users-blue">
              <Users size={20} />
            </div>
            <span className="metrics-label">Total Pengguna</span>
          </div>
          <h2 className="metrics-value">{loading ? "..." : totalUsers}</h2>
          <p className="metrics-desc">Pengguna terdaftar aktif di aplikasi</p>
        </div>

        {/* 2. Anggaran Dikelola */}
        <div className="metrics-card">
          <div className="card-header-flex">
            <div className="icon-box-wrapper icon-chart-green">
              <BarChart3 size={20} />
            </div>
            <span className="metrics-label">Anggaran Dikelola</span>
          </div>
          <h2 className="metrics-value">{loading ? "..." : formatRupiahSingkat(totalAnggaran)}</h2>
          <p className="metrics-desc">Total pagu anggaran bulanan mahasiswa</p>
        </div>

        {/* 3. Sisa Saldo Kumulatif */}
        <div className="metrics-card">
          <div className="card-header-flex">
            <div className="icon-box-wrapper icon-wallet-blue">
              <Wallet size={20} />
            </div>
            <span className="metrics-label">Sisa Saldo Kumulatif</span>
          </div>
          <h2 className="metrics-value">{loading ? "..." : formatRupiahSingkat(totalSaldo)}</h2>
          <p className="metrics-desc">Sisa jatah terkumpul seluruh mahasiswa</p>
        </div>

        {/* 4. Rata-Rata Anggaran */}
        <div className="metrics-card">
          <div className="card-header-flex">
            <div className="icon-box-wrapper icon-alert-red">
              <AlertTriangle size={20} />
            </div>
            <span className="metrics-label">Rata-Rata Anggaran</span>
          </div>
          <h2 className="metrics-value">{loading ? "..." : formatRupiahSingkat(rataAnggaran)}</h2>
          <p className="metrics-desc">Rata-rata anggaran mahasiswa / bulan</p>
        </div>

      </div>

      <div className="bottom-cards-layout">
        
        {/* DISTRIBUSI ANGGARAN */}
        <div className="content-detail-card">
          <h3 className="section-card-title">📦 Distribusi Anggaran Kategori (Kumulatif)</h3>
          <p className="section-card-desc">Persentase alokasi dana mahasiswa berdasarkan data kategori aplikasi mobile.</p>
          
          <div className="progress-bars-stack">
            <div className="bar-item">
              <div className="bar-label-row"><span>Makanan & Minuman</span> <b>45%</b></div>
              <div className="progress-track"><div className="progress-fill fill-lime" style={{width: '45%'}}></div></div>
            </div>
            <div className="bar-item">
              <div className="bar-label-row"><span>Transportasi</span> <b>20%</b></div>
              <div className="progress-track"><div className="progress-fill fill-blue" style={{width: '20%'}}></div></div>
            </div>
            <div className="bar-item">
              <div className="bar-label-row"><span>Hiburan</span> <b>15%</b></div>
              <div className="progress-track"><div className="progress-fill fill-orange" style={{width: '15%'}}></div></div>
            </div>
            <div className="bar-item">
              <div className="bar-label-row"><span>Belanja</span> <b>10%</b></div>
              <div className="progress-track"><div className="progress-fill fill-purple" style={{width: '10%'}}></div></div>
            </div>
            <div className="bar-item">
              <div className="bar-label-row"><span>Kesehatan</span> <b>5%</b></div>
              <div className="progress-track"><div className="progress-fill fill-red" style={{width: '5%'}}></div></div>
            </div>
            <div className="bar-item">
              <div className="bar-label-row"><span>Tagihan & Utilitas</span> <b>3%</b></div>
              <div className="progress-track"><div className="progress-fill fill-teal" style={{width: '3%'}}></div></div>
            </div>
            <div className="bar-item">
              <div className="bar-label-row"><span>Lainnya</span> <b>2%</b></div>
              <div className="progress-track"><div className="progress-fill fill-gray" style={{width: '2%'}}></div></div>
            </div>
          </div>
        </div>

        {/* STATUS KESEHATAN CLOUD FIRESTORE */}
        <div className="content-detail-card flex-column-layout">
          <div className="cloud-main-info">
            <h3 className="section-card-title">🗄️ Status Kesehatan Cloud Firestore</h3>
            <p className="section-card-desc">Status performa web admin, lisensi, dan server database Google Cloud.</p>
            
            <div className="cloud-status-grid">
              <div className="cloud-mini-card">
                <span className="mini-label">SINKRONISASI</span>
                <h4>Aktif</h4>
                <span className="badge-green-status"><span className="mini-dot"></span> Real-time</span>
              </div>
              <div className="cloud-mini-card">
                <span className="mini-label">PROJECT ID</span>
                <h4 className="mono-text">pdbl-project-d61da</h4>
                <span className="google-cloud-text">✓ Google Cloud</span>
              </div>
              <div className="cloud-mini-card">
                <span className="mini-label">RASIO ADMIN</span>
                <h4>1%</h4>
                <p className="mini-subtext">2 dari {totalUsers} user</p>
              </div>
              <div className="cloud-mini-card">
                <span className="mini-label">SSL SECURITY</span>
                <h4>TLS 1.3</h4>
                <span className="ssl-badge">✓ Sangat Aman</span>
              </div>
            </div>
          </div>

          <div className="mobile-sync-info-box">
            <h4>🚀 Aktivitas Sinkronisasi Aplikasi Mobile:</h4>
            <p>Setiap transaksi pengeluaran (makanan, transportasi, hiburan) yang dicatat mahasiswa di ponsel akan secara instan memperbarui nilai saldo kumulatif di dashboard admin di atas secara real-time.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RingkasanSistem;