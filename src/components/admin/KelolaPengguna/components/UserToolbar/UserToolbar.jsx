import React from 'react';
import './UserToolbar.css';
import { Search, RotateCcw, Download, SlidersHorizontal } from 'lucide-react';

export default function UserToolbar({
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  selectedStatus,
  setSelectedStatus,
  onExportCSV,
  onExportPDF,
  filteredCount = 0
}) {
  
  // Cek apakah ada filter yang sedang aktif
  const isFiltering = searchTerm !== '' || selectedRole !== '' || selectedStatus !== '';

  const handleReset = () => {
    setSearchTerm('');
    setSelectedRole('');
    setSelectedStatus('');
  };

  return (
    <div className="user-toolbar-container">
      {/* Sisi Kiri: Pencarian Pintar */}
      <div className="search-box-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="Cari nama, email atau UID pengguna..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
            ×
          </button>
        )}
      </div>

      {/* Sisi Kanan: Grouping Filter & Aksi */}
      <div className="filter-actions-group">
        
        {/* Dropdown Filter Peran */}
        <div className="select-wrapper">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="filter-select"
          >
            <option value="">Semua Peran</option>
            <option value="Admin">Admin</option>
            <option value="User">User</option>
          </select>
        </div>

        {/* Dropdown Filter Status */}
        <div className="select-wrapper">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">Semua Status</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Banned">Banned</option>
          </select>
        </div>

        {/* Tombol Reset Filter - Muncul Smooth jika Admin melakukan filter */}
        {isFiltering && (
          <button className="btn-reset-filter" onClick={handleReset} title="Reset Semua Filter">
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        )}

        {/* Tombol Export CSV Premium */}
        <button className="btn-export-csv" onClick={onExportCSV} title="Unduh Laporan Excel/CSV">
          <Download size={16} />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  );
}