// Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TeacherManagement from './TeacherManagement'; 
import StudentManagement from './StudentManagement'; 
import RecordAttendance from './RecordAttendance'; 
import AttendanceReports from './AttendanceReports'; 
import Settings from './Settings';
import './Dashboard.css';
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState('home');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }

        await axios.get('http://localhost:5001/api/auth/validate', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const role = localStorage.getItem('role');
        const name = localStorage.getItem('name');
        setUserName(name);
        setUserRole(role);
      } catch (error) {
        console.error('Token validation failed:', error);
        handleLogout();
      }
    };

    validateToken();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    setTimeout(() => {
      navigate('/login');
    }, 200);
  };

  const renderContent = () => {
    switch (selectedView) {
      case 'attendance':
        return <RecordAttendance />;
      case 'reports':
        return <AttendanceReports />;
      case 'students':
        return <StudentManagement />;
      case 'settings':
        return <Settings />;
      case 'teachers':
        return userRole === 'admin' ? (
          <TeacherManagement />
        ) : (
          <div>{t('accessDeniedOnlyAdmins')}</div>
        );
      default:
        return <div>{t('welcomeToDashboard')}</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="logo">[School Logo Placeholder]</div>
        <ul>
          <li onClick={() => setSelectedView('home')}>{t('Dashboard')}</li>
          <li onClick={() => setSelectedView('attendance')}>{t('RecordAttendance')}</li>
          <li onClick={() => setSelectedView('reports')}>{t('AttendanceReports')}</li>
          <li onClick={() => setSelectedView('students')}>{t('StudentManagement')}</li>
          <li onClick={() => setSelectedView('settings')}>{t('Settings')}</li>
          {userRole === 'admin' && (
            <li onClick={() => setSelectedView('teachers')}>{t('TeacherManagement')}</li>
          )}
        </ul>
      </div>
      <div className="main-content">
        <header className="header">
          <h1>{t('WelcomeUser', { userName: userName || t('User') })}</h1>
          <p>{new Date().toDateString()}</p>
          <div className="header-icons">
            <i className="fas fa-bell"></i>
            <button className="logout-button" onClick={handleLogout}>
              {t('Logout')}
            </button>
          </div>
        </header>
        <div className="content">{renderContent()}</div>
      </div>
    </div>
  );
}

export default Dashboard;







