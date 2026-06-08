import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import {
  LayoutDashboard,
  Users,
  Database,
  MessageSquare,
  Cpu,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

import BudJetLogoIcon from '../assets/BudJetLogoIcon.svg';
import RingkasanSistem from '../components/admin/RingkasanSistem/RingkasanSistem';
import KelolaPengguna from '../components/admin/KelolaPengguna/KelolaPengguna';
import EksplorDatabase from '../components/admin/EksplorDatabase/EksplorDatabase';
import UlasanFeedback from '../components/admin/UlasanFeedback/UlasanFeedback';


import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');

  const [totalUsers, setTotalUsers] = useState(0);
  const [totalAnggaran, setTotalAnggaran] = useState(0);
  const [totalSaldo, setTotalSaldo] = useState(0);
  const [rataAnggaran, setRataAnggaran] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        setAdminEmail(user.email);

        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
          navigate('/login');
          return;
        }

        const userData = userDoc.data();

        if (userData.role !== 'admin') {
          navigate('/user-portal', { replace: true });
          return;
        }

        setCheckingAuth(false);
        
      } catch (error) {
        console.error(error);
        navigate('/login', { replace: true });
      }
    });

    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        let userCount = 0;
        let anggaranSum = 0;
        let saldoSum = 0;
        let userDenganBudget = 0;

        const BATAS_MAKSIMAL_ANGKA = 1000000000;

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();

          if (data) {
            userCount += 1;

            let budgetVal = Number(data.budgetBulanan) || 0;
            let balanceVal = Number(data.balance) || 0;

            if (
              budgetVal > BATAS_MAKSIMAL_ANGKA ||
              budgetVal < 0 ||
              isNaN(budgetVal)
            ) {
              budgetVal = 0;
            }

            if (
              balanceVal > BATAS_MAKSIMAL_ANGKA ||
              balanceVal < 0 ||
              isNaN(balanceVal)
            ) {
              balanceVal = 0;
            }

            anggaranSum += budgetVal;
            saldoSum += balanceVal;

            if (budgetVal > 0) {
              userDenganBudget += 1;
            }
          }
        });

        setTotalUsers(userCount);
        setTotalAnggaran(anggaranSum);
        setTotalSaldo(saldoSum);
        setRataAnggaran(
          userDenganBudget > 0
            ? anggaranSum / userDenganBudget
            : 0
        );

        setLoading(false);
      },
      (error) => {
        console.error('Firebase Error:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeUsers();
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      alert('Gagal keluar.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'ringkasan':
        return (
          <RingkasanSistem
            totalUsers={totalUsers}
            totalAnggaran={totalAnggaran}
            totalSaldo={totalSaldo}
            rataAnggaran={rataAnggaran}
            loading={loading}
          />
        );

      case 'pengguna':
        return <KelolaPengguna />;

      case 'database':
        return <EksplorDatabase />;

      case 'ulasan':
        return <UlasanFeedback />;

      case 'simulator':
        return <SimulatorSmart />;

      case 'pengaturan':
        return (
          <div
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '24px',
              border: '1px solid #E2E8F0'
            }}
          >
            <h2
              style={{
                margin: 0,
                color: '#0F172A',
                fontWeight: 800
              }}
            >
              Pengaturan Sistem Admin
            </h2>

            <p
              style={{
                color: '#64748B',
                marginTop: '0.5rem'
              }}
            >
              Fitur konfigurasi akun panel admin BudJet.
            </p>
          </div>
        );

      default:
        return (
          <RingkasanSistem
            totalUsers={totalUsers}
            totalAnggaran={totalAnggaran}
            totalSaldo={totalSaldo}
            rataAnggaran={rataAnggaran}
            loading={loading}
          />
        );
    }
  };
if (checkingAuth) {
  return null;
}
  return (
    <div className="dashboard-container">
      <button
        className="mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-brand">
          <div
            className="custom-brand-logo-container"
            style={{
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img
              src={BudJetLogoIcon}
              alt="BudJet Logo"
              style={{
                width: '35px',
                height: '35px',
                objectFit: 'contain'
              }}
            />
          </div>

          <h2>
            BudJet <span className="badge-admin-text">ADMIN</span>
          </h2>
        </div>

        <div className="admin-profile-section">
          <div className="admin-avatar">A</div>

          <div className="admin-info">
            <p className="admin-role">Administrator</p>
            <p className="admin-email">
              {adminEmail || 'awesome@gmail.com'}
            </p>
          </div>
        </div>

        <div className="sidebar-menu-wrapper">
          <nav className="sidebar-menu">
            <button
              className={`menu-item ${
                activeTab === 'ringkasan' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('ringkasan')}
            >
              <LayoutDashboard size={20} />
              <span>Ringkasan</span>
            </button>

            <button
              className={`menu-item ${
                activeTab === 'pengguna' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('pengguna')}
            >
              <Users size={20} />
              <span>Kelola Pengguna</span>
            </button>

            <button
              className={`menu-item ${
                activeTab === 'database' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('database')}
            >
              <Database size={20} />
              <span>Eksplor Database</span>
            </button>

            <button
              className={`menu-item ${
                activeTab === 'ulasan' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('ulasan')}
            >
              <MessageSquare size={20} />
              <span>Ulasan & Feedback</span>
            </button>


            <button
              className={`menu-item ${
                activeTab === 'pengaturan' ? 'active' : ''
              }`}
              onClick={() => setActiveTab('pengaturan')}
            >
              <Settings size={20} />
              <span>Pengaturan</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <span>Keluar Akun</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-body">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;