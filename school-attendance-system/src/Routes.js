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
import PrivateRoute from './components/PrivateRoute';

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
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } />
                    <Route path="/students" element={
                      <PrivateRoute>
                        <StudentManagement />
                      </PrivateRoute>
                    } />
                    <Route path="/teachers" element={
                      <PrivateRoute>
                        <TeacherManagement />
                      </PrivateRoute>
                    } />
                    <Route path="/record-attendance" element={
                      <PrivateRoute>
                        <RecordAttendance />
                      </PrivateRoute>
                    } />
                    <Route path="/reports" element={
                      <PrivateRoute>
                        <AttendanceReports />
                      </PrivateRoute>
                    } />
                    <Route path="/settings" element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    } />
                    <Route path="/admin" element={
                      <PrivateRoute>
                        <AdminManagement />
                      </PrivateRoute>
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

