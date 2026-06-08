import React from 'react';
import './UserHeader.css';

export default function UserHeader() {
  return (
    <div className="user-header">

      <div>

        <h1>Daftar Pengguna</h1>

        <p>
          Panel Kontrol Utama BudJet • Sinkronisasi Database Dua Arah Aktif
        </p>

      </div>

      <div className="database-status">

        <span className="db-dot"></span>

        Database Terhubung

      </div>

    </div>
  );
}