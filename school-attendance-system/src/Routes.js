import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider, ThemeContext, themes } from './utils/themeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages and components
import App from './App'; // Homepage
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentManagement from './components/StudentManagement';
import TeacherManagement from './components/TeacherManagement';
import RecordAttendance from './components/RecordAttendance';
import AttendanceReports from './components/AttendanceReports';
import Settings from './components/Settings';
import AdminManagement from './components/AdminManagement';
import ResetPassword from './components/ResetPassword';
import { AuthProvider } from './contexts/AuthContext';

// Loading spinner component
const LoadingSpinner = () => (
  <Box 
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'background.default'
    }}
  >
    <CircularProgress />
  </Box>
);

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
      } catch (error) {
        console.warn('Could not access localStorage for authentication', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
};

// Main routes component
const AppRoutes = () => {
  const themeContext = useContext(ThemeContext);
  const theme = createTheme(themeContext?.theme === 'dark' ? themes.dark : themes.light);
  const responsiveTheme = responsiveFontSizes(theme);
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <MuiThemeProvider theme={responsiveTheme}>
          <CssBaseline />
          <AuthProvider>
            <Router>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                    
                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="/students" element={
                      <ProtectedRoute>
                        <StudentManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/teachers" element={
                      <ProtectedRoute>
                        <TeacherManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="/record-attendance" element={
                      <ProtectedRoute>
                        <RecordAttendance />
                      </ProtectedRoute>
                    } />
                    <Route path="/reports" element={
                      <ProtectedRoute>
                        <AttendanceReports />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                      <ProtectedRoute>
                        <AdminManagement />
                      </ProtectedRoute>
                    } />
                    
                    {/* Fallback route */}
                    <Route path="*" element={<Navigate to="/" replace />} />                  </Routes>
                </AnimatePresence>
              </LocalizationProvider>
            </Router>
          </AuthProvider>
        </MuiThemeProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default AppRoutes;

