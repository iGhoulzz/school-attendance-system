import React, { useEffect, useState, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ThemeProvider, ThemeContext } from './utils/themeContext';
import ErrorBoundary from './components/ErrorBoundary';

// Pages and components
import App from './App'; // Homepage
import Login from './components/Login'; // Login page
import Dashboard from './components/Dashboard'; // Dashboard page
import StudentManagement from './components/StudentManagement';
import TeacherManagement from './components/TeacherManagement';
import RecordAttendance from './components/RecordAttendance';
import AttendanceReports from './components/AttendanceReports';
import Settings from './components/Settings';
import AdminManagement from './components/AdminManagement';
import ResetPassword from './components/ResetPassword';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const location = useLocation();
  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = () => {
      try {
        if (typeof window !== 'undefined') {
          const token = window.localStorage.getItem('token');
          setIsAuthenticated(!!token);
        }
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
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
  },
  in: {
    opacity: 1,
  },
  out: {
    opacity: 0,
  },
};

// Page transition options
const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const PageLayout = ({ children }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        style={{ width: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const AppRoutes = () => {
  // Get current theme mode from context
  const themeContext = useContext(ThemeContext);
  
  // Create Material UI theme based on current mode
  let muiTheme = createTheme({
    palette: {
      mode: themeContext?.theme === 'dark' ? 'dark' : 'light',
      primary: {
        main: themeContext?.theme === 'dark' ? '#4d7dff' : '#2963ff',
      },
      secondary: {
        main: themeContext?.theme === 'dark' ? '#2fe0bd' : '#26cfac',
      },
      background: {
        default: themeContext?.theme === 'dark' ? '#1a1d21' : '#f5f7fa',
        paper: themeContext?.theme === 'dark' ? '#252a34' : '#ffffff',
      },
      text: {
        primary: themeContext?.theme === 'dark' ? '#e6e6e6' : '#333333',
        secondary: themeContext?.theme === 'dark' ? '#b3b3b3' : '#666666',
      },
    },
    typography: {
      fontFamily: ['Inter', 'sans-serif'].join(','),
      h1: {
        fontFamily: ['Lexend', 'sans-serif'].join(','),
      },
      h2: {
        fontFamily: ['Lexend', 'sans-serif'].join(','),
      },
      h3: {
        fontFamily: ['Lexend', 'sans-serif'].join(','),
      },
      h4: {
        fontFamily: ['Lexend', 'sans-serif'].join(','),
      },
      h5: {
        fontFamily: ['Lexend', 'sans-serif'].join(','),
      },
      h6: {
        fontFamily: ['Lexend', 'sans-serif'].join(','),
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
          },
        },
      },
    },
  });

  muiTheme = responsiveFontSizes(muiTheme);
  // Main app routing component
  return (
    <ThemeProvider>
      <MuiThemeProvider theme={muiTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <ErrorBoundary>
            <Router>
              <AnimatePresence mode="wait">
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/students" element={<StudentManagement />} />
                  <Route path="/teachers" element={<TeacherManagement />} />
                  <Route path="/attendance" element={<RecordAttendance />} />
                  <Route path="/reports" element={<AttendanceReports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route 
                    path="/admin-management" 
                    element={
                      <ProtectedRoute>
                        <AdminManagement />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                </Routes>
              </AnimatePresence>
            </Router>
          </ErrorBoundary>
        </LocalizationProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default AppRoutes;

