import React from 'react';
import './UserStats.css';
import { Users, Shield, Radio, UserPlus } from 'lucide-react';

export default function UserStats({ statsData }) {
  // Mengambil data dari parent component jika ada, jika belum ada memakai nilai default mockup
  const totalUsers = statsData?.totalUsers || 272;
  const totalAdmin = statsData?.totalAdmin || 2;
  const onlineToday = statsData?.onlineToday || 15;
  const newUsers = statsData?.newUsers || 23;

  return (
    <div className="stats-container-top">
      {/* Card 1: Total Pengguna */}
      <div className="stat-card-top">
        <div className="stat-card-left">
          <div className="icon-badge-box blue">
            <Users size={20} />
          </div>
        </div>
        <div className="stat-card-right">
          <span className="stat-label-top">TOTAL PENGGUNA</span>
          <strong className="stat-number-top">{totalUsers}</strong>
          <span className="stat-subtext-top">Semua pengguna terdaftar</span>
        </div>
      </div>

      {/* Card 2: Total Admin */}
      <div className="stat-card-top">
        <div className="stat-card-left">
          <div className="icon-badge-box orange">
            <Shield size={20} />
          </div>
        </div>
        <div className="stat-card-right">
          <span className="stat-label-top">ADMIN</span>
          <strong className="stat-number-top">{totalAdmin}</strong>
          <span className="stat-subtext-top">Role administrator</span>
        </div>
      </div>

      {/* Card 3: Online Hari Ini */}
      <div className="stat-card-top">
        <div className="stat-card-left">
          <div className="icon-badge-box green">
            <Radio size={20} />
          </div>
        </div>
        <div className="stat-card-right">
          <span className="stat-label-top">ONLINE HARI INI</span>
          <strong className="stat-number-top">{onlineToday}</strong>
          <span className="stat-subtext-top">Pengguna aktif saat ini</span>
        </div>
      </div>

      {/* Card 4: User Baru */}
      <div className="stat-card-top">
        <div className="stat-card-left">
          <div className="icon-badge-box purple">
            <UserPlus size={20} />
          </div>
        </div>
        <div className="stat-card-right">
          <span className="stat-label-top">USER BARU (30 HARI)</span>
          <strong className="stat-number-top">{newUsers}</strong>
          <span className="stat-subtext-top">Bergabung bulan ini</span>
        </div>
      </div>
    </div>
  );
}