import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import googleIcon from '../assets/Google Icon.svg';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Kata sandi tidak cocok.');
    }
    
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        name: 'Pengguna Baru',
        email: email,
        profilePic: '',
        budgetBulanan: 0,
        balance: 0,
        createdAt: serverTimestamp(),
        role: 'user'
      });
      
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email sudah digunakan.');
      } else {
        setError('Gagal mendaftar. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        name: user.displayName || 'Pengguna',
        email: user.email,
        profilePic: user.photoURL || '',
        budgetBulanan: 0,
        balance: 0,
        createdAt: serverTimestamp(),
        role: 'user'
      }, { merge: true });

      navigate('/dashboard');
    } catch (err) {
      setError('Gagal login dengan Google.');
    }
  };

  return (
    <AuthLayout>
      <h2 className="auth-title">Daftar</h2>
      <p className="auth-subtitle">Masukkan informasi anda untuk melanjutkan</p>
      
      {error && <div style={{ color: '#EF4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600' }}>{error}</div>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            className="form-control" 
            placeholder="Example@Gmail.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Buat Password</label>
          <div className="password-input-wrapper" style={{ position: 'relative' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              className="form-control" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingRight: '3rem' }}
            />
            <button 
              type="button" 
              className="password-toggle-btn" 
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div className="form-group">
          <label>Konfirmasi Sandi</label>
          <div className="password-input-wrapper" style={{ position: 'relative' }}>
            <input 
              type={showConfirmPassword ? "text" : "password"} 
              className="form-control" 
              placeholder="Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ paddingRight: '3rem' }}
            />
            <button 
              type="button" 
              className="password-toggle-btn" 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94A3B8',
                display: 'flex',
                alignItems: 'center',
                padding: 0
              }}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="terms-container">
          <input type="checkbox" required />
          <span>Saya menyetujui <b>Syarat & Ketentuan</b> serta <b>Kebijakan Privasi</b></span>
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Memproses...' : <>Daftar <LogIn size={20} /></>}
        </button>
      </form>

      <button onClick={handleGoogleLogin} className="btn btn-google">
        <img src={googleIcon} alt="Google" width="24" />
        Daftar Dengan Google
      </button>

      <p className="auth-footer">
        Sudah punya akun? <Link to="/login">Masuk</Link>
      </p>
    </AuthLayout>
  );
};

export default Register;