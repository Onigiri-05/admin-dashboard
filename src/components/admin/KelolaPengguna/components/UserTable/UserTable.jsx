import React from 'react';
import './UserTable.css';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../firebase'; 

import {
  Eye,
  Ban,
  Check,
  Shield,
  User
} from 'lucide-react';

export default function UserTable({
  users = [],
  onViewUser,
  refreshData // <-- TAMBAHKAN PARAMETER INI AGAR WEB OTOMATIS RE-RENDER SAAT DATA BERUBAH
}) {

  // ─── FUNGSI HELPER: MENGUBAH TIMESTAMP FIREBASE MENJADI "TIME AGO" ───
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Belum pernah login';
    
    let date;
    if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return 'Format waktu salah';

    const now = new Date();
    const secondsPast = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (secondsPast < 0) return 'Baru saja'; 

    if (secondsPast < 60) {
      return `${secondsPast} dtk yang lalu`;
    }
    const minutesPast = Math.floor(secondsPast / 60);
    if (minutesPast < 60) {
      return `${minutesPast} mnt yang lalu`;
    }
    const hoursPast = Math.floor(minutesPast / 60);
    if (hoursPast < 24) {
      return `${hoursPast} jam yang lalu`;
    }
    const daysPast = Math.floor(hoursPast / 24);
    if (daysPast < 30) {
      return `${daysPast} hari yang lalu`;
    }
    
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'numeric', year: 'numeric' });
  };

  // API FIRESTORE: TOGGLE STATUS BAN (offline <-> Banned)
  const handleToggleBan = async (uid, currentStatus) => {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    try {
      const newStatus = currentStatus?.toLowerCase() === 'banned' ? 'offline' : 'Banned'; 
      await updateDoc(userRef, { status: newStatus });
      
      // Panggil fungsi refresh data jika dilemparkan dari komponen induk
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Gagal mengupdate status ban:", error);
    }
  };

  // API FIRESTORE: TOGGLE ROLE JABATAN (ADMIN <-> USER)
  const handleToggleRole = async (uid, currentRole) => {
    if (!uid) return;
    const userRef = doc(db, 'users', uid);
    try {
      // Normalisasi pengecekan string role biar aman dari typo huruf besar/kecil
      const checkRole = currentRole?.toLowerCase() === 'admin' ? 'User' : 'Admin';
      await updateDoc(userRef, { role: checkRole });
      
      // PANGGIL REFRESH DATA DI SINI AGAR STATE DI WEB LANGSUNG BERUBAH DETIK ITU JUGA
      if (refreshData) refreshData();
    } catch (error) {
      console.error("Gagal mengupdate role:", error);
    }
  };

  // Potong UID panjang biar kolom gak melar ke kanan
  const formatUID = (uid) => {
    if (!uid) return 'UID: -';
    if (uid.length <= 12) return `UID: ${uid}`;
    return `UID: ${uid.substring(0, 5)}...${uid.substring(uid.length - 5)}`;
  };

  return (
    <div className="user-table-wrapper">
      <table className="user-table">
        <thead>
          <tr>
            <th className="col-pengguna">PENGGUNA</th>
            <th className="col-peran">PERAN</th>
            <th className="col-status">STATUS</th>
            <th className="col-bergabung">BERGABUNG</th>
            <th className="col-login">TERAKHIR LOGIN</th>
            <th className="col-aksi">AKSI</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => {
            const currentUid = user.uid || user.id;
            const isBanned = user.status?.toLowerCase() === 'banned';
            const isAdmin = user.role?.toLowerCase() === 'admin';
            
            const relativeLoginTime = formatTimeAgo(user.lastloginFull);
            const isRecentLogin = relativeLoginTime.includes('dtk') || 
                                  relativeLoginTime.includes('mnt') || 
                                  relativeLoginTime === 'Baru saja';

            return (
              <tr key={currentUid} style={{ opacity: isBanned ? 0.65 : 1 }}>
                <td className="col-pengguna">
                  <div className="user-cell">
                    <div className={`user-avatar col-${index % 5}`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="user-data">
                      <div className="user-name" title={user.name}>{user.name || 'Tanpa Nama'}</div>
                      <div className="user-email" title={user.email}>{user.email || '-'}</div>
                      <div className="user-uid">{formatUID(currentUid)}</div>
                    </div>
                  </div>
                </td>

                <td className="col-peran">
                  <span className={`role-badge ${user.role ? user.role.toLowerCase() : 'user'}`}>
                    {user.role || 'User'}
                  </span>
                </td>

                <td className="col-status">
                  <span className={`status-badge ${user.status ? user.status.toLowerCase() : 'offline'}`}>
                    <span className="status-dot"></span>
                    {user.status || 'offline'}
                  </span>
                </td>

                <td className="col-bergabung">
                  <div className="date-main-text">{user.joinDate || '-'}</div>
                  <div className="date-sub-text">{user.joinRelativeTime || 'Baru saja'}</div>
                </td>

                <td className="col-login">
                  <span className={isRecentLogin ? "login-text-active" : "login-text-muted"}>
                    {relativeLoginTime}
                  </span>
                </td>

                <td className="col-aksi">
                  <div className="action-buttons">
                    {/* Tombol 1: Lihat Detail */}
                    <button className="action-btn view" onClick={() => onViewUser(user)} title="Lihat Detail">
                      <Eye size={16} />
                    </button>

                    {/* Tombol 2: Toggle Ban */}
                    <button 
                      className={`action-btn ${isBanned ? 'unban-active' : 'ban'}`}
                      onClick={() => handleToggleBan(currentUid, user.status)}
                      title={isBanned ? "Aktifkan Akun" : "Ban Akun"}
                    >
                      {isBanned ? <Check size={16} style={{ color: '#2e7d32' }} /> : <Ban size={16} />}
                    </button>

                    {/* Tombol 3: Toggle Peran (Otomatis ganti fungsi & ikon secara real-time) */}
                    <button 
                      className={`action-btn ${isAdmin ? 'role-admin-active' : 'role-user-active'}`}
                      onClick={() => handleToggleRole(currentUid, user.role)}
                      title={isAdmin ? "Turunkan Jadi User" : "Jadikan Admin"}
                    >
                      {isAdmin ? <User size={16} /> : <Shield size={16} />}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}