// src/components/Login.js
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // To differentiate between success and error messages

  const handleLogin = async (e) => {
    e.preventDefault();

    // Trim email and password to avoid leading/trailing spaces causing issues
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    console.log('Login attempt:', { email: trimmedEmail });

    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email: trimmedEmail,
        password: trimmedPassword,
      });

      console.log('Login successful:', response.data);

      // Store token and user details in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role); // Store role for future use
      localStorage.setItem('name', response.data.name); // Store user name for future use
      localStorage.setItem('userId', response.data.userId); // Store userId (applies to both admin and teacher)

      console.log('Role set in localStorage:', response.data.role); // Add this line to verify the role

      setMessage(t('loginSuccess'));
      setMessageType('success'); // Set message type to success
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Login failed:', error.response ? error.response.data : error.message);
      setMessage(t('loginFailed'));
      setMessageType('error'); // Set message type to error
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo-placeholder">{t('logo')}</div>
        <div className="user-icon">
          <i className="fa-regular fa-user"></i>
        </div>
        <input
          type="text"
          placeholder={t('emailPlaceholder')}
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder={t('passwordPlaceholder')}
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="login-button" onClick={handleLogin}>
          {t('loginButton')}
        </button>
        {message && <div className={`popup-message ${messageType}`}>{message}</div>}
      </div>
    </div>
  );
}

export default Login;








