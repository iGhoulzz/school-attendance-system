// src/components/Login.js
import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TextField, Button, InputAdornment, IconButton, Snackbar, Alert, Typography, Link, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { storageUtils } from '../utils/storageUtils';
import { ThemeContext, themes } from '../utils/themeContext';

// Import directly from apiService.js - we know the export structure is correct
import apiService from '../services/apiService';

// Provide a direct fallback for CSRF token fetching in case the apiService import fails
const fetchCsrfToken = async () => {
  try {
    // First check if apiService has the method
    if (apiService && typeof apiService.fetchCsrfToken === 'function') {
      return await apiService.fetchCsrfToken();
    }
    
    // Fallback implementation
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
    const response = await axios.get(`${API_BASE_URL}/csrf-token`, {
      withCredentials: true
    });
    
    if (response.data && response.data.csrfToken) {
      return response.data.csrfToken;
    }
    return null;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    return null;
  }
};

// Styled components with proper theme handling
const LoginContainer = styled('div', {
  shouldForwardProp: prop => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  minHeight: '100vh',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  background: themeContext?.theme === 'dark'
    ? 'linear-gradient(135deg, #1e3a8a 0%, #1a5d50 100%)'
    : 'linear-gradient(135deg, #2963ff 0%, #27cfad 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradient 15s ease infinite',

  '@keyframes gradient': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

const GlassCard = styled(motion.div, {
  shouldForwardProp: prop => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  background: themeContext?.theme === 'dark'
    ? 'rgba(16, 20, 24, 0.75)'
    : 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: themeContext?.theme === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.08)'
    : '1px solid rgba(255, 255, 255, 0.18)',
  padding: '48px',
  width: '100%',
  maxWidth: '450px',
  boxShadow: themeContext?.theme === 'dark'
    ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
    : '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
}));

const Logo = styled('div')`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
`;

const LogoText = styled(Typography, {
  shouldForwardProp: prop => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : 'white',
  fontSize: '24px',
  fontWeight: 'bold',
  marginLeft: '16px',
}));

const StyledTextField = styled(TextField, {
  shouldForwardProp: prop => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  marginBottom: '24px',
  width: '100%',
  backdropFilter: 'blur(10px)',
  
  '& .MuiOutlinedInput-root': {
    background: themeContext?.theme === 'dark' 
      ? 'rgba(0, 0, 0, 0.2)' 
      : 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    
    '& fieldset': {
      borderColor: themeContext?.theme === 'dark' 
        ? 'rgba(255, 255, 255, 0.2)' 
        : 'rgba(255, 255, 255, 0.3)',
    },
    
    '&:hover fieldset': {
      borderColor: themeContext?.theme === 'dark' 
        ? 'rgba(255, 255, 255, 0.3)' 
        : 'rgba(255, 255, 255, 0.5)',
    },
    
    '&.Mui-focused fieldset': {
      borderColor: themeContext?.theme === 'dark' 
        ? themes.dark.colors.primary 
        : '#ffffff',
    },
  },
  
  '& .MuiInputLabel-root': {
    color: themeContext?.theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.7)' 
      : 'rgba(255, 255, 255, 0.8)',
  },
  
  '& .MuiOutlinedInput-input': {
    color: themeContext?.theme === 'dark' 
      ? themes.dark.colors.text.primary 
      : 'white',
  },
  
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    color: themeContext?.theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.5)' 
      : 'rgba(255, 255, 255, 0.7)',
  },
}));

const LoginButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  marginTop: '24px',
  padding: '12px',
  background: 'linear-gradient(135deg, #2963ff 0%, #27cfad 100%)',
  color: 'white',
  fontWeight: 'bold',
  borderRadius: '12px',
  textTransform: 'none',
  fontSize: '16px',
  
  '&:hover': {
    background: 'linear-gradient(135deg, #2557e6 0%, #25bb9e 100%)',
  },
  
  '&.Mui-disabled': {
    background: themeContext?.theme === 'dark' 
      ? 'rgba(0, 0, 0, 0.12)' 
      : 'rgba(255, 255, 255, 0.12)',
    color: themeContext?.theme === 'dark' 
      ? 'rgba(255, 255, 255, 0.3)' 
      : 'rgba(255, 255, 255, 0.3)',
  },
}));

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const themeContext = useContext(ThemeContext);  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Add snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Debug apiService to verify it's properly loaded
    console.log('Login attempt - apiService:', apiService);
    console.log('Available methods:', Object.keys(apiService || {}));
    
    try {
      // Trim email and password to avoid leading/trailing spaces causing issues
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
      
      // First fetch the CSRF token - using our fallback if needed
      console.log('Attempting to fetch CSRF token...');
      let csrfToken;
      
      try {
        // Try to use apiService.get if available
        if (apiService && typeof apiService.get === 'function') {
          await apiService.get('/csrf-token', { useCache: false });
        } else {
          // Otherwise use our fallback
          csrfToken = await fetchCsrfToken();
        }
      } catch (tokenError) {
        console.error('Error fetching CSRF token:', tokenError);
        // Continue without token - server might allow it
      }
      
      // Make login request - choose the right method based on what's available
      console.log('Attempting to make login request...');
      let response;
      
      if (apiService && typeof apiService.post === 'function') {
        // Use apiService.post if available
        response = await apiService.post('/auth/login', {
          email: trimmedEmail,
          password: trimmedPassword
        });
      } else {
        // Direct axios fallback
        const headers = {};
        if (csrfToken) {
          headers['X-CSRF-Token'] = csrfToken;
        }
        
        response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: trimmedEmail,
          password: trimmedPassword
        }, {
          headers,
          withCredentials: true
        });
      }      
      // Get the data from the response
      const responseData = response.data || response;
      
      // Store non-sensitive user details
      storageUtils.setUserInfo({
        role: responseData.role,
        name: responseData.name,
        userId: responseData.userId
      });
      
      // Show success message
      setSnackbarOpen(true);
      setSnackbarMessage(t('loginSuccess'));
      setSnackbarSeverity('success');
      
      // Redirect after successful login
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      console.error('Login failed:', error);
      
      // Detailed error logging to help diagnose issues
      if (error.message && error.message.includes('is not a function')) {
        console.error('API Service method missing:', error.message);
        console.error('apiService type:', typeof apiService);
        console.error('Available methods:', Object.keys(apiService || {}));
        setError('System error: API service not properly initialized. Please contact support.');
      } else if (error.message === 'Network Error') {
        console.error('Network error during login - this might be a CORS issue.');
        setError('Connection issue detected. This might be a temporary problem - please try again.');
      } else if (error.response?.status === 403 && error.response?.data?.error?.includes('csrf')) {
        console.error('CSRF token validation failed');
        setError('Security validation failed. Please refresh the page and try again.');
      } else if (error.response?.status === 401) {
        setError(t('invalidCredentials'));
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later or contact support.');
      } else {
        setError(error.response?.data?.message || t('loginError'));
      }
      
      // Show error message in snackbar
      setSnackbarOpen(true);
      setSnackbarMessage(error.response?.data?.message || t('loginError'));
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <LoginContainer themeContext={themeContext}>
      <GlassCard
        themeContext={themeContext}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>
          <SchoolIcon sx={{ fontSize: 40, color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : '#fff' }} />
          <LogoText variant="h5" themeContext={themeContext}>{t('YourSchoolName')}</LogoText>
        </Logo>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <StyledTextField
            themeContext={themeContext}
            label={t('email')}
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          
          <StyledTextField
            themeContext={themeContext}
            label={t('password')}
            variant="outlined"
            type={showPassword ? 'text' : 'password'}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <LoginButton
            themeContext={themeContext}
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
          >
            {loading ? t('loggingIn') : t('loginButton')}
          </LoginButton>          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/reset-password')}
              sx={{
                color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : 'white',
                textDecoration: 'underline',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'none'
                }
              }}
            >
              {t('forgotPassword')}
            </Link>
          </Box>
        </form>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={() => setError('')}
        >
          <Alert 
            severity="error" 
            onClose={() => setError('')}
            sx={{
              backgroundColor: themeContext?.theme === 'dark' ? 'rgba(211, 47, 47, 0.1)' : undefined,
              color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
              '& .MuiAlert-icon': {
                color: themeContext?.theme === 'dark' ? '#f44336' : undefined
              }
            }}
          >
            {error}
          </Alert>
        </Snackbar>
        
        {/* New Snackbar for success/error notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            severity={snackbarSeverity} 
            onClose={() => setSnackbarOpen(false)}
            sx={{
              backgroundColor: themeContext?.theme === 'dark' 
                ? (snackbarSeverity === 'success' 
                    ? 'rgba(46, 125, 50, 0.1)' 
                    : 'rgba(211, 47, 47, 0.1)') 
                : undefined,
              color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : undefined
            }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </GlassCard>
    </LoginContainer>
  );
}

export default Login;








