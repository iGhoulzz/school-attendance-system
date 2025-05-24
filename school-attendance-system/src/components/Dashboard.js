// Dashboard.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify'; // Add DOMPurify for sanitizing user content
import storageUtils from '../utils/storageUtils';
import { styled } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../utils/themeContext';
import apiService from '../services/apiService';
import { logout } from '../services/apiServiceWrapper';
import logger from '../utils/logger'; // Import secure logger
import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Box,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AttendanceIcon from '@mui/icons-material/Assignment';
import ReportsIcon from '@mui/icons-material/BarChart';
import PeopleIcon from '@mui/icons-material/People';
import TeacherIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';

// Components
import TeacherManagement from './TeacherManagement';
import StudentManagement from './StudentManagement';
import RecordAttendance from './RecordAttendance';
import AttendanceReports from './AttendanceReports';
import Settings from './Settings';
import AdminManagement from './AdminManagement';

// Styled components
const DashboardRoot = styled('div', {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => `
  display: flex;
  min-height: 100vh;
  background: ${themeMode?.colors?.background?.main || '#f5f5f5'};
`);

const MainContent = styled(Box, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => `
  flex-grow: 1;
  min-height: 100vh;
  padding: 24px 16px;
  margin-top: 64px;
  background: ${themeMode?.colors?.background?.gradient || 'linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)'};
  position: relative;
  z-index: 1;
  @media (min-width: 600px) {
    padding: 24px;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;    width: 100%;
    height: 100%;
    background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='${themeMode?.theme === 'light' ? '%232963ff' : '%234d7dff'}' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
    z-index: -1;
  }
`);

const StyledAppBar = styled(AppBar, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => `
  z-index: 1300;  
  background: ${themeMode?.colors?.appBar?.background || 'rgba(255, 255, 255, 0.85)'};
  backdrop-filter: blur(10px);
  color: ${themeMode?.colors?.appBar?.text || 'inherit'};
  box-shadow: ${themeMode?.theme === 'light' ? '0 4px 20px rgba(0, 0, 0, 0.05)' : '0 4px 20px rgba(0, 0, 0, 0.15)'};

  @media (max-width: 600px) {
    .MuiToolbar-root {
      padding-left: 8px;
      padding-right: 8px;
    }
  }
`);

const StyledDrawer = styled(Drawer, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => `
  width: 280px;
  flex-shrink: 0;

  .MuiDrawer-paper {    
    width: 280px;
    background: ${themeMode?.colors?.sidebar?.background || '#1a2035'};
    color: ${themeMode?.colors?.sidebar?.text || '#ffffff'};
    border-radius: 0 16px 16px 0;
    padding-top: 16px;
    box-shadow: ${themeMode?.theme === 'light' ? '4px 0 15px rgba(0, 0, 0, 0.05)' : '4px 0 15px rgba(0, 0, 0, 0.2)'};
    overflow-x: hidden;
    overflow-y: auto;
  }
`);

const DrawerHeader = styled('div')`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  margin-bottom: 16px;
`;

const Logo = styled(Box)`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
  padding: 0 16px;
`;

const UserInfo = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const UserAvatar = styled(Avatar)`
  width: 80px;
  height: 80px;
  margin-bottom: 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background-color: #26cfac;
  font-size: 1.5rem;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
`;

const StyledListItem = styled(ListItem, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => `
  margin: 8px 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  &.active {
    background: ${themeMode?.colors?.sidebar?.itemActive || 'rgba(255, 255, 255, 0.1)'};
    box-shadow: ${themeMode?.theme === 'light' ? '0 4px 15px rgba(0, 0, 0, 0.1)' : '0 4px 15px rgba(0, 0, 0, 0.2)'};
  }

  &:hover {
    background: ${themeMode?.colors?.sidebar?.itemHover || 'rgba(255, 255, 255, 0.07)'};
    transform: translateX(5px);
  }
`);

const ContentHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
`;

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#26cfac',
    color: '#fff',
    boxShadow: '0 0 0 1px #fff',
    fontWeight: 'bold',
    minWidth: '14px',
    height: '14px',
    padding: '0 2px',
    fontSize: '0.55rem',
    right: -1,
    top: 1
  },
}));

const ContentCard = styled(motion.div, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => `
  background: ${themeMode?.colors?.background?.contentCard || '#ffffff'};
  border-radius: 16px;
  box-shadow: ${themeMode?.colors?.card?.shadow || '0 4px 12px rgba(0, 0, 0, 0.05)'};
  padding: 24px;
  overflow: hidden;
  height: calc(100vh - 180px);
  overflow-y: auto;
  position: relative;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${themeMode?.colors?.card?.shadowHover || '0 8px 24px rgba(0, 0, 0, 0.1)'};
  }

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: ${themeMode?.theme === 'light' ? '#f1f1f1' : '#2a2e36'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${themeMode?.theme === 'light' ? '#d1d1d1' : '#4a4e57'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${themeMode?.theme === 'light' ? '#c1c1c1' : '#5a5e67'};
  }
`);

// Dashboard component
function Dashboard() {  const { t } = useTranslation();
  const muiTheme = useTheme();
  const themeMode = useContext(ThemeContext);
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [selectedView, setSelectedView] = useState('home');
  
  // Initialize user role from localStorage directly if available
  const initRole = (() => {
    try {
      // First check direct role storage
      const directRole = localStorage.getItem('role');
      if (directRole) {
        logger.info("Initializing Dashboard with role from localStorage:", directRole);
        return directRole;
      }
      
      // Then try to extract from user object
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user && user.role) {
          // Store it directly for future access
          localStorage.setItem('role', user.role);
          logger.info("Initializing Dashboard with role from user object:", user.role);
          return user.role;
        }
      }
      // Default to empty if not found
      return '';
    } catch (e) {
      logger.error("Error initializing user role:", e);
      return '';
    }
  })();
  
  const [userRole, setUserRole] = useState(initRole);
  const [userName, setUserName] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    todayAttendance: {
      percentage: 0,
      present: 0,
      absent: 0
    },
    recentActivity: []
  });  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = useState(false);  
    const navigate = useNavigate();
  
  // Handle logout by clearing storage and navigating to login
  const handleLogout = useCallback(async () => {
    try {
      logger.info('[DASHBOARD] User initiated logout process');
      
      // Call the logout function from apiServiceWrapper
      await logout();
      
      logger.info('[DASHBOARD] API logout complete, clearing local auth data');
      // Clear local storage data
      storageUtils.clearAuth();
      
      logger.info('[DASHBOARD] Navigating to login page');
      navigate('/login');
    } catch (error) {
      logger.error('[DASHBOARD] Error during logout process:', error);
        // Attempt to clear auth and redirect even if there was an error
      storageUtils.clearAuth();
      navigate('/login');
    }
  }, [navigate]);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if there's been a recent attendance submission
      const lastSubmission = localStorage.getItem('lastAttendanceSubmission');      const shouldForceRefresh = lastSubmission && 
        (Date.now() - parseInt(lastSubmission) < 300000); // Within 5 minutes
        
      if (shouldForceRefresh) {
        logger.debug('Recent attendance submission detected, forcing dashboard refresh');
      }

      // Add cache-busting parameter if needed
      const endpoint = shouldForceRefresh 
        ? `/attendance/dashboard-stats?refresh=${Date.now()}` 
        : '/attendance/dashboard-stats';
      
      const response = await apiService.get(endpoint);
      setDashboardStats(response);
      
      // Clear the flag after successful refresh
      if (shouldForceRefresh) {
        localStorage.removeItem('lastAttendanceSubmission');
      }
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      // If unauthorized, log out
      if (error.response && error.response.status === 401) {
        handleLogout();
      }    } finally {
      setLoading(false);
    }
  }, [handleLogout]);
  
  const fetchNotifications = useCallback(async () => {
    try {
      const response = await apiService.get('/notifications');
      setNotifications(response);
      
      // Refresh user information when notifications are fetched
      const currentName = storageUtils.getName();
      if (currentName && currentName !== userName) {
        logger.info('Updating username from notifications fetch:', currentName);
        setUserName(currentName);
      }
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      
      // If unauthorized, log out
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  }, [handleLogout, userName]);
  
  const clearAllNotifications = useCallback(async () => {
    try {
      await apiService.delete('/notifications/clear-all');
      setNotifications([]);
    } catch (error) {
      logger.error('Error clearing notifications:', error);
      
      // If unauthorized, log out
      if (error.response && error.response.status === 401) {
        handleLogout();
      }
    }
  }, [handleLogout]);
  
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  const handleNotificationClick = async (notification) => {
    try {
      // Set selected notification and open dialog
      setSelectedNotification(notification);
      setNotificationDialogOpen(true);
      
      // Mark notification as read
      await apiService.post(`/notifications/${notification.id}/read`, {});
      
      // Update notifications list
      fetchNotifications();
    } catch (error) {
      logger.error('Error handling notification:', error);
      // Add user-friendly error handling
      if (error.response) {
        // Handle specific HTTP error responses
        if (error.response.status === 401) {
          handleLogout(); // Unauthorized - log out
        }
      }
    }
  };
  
  const handleDialogClose = () => {
    setNotificationDialogOpen(false);
  };
    const handleNotificationAction = (type) => {
    // Handle navigation based on notification type
    if (type === 'attendance') {
      setSelectedView('attendance');
    } else if (type === 'admin') {
      setSelectedView('admin');
    }
    
    handleNotificationsClose();
    setNotificationDialogOpen(false);
  };
  
  useEffect(() => {
    // Only fetch stats when the view is 'home'
    if (selectedView === 'home') {
      // Set up a timer to avoid multiple rapid fetches
      const fetchTimer = setTimeout(() => {
        fetchDashboardStats();
      }, 300);
      
      // Set up periodic refresh at reasonable interval (30 seconds)
      const refreshInterval = setInterval(() => {
        if (selectedView === 'home' && document.visibilityState === 'visible') {
          fetchDashboardStats();
        }
      }, 30000);
      
      // Cleanup
      return () => {
        clearTimeout(fetchTimer);
        clearInterval(refreshInterval);
      };
    }
  }, [selectedView, fetchDashboardStats]);  useEffect(() => {
    const validateToken = async () => {
      try {
        // Use apiService to validate the token
        await apiService.get('/auth/validate');
        
        // Try to get the role from localStorage directly first
        let role = localStorage.getItem('role');
        
        // If not found, try getting it from user object
        if (!role) {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            try {
              const user = JSON.parse(userStr);
              if (user && user.role) {
                role = user.role;
                // Store it directly for future use
                localStorage.setItem('role', role);
              }
            } catch (e) {
              logger.error('Error parsing user data:', e);
            }
          }
        }
        
        const name = storageUtils.getName() || '';
        logger.debug('[DASHBOARD] Retrieved user name:', name, 'using storageUtils.getName()');
        logger.info('Dashboard found user name:', name);
        logger.info('Dashboard found user role:', role);
        setUserName(name);
        setUserRole(role);
      } catch (error) {
        // If token validation fails, redirect to login
        logger.error('Token validation failed:', error);
        handleLogout();
      }
    };
    validateToken();
    
    // Handle responsive drawer
    const handleResize = () => {
      setDrawerOpen(!window.matchMedia('(max-width: 960px)').matches);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigate, handleLogout]);

  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const menuItems = [
    { text: t('Dashboard'), icon: <DashboardIcon />, view: 'home', role: ['admin', 'teacher'] },
    { text: t('RecordAttendance'), icon: <AttendanceIcon />, view: 'attendance', role: ['admin', 'teacher'] },
    { text: t('AttendanceReports'), icon: <ReportsIcon />, view: 'reports', role: ['admin', 'teacher'] },
    { text: t('StudentManagement'), icon: <PeopleIcon />, view: 'students', role: ['admin', 'teacher'] },
    { text: t('TeacherManagement'), icon: <TeacherIcon />, view: 'teachers', role: ['admin'] },
    { text: t('AdminManagement'), icon: <AdminPanelSettingsIcon />, view: 'adminManagement', role: ['admin'] },    { text: t('Settings'), icon: <SettingsIcon />, view: 'settings', role: ['admin', 'teacher'] },
  ];
  
  const renderRecentActivity = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress size={24} />
        </Box>
      );
    }      if (!dashboardStats.recentActivity || dashboardStats.recentActivity.length === 0) {
      return (
        <Box sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: themeMode?.theme === 'light' ? '#f8f9fa' : '#1e222a' }}>
          <Typography variant="body1" color="text.secondary">
            {t('noRecentActivity')}
          </Typography>
        </Box>
      );
    }    return dashboardStats.recentActivity.map((activity, index) => (
      <Box key={index} sx={{ p: 2, borderRadius: 2, mb: 2, bgcolor: themeMode?.theme === 'light' ? '#f8f9fa' : '#1e222a' }}>
        <Typography variant="body1">
          {t('attendanceRecordActivity', {
            grade: activity.grade,
            teacher: activity.teacher,
            date: new Date(activity.date).toLocaleDateString(),
            present: activity.presentCount,
            absent: activity.absentCount
          })}
        </Typography>
      </Box>    ));
  };

  const renderContent = () => {
    logger.debug("RENDER DEBUG:", {
    view: selectedView, 
    dataLoaded: !!dashboardStats,
    userRole,
    themeModeExists: !!themeMode,
    localStorageUserRole: localStorage.getItem('role'),
    localStorageUserObj: localStorage.getItem('user')
  });
  
  // If userRole is missing but we found it in localStorage, update state
  if (!userRole && localStorage.getItem('role')) {    setUserRole(localStorage.getItem('role'));
    logger.info("Updated userRole from localStorage:", localStorage.getItem('role'));
  }
  
  switch (selectedView) {
      case 'attendance':
        return <RecordAttendance themeMode={themeMode} />;
      case 'reports':
        return <AttendanceReports />;
      case 'students':
        return <StudentManagement />;
      case 'settings':
        return <Settings />;
      case 'test':
        // Simple test view that avoids other components for isolation testing
        return (
          <Box sx={{ padding: "20px", border: "2px solid red", borderRadius: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>Dashboard Test View</Typography>            <Typography variant="body1">Selected view: {selectedView}</Typography>
            <Typography variant="body1">User role: {userRole}</Typography>
            <Typography variant="body1">Theme: {themeMode?.theme || 'undefined'}</Typography>
            <Box sx={{ mt: 3, p: 2, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
              <Typography variant="subtitle2">Dashboard stats:</Typography>
              <pre style={{ overflow: 'auto', maxHeight: '300px' }}>
                {JSON.stringify(dashboardStats, null, 2)}
              </pre>
            </Box>
          </Box>
        );
      case 'teachers':
        return userRole === 'admin' ? (
          <TeacherManagement />
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              {t('accessDeniedOnlyAdmins')}
            </Typography>
          </Box>
        );
      case 'adminManagement':
        return userRole === 'admin' ? (
          <AdminManagement />
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h5" color="error">
              {t('accessDeniedOnlyAdmins')}
            </Typography>
          </Box>
        );
      default:
        return (
          <Box>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
              {t('welcomeToDashboard')}
            </Typography>
            
            {/* Temporary test element to verify rendering */}
            <Box sx={{ p: 2, mb: 3, border: '2px solid #26cfac', borderRadius: 2, bgcolor: 'rgba(38, 207, 172, 0.05)' }}>
              <Typography variant="h6" sx={{ color: '#26cfac', fontWeight: 'bold' }}>
                Dashboard Debug Info
              </Typography>              <Typography variant="body2">
                Selected view: {selectedView}<br/>
                User role: {userRole}<br/>
                Theme: {themeMode?.theme || 'undefined'}<br/>
                Stats loaded: {dashboardStats ? 'Yes' : 'No'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >              <Box sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  background: themeMode?.colors?.card?.statCard1 || 'linear-gradient(135deg, #2963ff 0%, #27b6ff 100%)',
                  color: 'white',
                  boxShadow: '0 8px 16px rgba(41, 99, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(41, 99, 255, 0.25)'
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {t('todayAttendance')}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {loading ? '...' : `${dashboardStats.todayAttendance.percentage}%`}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    {t('presentToday', { count: dashboardStats.todayAttendance.present })}
                  </Typography>
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >                <Box sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  background: themeMode?.colors?.card?.statCard2 || 'linear-gradient(135deg, #26cfac 0%, #26b0cf 100%)',
                  color: 'white',
                  boxShadow: '0 8px 16px rgba(38, 207, 172, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(38, 207, 172, 0.25)'
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {t('totalStudents')}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {loading ? '...' : dashboardStats.totalStudents}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    {t('activeEnrollment')}
                  </Typography>
                </Box>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >                <Box sx={{ 
                  p: 3, 
                  borderRadius: 4, 
                  background: themeMode?.colors?.card?.statCard3 || 'linear-gradient(135deg, #ff9838 0%, #ff6a38 100%)',
                  color: 'white',
                  boxShadow: '0 8px 16px rgba(255, 152, 56, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(255, 152, 56, 0.25)'
                  }
                }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {t('absentToday')}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    {loading ? '...' : dashboardStats.todayAttendance.absent}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8, mt: 1 }}>
                    {t('absentCount')}
                  </Typography>
                </Box>
              </motion.div>
            </Box>            <Box sx={{ 
              mt: 4, 
              p: 3, 
              borderRadius: 4, 
              background: themeMode?.colors?.background?.contentCard || '#ffffff', 
              boxShadow: themeMode?.colors?.card?.shadow || '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: themeMode?.colors?.card?.shadowHover || '0 8px 24px rgba(0, 0, 0, 0.1)',
                transform: 'translateY(-3px)'
              }
            }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                {t('recentActivity')}
              </Typography>
              {renderRecentActivity()}
            </Box>
          </Box>
        );
    }
  };
  // Add a fallback UI for error cases
  if (!dashboardStats || Object.keys(dashboardStats).length === 0) {
    logger.debug("FALLBACK UI: Dashboard stats not loaded", { dashboardStats });
    
    return (
      <DashboardRoot themeMode={themeMode}>
        <StyledAppBar position="fixed" themeMode={themeMode}>
          <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: '46px' } }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              edge="start"
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              School Attendance System
            </Typography>
          </Toolbar>
        </StyledAppBar>        <Box sx={{ 
          padding: 3, 
          marginTop: 8, 
          display: 'flex',
          flexDirection: 'column', 
          alignItems: 'center',
          color: themeMode?.theme === 'dark' ? 'white' : 'inherit' 
        }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Loading Dashboard...</Typography>
          <CircularProgress color="primary" />
        </Box>
      </DashboardRoot>
    );
  }
  // Add a try-catch wrapper around the main return for error logging
  try {
    return (
      <DashboardRoot themeMode={themeMode}>
      <StyledAppBar position="fixed" themeMode={themeMode}>
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          minHeight: { xs: '46px' },
          padding: { xs: '0 4px', sm: '0 10px' },
          '& .MuiIconButton-root': {
            margin: { xs: '0 1px', sm: '0 2px' }
          },
          overflow: 'hidden'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              color="inherit" 
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ 
                mr: 1.5,
                borderRadius: '6px',
                padding: '5px',
                minWidth: '28px',
                minHeight: '28px',
                width: '28px',
                height: '28px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'rgba(41, 99, 255, 0.1)',
                  boxShadow: '0 1px 3px rgba(41, 99, 255, 0.1)',
                  transform: 'translateY(-1px)'
                }
              }}
            >
              <MenuIcon fontSize="small" sx={{ fontSize: '1.1rem' }} />
            </IconButton>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                fontSize: { xs: '0.9rem', sm: '1.1rem' },
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: { xs: '120px', sm: '180px', md: '230px' }
              }}
            >
              {selectedView === 'home' ? t('Dashboard') : t(selectedView.charAt(0).toUpperCase() + selectedView.slice(1))}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 0, sm: 0 }, maxWidth: '50%' }}>
            <Box sx={{ display: 'flex', mr: 0.5 }}>
              <Tooltip title={t('notifications')}>
                <span>
                  <IconButton 
                    size="small"
                    color="inherit" 
                    onClick={handleNotificationsOpen}
                    disabled={notifications.length === 0}
                    sx={{
                      background: Boolean(notifications.length) ? 'rgba(38, 207, 172, 0.05)' : 'transparent',
                      borderRadius: '6px',
                      padding: '5px',
                      minWidth: '32px',
                      minHeight: '32px',
                      width: '32px',
                      height: '32px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: Boolean(notifications.length) ? 'rgba(38, 207, 172, 0.1)' : 'rgba(0,0,0,0.04)',
                        boxShadow: '0 1px 3px rgba(38, 207, 172, 0.1)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <StyledBadge badgeContent={notifications.length} color="primary">
                      <NotificationsIcon fontSize="small" sx={{ fontSize: '1.3rem' }} />
                    </StyledBadge>
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            <Box sx={{ display: 'flex', mr: 0.5 }}>
              <Tooltip title={t('logout')}>
                <span>
                  <IconButton 
                    size="small"
                    color="inherit" 
                    onClick={handleLogout}
                    sx={{
                      borderRadius: '6px',
                      padding: '5px',
                      minWidth: '32px',
                      minHeight: '32px',
                      width: '32px',
                      height: '32px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(239, 83, 80, 0.1)',
                        boxShadow: '0 1px 3px rgba(239, 83, 80, 0.1)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    <LogoutIcon fontSize="small" sx={{ fontSize: '1.3rem' }} color="error" />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
            <Menu
              anchorEl={notificationsAnchorEl}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}                  slotProps={{
                paper: {
                  sx: { 
                    width: { xs: 280, sm: 320 }, 
                    maxHeight: 350, 
                    mt: 1, 
                    borderRadius: 1.5,
                    boxShadow: themeMode?.theme === 'light' ? '0 4px 12px rgba(0,0,0,0.08)' : '0 4px 12px rgba(0,0,0,0.3)',
                    overflow: 'hidden',
                    backgroundColor: themeMode?.theme === 'dark' ? themeMode?.colors?.background?.paper : themeMode?.colors?.background?.paper,
                    border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.05)' : 'none'
                  }
                }
              }}
            >              <Box sx={{ 
                p: 2, 
                background: themeMode?.theme === 'light' 
                  ? 'linear-gradient(90deg, rgba(38, 207, 172, 0.15) 0%, rgba(38, 207, 172, 0.05) 100%)'
                  : 'linear-gradient(90deg, rgba(38, 207, 172, 0.2) 0%, rgba(38, 207, 172, 0.1) 100%)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
              }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{
                  color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'inherit'
                }}>
                  {t('notifications')}
                </Typography>
                {notifications.length > 0 && (
                  <Tooltip title={t('clearAll')}>
                    <span>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAllNotifications();
                        }}
                        disabled={!notifications.length}                        sx={{ 
                          color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                          p: 0.5,
                          '&:hover': {
                            backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Box>              <Divider sx={{ backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : themeMode?.colors?.divider || 'rgba(0, 0, 0, 0.12)' }} />
              {notifications.length > 0 ? notifications.map((notification, index) => (
                <MenuItem key={index} onClick={() => handleNotificationClick(notification)} sx={{
                  '&:hover': {
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(38, 207, 172, 0.08)' : 'rgba(38, 207, 172, 0.04)'
                  }
                }}>
                  <Box sx={{ py: 0.5, width: '100%' }}>                    <Typography variant="body2" fontWeight="bold" sx={{ 
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%',
                      color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'inherit'
                    }}>
                      {DOMPurify.sanitize(notification.title)}
                    </Typography>
                    <Typography variant="caption" sx={{ 
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'text.secondary'
                    }}>
                      {DOMPurify.sanitize(notification.message.substring(0, 30))}
                      {notification.message.length > 30 ? '...' : ''}
                    </Typography>                    <Typography variant="caption" sx={{ 
                      display: 'block',
                      mt: 0.5,
                      fontSize: '0.65rem',
                      color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.disabled',
                      fontWeight: 500
                    }}>
                      {new Date(notification.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </MenuItem>
              )) : (
                <MenuItem>                <Typography variant="body2" sx={{
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary'
                  }}>
                    {t('noNotifications')}
                  </Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>      <StyledDrawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        themeMode={themeMode}
      >
        <DrawerHeader>
          <Logo>
            <SchoolIcon fontSize="large" />
            <Typography variant="h6" fontWeight="bold">
              {t('schoolAttendanceSystem')}
            </Typography>
          </Logo>
          
          <UserInfo>
            <UserAvatar>{userName ? userName.charAt(0).toUpperCase() : 'U'}</UserAvatar>
            <Typography variant="subtitle1" fontWeight="bold">
              {userName || t('User')}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {userRole === 'admin' ? t('Administrator') : t('Teacher')}
            </Typography>
          </UserInfo>
        </DrawerHeader>        <Divider sx={{ backgroundColor: themeMode?.theme === 'light' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.1)', my: 1 }} />
        <List sx={{ 
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.05)',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '4px',
          }
        }}>
          {menuItems
            .filter((item) => item.role.includes(userRole))
            .map((item) => (                <StyledListItem
                button
                key={item.view}
                onClick={() => setSelectedView(item.view)}
                className={selectedView === item.view ? 'active' : ''}
                themeMode={themeMode}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    fontWeight: selectedView === item.view ? 600 : 400
                  }}
                />
              </StyledListItem>
            ))}
        </List>
      </StyledDrawer>      <MainContent sx={{ 
        ml: { md: drawerOpen ? '280px' : 0 }, 
        transition: 'margin 0.3s ease',
        width: { xs: '100%', md: drawerOpen ? 'calc(100% - 280px)' : '100%' }
      }} themeMode={themeMode}>
        <ContentHeader>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {t('WelcomeUser', { userName: userName || t('User') })}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </ContentHeader>
        <AnimatePresence mode="wait">          <ContentCard
            key={selectedView}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            themeMode={themeMode}
          >
            {renderContent()}
          </ContentCard>
        </AnimatePresence>
        <Dialog
          open={notificationDialogOpen}
          onClose={handleDialogClose}          PaperProps={{
            sx: {
              borderRadius: 2,
              maxWidth: 400,
              width: '100%',
              backgroundColor: themeMode?.colors?.background?.paper || '#ffffff',
              boxShadow: themeMode?.theme === 'light' 
                ? '0 4px 20px rgba(0, 0, 0, 0.1)' 
                : '0 4px 20px rgba(0, 0, 0, 0.25)',
            }
          }}
        >
          {selectedNotification && (
            <>              <DialogTitle sx={{ 
                background: themeMode?.theme === 'light' 
                  ? 'linear-gradient(90deg, rgba(38, 207, 172, 0.15) 0%, rgba(38, 207, 172, 0.05) 100%)'
                  : 'linear-gradient(90deg, rgba(38, 207, 172, 0.2) 0%, rgba(38, 207, 172, 0.1) 100%)',
                pb: 1
              }}>
                <Typography variant="h6" fontWeight="bold" sx={{ 
                  color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'inherit'
                }}>
                  {DOMPurify.sanitize(selectedNotification.title)}
                </Typography>                <Typography variant="caption" sx={{ 
                  display: 'block',
                  color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
                  fontWeight: 500
                }}>
                  {new Date(selectedNotification.createdAt).toLocaleString()}
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ py: 2 }}>                <Typography variant="body1" sx={{ 
                  color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'inherit',
                  lineHeight: 1.6
                }}>
                  {DOMPurify.sanitize(selectedNotification.message)}
                </Typography>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button 
                  onClick={handleDialogClose} 
                  variant="outlined" 
                  size="small"                  sx={{
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : undefined,
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
                    '&:hover': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : undefined,
                      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined,
                    }
                  }}
                >
                  {t('close')}
                </Button>
                {selectedNotification.type && (
                  <Button 
                    onClick={() => handleNotificationAction(selectedNotification.type)} 
                    variant="contained" 
                    size="small"
                    color="primary"                    sx={{
                      fontWeight: 'medium',
                      boxShadow: themeMode?.theme === 'dark' ? '0 2px 8px rgba(38, 207, 172, 0.25)' : undefined,
                      '&:hover': {
                        boxShadow: themeMode?.theme === 'dark' ? '0 4px 12px rgba(38, 207, 172, 0.35)' : undefined,
                      }
                    }}
                  >
                    {selectedNotification.type === 'attendance' ? t('viewAttendance') : t('viewDetails')}
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>      </MainContent>
    </DashboardRoot>
    );
  } catch (error) {
    logger.error("Dashboard render error:", error);
    return (
      <Box sx={{ 
        padding: 4, 
        margin: 'auto', 
        marginTop: 10, 
        maxWidth: 600, 
        textAlign: 'center',
        color: 'error.main',
        border: '1px solid',
        borderColor: 'error.main',
        borderRadius: 2
      }}>
        <Typography variant="h5">Error Rendering Dashboard</Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          An unexpected error occurred. Please try refreshing the page.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Box>
      </Box>
    );
  }
}

export default Dashboard;
