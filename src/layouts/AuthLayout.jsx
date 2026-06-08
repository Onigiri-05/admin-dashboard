import React from 'react';
import illustration from '../assets/Student successfully managing finances.png';
import logo from '../assets/BudJetLogoIcon.svg';
import '../Auth.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="auth-form-side">
        <div className="auth-card">
          {children}
        </div>
      </div>
      <div className="auth-image-side">
        <div className="logo-container">
          <img src={logo} alt="BudJet Logo" className="logo-img" />
        </div>
        <img src={illustration} alt="Illustration" className="illustration-img" />
        <div className="caption-card">
          <h2>Budgeting untuk <br/><span className="highlight">Mahasiswa</span></h2>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;