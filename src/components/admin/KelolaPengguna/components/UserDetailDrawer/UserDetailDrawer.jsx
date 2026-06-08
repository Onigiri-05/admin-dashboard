import React, { useState, useEffect } from 'react';
import './UserDetailDrawer.css';

// Library untuk PDF (Sudah disesuaikan untuk Vite)
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';

import { db } from '../../../../../firebase';

import {
  X,
  Wallet,
  PiggyBank,
  Receipt,
  Grid3X3,
  Download,
  UserCheck,
  Calendar,
  Clock,
  Laptop,
  Utensils,
  Car,
  TrendingUp,
  ShoppingBag,
  Heart
} from 'lucide-react';

export default function UserDetailDrawer({ isOpen, user, onClose }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!user?.uid || !isOpen) return;

    const q = query(
      collection(db, 'users', user.uid, 'transactions'),
      orderBy('created_at', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setTransactions(data);
      },
      (error) => {
        console.warn(`Akses transaksi ditolak/error untuk UID: ${user.uid}. Menggunakan fallback kosong.`);
        setTransactions([]);
      }
    );

    return () => unsubscribe();
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // 1. FORMAT MATA UANG RUPIAH
  const formatRupiah = (value = 0) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // 2. FORMAT TIMESTAMPS FIREBASE
  const formatTanggal = (timestamp) => {
    if (!timestamp) return '-';
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    if (timestamp && timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
    return String(timestamp);
  };

  // 3. LOGIKA EXPORT PDF (STATUS TELAH DIHAPUS)
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Helper baris detail akun (Kiri)
    const addMetaRow = (label, value, y) => {
      doc.setFont("helvetica", "normal");
      doc.text(label, 14, y);
      doc.setFont("helvetica", "bold");
      doc.text(value, 48, y); // Jarak X disesuaikan agar lebih rapi merapat ke kiri
    };

    // --- HEADER UTAMA ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55); 
    doc.text("BUDJET - LAPORAN AKTIVITAS PENGGUNA", 14, 20);
    
    doc.setDrawColor(229, 231, 235); 
    doc.setLineWidth(0.5);
    doc.line(14, 24, 196, 24);

    // Metadata Laporan
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}`, 14, 30);
    doc.text(`UID: ${user.uid || '-'}`, 14, 35);

    // --- BAGIAN I: INFORMASI AKUN (Status Dihapus) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    doc.text("I. Detail Informasi Pengguna", 14, 48);
    doc.line(14, 50, 105, 50);

    doc.setFontSize(9.5);
    addMetaRow("Nama Pengguna", `: ${user.name || 'Tanpa Nama'}`, 57);
    addMetaRow("Email", `: ${user.email && user.email !== '-' ? user.email : 'Tidak ada email'}`, 63);
    addMetaRow("Peran (Role)", `: ${user.role || 'User'}`, 69); // Mengganti Role/Status menjadi Peran saja
    addMetaRow("Bergabung", `: ${formatTanggal(user.joinDate)}`, 75);

    // --- BAGIAN II: RINGKASAN FINANSIAL (SISI KANAN) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("II. Ringkasan Finansial", 115, 48);
    doc.line(115, 50, 196, 50);
    
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.text("Saldo Saat Ini", 115, 57);
    doc.setFont("helvetica", "bold");
    // Deteksi jika saldo minus, warna tetap merah/hijau menyesuaikan kondisi finansial asli
    if (user.balance < 0) {
      doc.setTextColor(220, 38, 38); // Merah jika minus
    } else {
      doc.setTextColor(22, 163, 74); // Hijau jika positif
    }
    doc.text(`: ${formatRupiah(user.balance)}`, 148, 57);

    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "normal");
    doc.text("Budget Bulanan", 115, 63);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235); 
    doc.text(`: ${formatRupiah(user.monthlyBudget)}`, 148, 63);

    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "normal");
    doc.text("Total Transaksi", 115, 69);
    doc.setFont("helvetica", "bold");
    doc.text(`: ${user.totalTransactions || transactions.length}`, 148, 69);

    doc.setFont("helvetica", "normal");
    doc.text("Kategori Aktif", 115, 75);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(147, 51, 234); 
    doc.text(`: ${user.activeCategories || '4 Kategori'}`, 148, 75);

    // Reset warna teks utama
    doc.setTextColor(17, 24, 39);

    // --- BAGIAN III: TABEL RIWAYAT TRANSAKSI ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("III. Riwayat Transaksi Terbaru", 14, 92);
    
    const tableData = transactions.length > 0 
      ? transactions.map(trx => [
          formatTanggal(trx.date || trx.created_at),
          trx.kategori || trx.title || '-',
          `-${formatRupiah(trx.amount || 0)}`
        ])
      : [['-', 'Tidak ada transaksi terbaru ditemukan untuk user ini.', '-']];

    autoTable(doc, {
      startY: 96,
      head: [['Tanggal', 'Kategori / Keterangan', 'Jumlah Pengeluaran']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [31, 41, 55], 
        fontSize: 9.5,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 9,
        textColor: [55, 65, 81]
      },
      columnStyles: {
        2: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] } 
      },
      margin: { left: 14, right: 14 }
    });

    // Footer Catatan Dokumen
    const finalY = doc.lastAutoTable?.finalY || 130;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("* Laporan eksport data ini dihasilkan secara otomatis oleh sistem Admin Dashboard BudJet.", 14, finalY + 12);

    // Download PDF berkas
    doc.save(`Laporan_BudJet_${user.name || 'User'}.pdf`);
  };

  // 4. MENENTUKAN IKON TRANSAKSI
  const getTransactionIcon = (category = '') => {
    if (!category) return <Heart size={16} className="trx-icon-default" />;
    
    const cat = category.toLowerCase();
    if (cat.includes('makan') || cat.includes('kuliner')) return <Utensils size={16} className="trx-icon-food" />;
    if (cat.includes('trans') || cat.includes('jalan') || cat.includes('bensin')) return <Car size={16} className="trx-icon-transport" />;
    if (cat.includes('tabung') || cat.includes('simpan') || cat.includes('invest')) return <TrendingUp size={16} className="trx-icon-save" />;
    if (cat.includes('belanja') || cat.includes('mall')) return <ShoppingBag size={16} className="trx-icon-shop" />;
    return <Heart size={16} className="trx-icon-default" />;
  };

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />

      <div className="user-drawer">
        {/* HEADER DRAWER */}
        <div className="drawer-header">
          <h2>Detail Aktivitas Pengguna</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="drawer-content">
          {/* PROFILE SECTION */}
          <div className="profile-section">
            <div className="profile-left">
              <div className="profile-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="profile-info">
                <div className="name-badge-row">
                  <h3>{user.name || 'Tanpa Nama'}</h3>
                  <span className={`role-badge ${user.role?.toLowerCase() || 'user'}`}>
                    {user.role || 'User'}
                  </span>
                </div>
                <p className="profile-email">
                  {user.email && user.email !== '-' ? user.email : 'Tidak ada email'}
                </p>
                <small className="profile-uid">
                  UID: {user.uid ? `${user.uid.substring(0, 5)}...${user.uid.substring(user.uid.length - 4)}` : '-'}
                </small>
              </div>
            </div>
            <button className="export-btn" onClick={handleExportPDF}>
              <Download size={14} />
              Export PDF
            </button>
          </div>

          {/* RINGKASAN DATA CARD */}
          <h4 className="section-title">Ringkasan</h4>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper wallet"><Wallet size={18} /></div>
              <div className="stat-info">
                <span>Saldo Saat Ini</span>
                <strong className="text-green">{formatRupiah(user.balance)}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper budget"><PiggyBank size={18} /></div>
              <div className="stat-info">
                <span>Budget Bulanan</span>
                <strong className="text-blue">{formatRupiah(user.monthlyBudget)}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper total-trx"><Receipt size={18} /></div>
              <div className="stat-info">
                <span>Total Transaksi</span>
                <strong className="text-orange">{user.totalTransactions || transactions.length}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper category"><Grid3X3 size={18} /></div>
              <div className="stat-info">
                <span>Kategori Aktif</span>
                <strong className="text-purple">{user.activeCategories || '4 Kategori'}</strong>
              </div>
            </div>
          </div>

          {/* INFORMASI DETAIL AKUN */}
          <h4 className="section-title">Informasi Akun</h4>
          <div className="info-section">
            <div className="info-row">
              <div className="info-label"><UserCheck size={16} /><span>Role</span></div>
              <span className="info-value text-muted">{user.role || 'User'}</span>
            </div>

            <div className="info-row">
              <div className="info-label"><UserCheck size={16} /><span>Status</span></div>
              <span className="info-value status-active-text">{user.status || 'Aktif'}</span>
            </div>

            <div className="info-row">
              <div className="info-label"><Calendar size={16} /><span>Bergabung</span></div>
              <span className="info-value">{formatTanggal(user.joinDate)}</span>
            </div>

            <div className="info-row">
              <div className="info-label"><Clock size={16} /><span>Terakhir Login</span></div>
              <span className="info-value text-green">{user.lastLogin || 'Baru saja'}</span>
            </div>

            <div className="info-row">
              <div className="info-label"><Clock size={16} /><span>Login Terakhir</span></div>
              <span className="info-value">{formatTanggal(user.lastLoginFull) || 'Baru saja'}</span>
            </div>
          </div>

          {/* DAFTAR TRANSAKSI TERAKHIR */}
          <div className="section-header-row">
            <h4 className="section-title">Transaksi Terakhir ({transactions.length})</h4>
            <a href="#lihat-semua" className="lihat-semua-link">Lihat Semua</a>
          </div>
          
          <div className="transactions-section">
            {transactions.length === 0 ? (
              <div className="transaction-item empty">
                <div className="transaction-title text-muted">Tidak ada transaksi terbaru</div>
              </div>
            ) : (
              transactions.map((trx) => (
                <div key={trx.id} className="transaction-item">
                  <div className="transaction-left-side">
                    <div className="trx-icon-box">
                      {getTransactionIcon(trx.kategori || trx.title)}
                    </div>
                    <span className="transaction-date">
                      {formatTanggal(trx.date || trx.created_at)}
                    </span>
                    <span className="transaction-category-name">
                      {trx.kategori || trx.title || '-'}
                    </span>
                  </div>
                  <div className="transaction-amount-side text-red">
                    -{formatRupiah(trx.amount || 0)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* STATUS AKTIVITAS */}
          <h4 className="section-title">Aktivitas Terakhir</h4>
          <div className="activity-section">
            <div className="activity-status">
              <span className="status-dot online"></span>
              <span className="text-green font-medium">Online {user.lastLogin || 'Baru saja'}</span>
            </div>
            <p className="activity-subtext">Login terakhir: {formatTanggal(user.lastLoginFull || user.created_at)}</p>
            <p className="activity-subtext">
              <Laptop size={12} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              Perangkat: {user.device || 'Android'} • IP: {user.ip || '114.10.20.15'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}