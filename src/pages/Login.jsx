import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import googleIcon from '../assets/Google Icon.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ─── PERBAIKAN LOGIKA REDIRECT BERDASARKAN ROLE (CASE-INSENSITIVE) ───
  const redirectUserByRole = async (user) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError('Data pengguna tidak ditemukan.');
        return;
      }

      const userData = userSnap.data();

      // Mengubah string role dari database menjadi huruf kecil semua agar aman dari masalah kapitalisasi ('Admin' / 'admin')
      const userRoleNormalized = userData.role ? String(userData.role).toLowerCase() : 'user';

      if (userRoleNormalized === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/user-portal');
      }
    } catch (err) {
      console.error(err);
      setError('Gagal memeriksa role pengguna.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      await redirectUserByRole(userCredential.user);
    } catch (err) {
      setError('Email atau kata sandi salah.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await redirectUserByRole(result.user);
    } catch (err) {
      setError('Gagal login dengan Google.');
    }
  };

  return (
    <AuthLayout>
      <h2 className="auth-title">Masuk</h2>

      <p className="auth-subtitle">
        Selamat datang kembali, silahkan masukkan identitas anda
      </p>

      {error && (
        <div
          style={{
            color: '#EF4444',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleLogin}>
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
          <label>Kata Sandi</label>
          <div
            className="password-input-wrapper"
            style={{ position: 'relative' }}
          >
            <input
              type={showPassword ? 'text' : 'password'}
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
              {showPassword ? (
                <EyeOff size={20} />
              ) : (
                <Eye size={20} />
              )}
            </button>
          </div>

          <div style={{ textAlign: 'right', marginTop: '0.75rem' }}>
            <Link
              to="/forgot-password"
              style={{
                fontSize: '0.75rem',
                color: '#94A3B8',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Lupa Kata Sandi?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ marginTop: '1rem' }}
        >
          {loading ? (
            'Memproses...'
          ) : (
            <>
              Masuk <LogIn size={20} />
            </>
          )}
        </button>
      </form>

      <button onClick={handleGoogleLogin} className="btn btn-google">
        <img src={googleIcon} alt="Google" width="24" />
        Masuk Dengan Google
      </button>

      <p className="auth-footer">
        Belum punya akun? <Link to="/register">Daftar</Link>
      </p>
    </AuthLayout>
  );
};

export default Login;