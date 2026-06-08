import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

import { db } from '../../../firebase';

import UserHeader from './components/UserHeader/UserHeader';
import UserStats from './components/UserStats/UserStats';
import UserToolbar from './components/UserToolbar/UserToolbar';
import UserTable from './components/UserTable/UserTable';
import UserDetailDrawer from './components/UserDetailDrawer/UserDetailDrawer';

import './KelolaPengguna.css';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '-';
  const now = new Date();
  const date = new Date(timestamp.seconds * 1000);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 0 || diffInSeconds < 60) return 'Baru saja';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} menit yang lalu`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} jam yang lalu`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Kemarin';
  if (diffInDays < 7) return `${diffInDays} hari yang lalu`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} minggu yang lalu`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} bulan yang lalu`;
};

export default function KelolaPengguna() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const USERS_PER_PAGE = 5;

  useEffect(() => {
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const userData = snapshot.docs.map((doc) => {
        const data = doc.data();
        
        // NORMALISASI: Kecilkan semua string role dari database saat dibaca
        const dbRole = data.role ? String(data.role).toLowerCase() : 'user';

        return {
          id: doc.id,
          uid: doc.id,
          name: data.name || 'Pengguna',
          email: data.email || '-',
          role: dbRole === 'admin' ? 'Admin' : 'User',
          status: data.status || 'offline',
          rawCreatedAt: data.createdAt ? data.createdAt.seconds * 1000 : null,
          joinDate: data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleDateString('id-ID') : '-',
          joinRelativeTime: data.createdAt ? formatRelativeTime(data.createdAt) : '-',
          lastloginFull: data.lastloginFull || null,
          lastLogin: data.lastloginFull ? 'Ada Data' : 'Belum pernah login',
          balance: data.balance || 0,
          monthlyBudget: data.budgetBulanan || 0,
          totalTransactions: 0,
          activeCategories: data.categories?.length || 0,
          device: 'Android',
          ip: '-'
        };
      });
      setUsers(userData);
    }, (error) => {
      console.error("Gagal mengambil data secara realtime:", error);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === '' || user.role === selectedRole;
    const userStatusLower = user.status ? user.status.toLowerCase() : 'offline';
    const filterStatusLower = selectedStatus ? selectedStatus.toLowerCase() : '';
    const matchesStatus = selectedStatus === '' || userStatusLower === filterStatusLower;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalUsers = users.length;
  
  // PERBAIKAN FILTER STATISTIK CARD (Case-Insensitive):
  const totalAdmins = users.filter((user) => user.role.toLowerCase() === 'admin').length;
  const totalOnline = users.filter((user) => user.status?.toLowerCase() === 'aktif').length;

  const calculateNewUsers30Days = () => {
    const now = Date.now();
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    return users.filter(user => user.rawCreatedAt && (now - user.rawCreatedAt) <= thirtyDaysInMs).length;
  };

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) setCurrentPage(1);
  }, [searchTerm, selectedRole, selectedStatus, totalPages, currentPage]);

  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleExportCSV = () => {
    if (filteredUsers.length === 0) {
      alert("Tidak ada data pengguna yang cocok untuk diexport!");
      return;
    }
    const limitText = (text, maxChar) => (!text ? '-' : text.length <= maxChar ? text : `${text.substring(0, maxChar)}...`);
    const headers = ["UID", "Nama", "Email", "Peran", "Tanggal Bergabung"];
    const rows = filteredUsers.map(user => [`"${user.uid || '-'}"`, `"${limitText(user.name, 15)}"`, `"${limitText(user.email, 20)}"`, `"${user.role || 'User'}"`, `"${user.joinDate || '-'}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Pengguna_BudJet_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getVisiblePages = () => {
    const pages = [];
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(currentPage + 2, totalPages);
    if (currentPage <= 3) end = Math.min(5, totalPages);
    if (currentPage >= totalPages - 2) start = Math.max(totalPages - 4, 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="kelola-pengguna-page">
      <UserHeader />
      <UserStats totalUsers={totalUsers} totalAdmins={totalAdmins} onlineToday={totalOnline} newUsers={calculateNewUsers30Days()} />
      <UserToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedRole={selectedRole} setSelectedRole={setSelectedRole} selectedStatus={selectedStatus} setSelectedStatus={setSelectedStatus} onExportCSV={handleExportCSV} />
      <UserTable users={currentUsers} onViewUser={handleViewUser} />

      <div className="pagination-footer-container">
        <div className="pagination-info-text">
          Menampilkan {filteredUsers.length === 0 ? 0 : indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} dari {filteredUsers.length} pengguna
        </div>
        <div className="pagination">
          <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>←</button>
          {currentPage > 3 && (<><button className="pagination-btn" onClick={() => setCurrentPage(1)}>1</button><span className="pagination-dots">...</span></>)}
          {getVisiblePages().map((page) => (<button key={page} className={`${currentPage === page ? 'active-page' : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>))}
          {currentPage < totalPages - 2 && (<><span className="pagination-dots">...</span><button className="pagination-btn" onClick={() => setCurrentPage(totalPages)}> {totalPages} </button></>)}
          <button className="pagination-btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>→</button>
        </div>
      </div>
      <UserDetailDrawer user={selectedUser} isOpen={drawerOpen} onClose={handleCloseDrawer} />
    </div>
  );
}