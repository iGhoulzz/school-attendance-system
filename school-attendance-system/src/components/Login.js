import React, { useState, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { AuthContext } from '../contexts/AuthContext';
import { TextField, Button, InputAdornment, IconButton, Snackbar, Alert, Typography, Link, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Email, Lock, Visibility, VisibilityOff, Home } from '@mui/icons-material';
import SchoolIcon from '@mui/icons-material/School';
import { useNavigate } from 'react-router-dom';
import { ThemeContext, themes } from '../utils/themeContext';

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
  position: 'relative',

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

const HomeButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  position: 'absolute',
  top: '20px',
  left: '20px',
  borderRadius: '50%',
  minWidth: 'unset',
  width: '48px',
  height: '48px',
  background: themeContext?.theme === 'dark'
    ? 'rgba(16, 20, 24, 0.75)'
    : 'rgba(255, 255, 255, 0.25)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  border: themeContext?.theme === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.08)'
    : '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: themeContext?.theme === 'dark'
    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
    : '0 4px 12px rgba(0, 0, 0, 0.1)',

  '&:hover': {
    background: themeContext?.theme === 'dark'
      ? 'rgba(26, 30, 34, 0.85)'
      : 'rgba(255, 255, 255, 0.35)',
  }
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
  const themeContext = useContext(ThemeContext);
  const { login, isAuthenticated, loading: authLoading, error: authError } = useContext(AuthContext);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // Add timeout safety for loading state
  useEffect(() => {
    let timeoutId;
    if (loading) {
      timeoutId = setTimeout(() => {
        setLoading(false);
        setError('Request timed out. Please try again.');
      }, 15000); // 15 second timeout
    }
    return () => timeoutId && clearTimeout(timeoutId);
  }, [loading]);  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError(t('pleaseEnterBoth'));
      return;
    }
    
    try {
      setLoading(true);
      console.log('Attempting login with email:', email);
      const success = await login(email, password);
      console.log('Login result:', success);
      
      if (success) {
        console.log('Login successful, showing success message');
        // Keep the message visible for a moment before redirect
        setSnackbarOpen(true);
        setSnackbarMessage(t('loginSuccess'));
        setSnackbarSeverity('success');
        
        console.log('Will redirect to dashboard in 1 second...');
        // Small delay to allow state to update and show success message
        setTimeout(() => {
          console.log('Now redirecting to dashboard...');
          navigate('/dashboard', { replace: true });
        }, 1000);
      } else {
        console.log('Login returned false, not redirecting');
        setError('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login failed with error:', error);
      
      // Handle different types of errors
      if (error.message === 'Network Error') {
        setError('Connection issue detected. Please try again.');
      } else if (error.response?.status === 401) {
        setError(t('invalidCredentials'));
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
      <HomeButton 
        themeContext={themeContext}
        aria-label="Go to home page"
        onClick={() => navigate('/')}
        title={t('backToHome')}
      >
        <Home />
      </HomeButton>
      
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
          </LoginButton>
          
          <Box sx={{ mt: 2, textAlign: 'center' }}>
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