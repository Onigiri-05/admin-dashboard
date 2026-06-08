import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Smartphone, Construction } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const UserPortal = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error(error);
      alert('Gagal keluar akun.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '700px',
          background: '#FFFFFF',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
        }}
      >
        <div
          style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: '#ECFCCB',
            color: '#65A30D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <Construction size={42} />
        </div>

        <h1
          style={{
            fontSize: '2rem',
            fontWeight: '800',
            color: '#0F172A',
            marginBottom: '1rem'
          }}
        >
          Portal Pengguna Sedang Dikembangkan
        </h1>

        <p
          style={{
            color: '#64748B',
            fontSize: '1rem',
            lineHeight: '1.8'
          }}
        >
          Selamat datang di BudJet.
          <br />
          <br />
          Versi web untuk pengguna saat ini masih dalam tahap pengembangan.
          Untuk mengakses seluruh fitur seperti pengelolaan anggaran,
          transaksi, riwayat keuangan, dan profil pengguna,
          silakan gunakan aplikasi mobile BudJet.
        </p>

        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#F8FAFC',
            borderRadius: '16px',
            border: '1px solid #E2E8F0'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#334155',
              fontWeight: '600'
            }}
          >
            <Smartphone size={20} />
            Gunakan Aplikasi Mobile BudJet
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            marginTop: '2rem',
            border: 'none',
            background: '#EF4444',
            color: '#FFFFFF',
            padding: '0.85rem 1.5rem',
            borderRadius: '12px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <LogOut size={18} />
          Keluar Akun
        </button>
      </div>
    </div>
  );
};

export default UserPortal;