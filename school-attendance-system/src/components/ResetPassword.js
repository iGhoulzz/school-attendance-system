import React, { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import './ResetPassword.css';
import { ThemeContext, themes } from '../utils/themeContext';
import apiService from '../services/apiService';

const ResetContainer = styled(Box, {
  shouldForwardProp: prop => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: themeContext?.theme === 'dark' 
    ? 'linear-gradient(135deg, #1e3a8a 0%, #1a5d50 100%)' 
    : 'linear-gradient(135deg, #2963ff 0%, #27cfad 100%)',
  padding: '20px',
}));

const StyledPaper = styled(Paper, {
  shouldForwardProp: prop => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  padding: '32px',
  width: '100%',
  maxWidth: '400px',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  backgroundColor: themeContext?.theme === 'dark' ? themes.dark.colors.background.paper : themes.light.colors.background.paper,
  color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
}));

const ResetPassword = () => {
  const { t } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Get token from URL search params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const isResetMode = !!token;const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Use apiService instead of direct axios calls
      await apiService.post('/auth/request-reset', { email });
      setSuccess(t('resetLinkSent'));
      setEmail('');
    } catch (err) {
      console.error('Reset request error:', err);
      
      // Enhanced error handling
      if (err.message === 'Network Error') {
        setError('Connection issue detected. Please try again.');
        console.error('Network error during reset request - this might be a CORS issue.');
      } else {
        setError(err.response?.data?.message || t('errorRequestingReset'));
      }
    } finally {
      setLoading(false);
    }
  };  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError(t('passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use apiService instead of direct axios calls
      await apiService.post('/auth/reset-password', {
        token,
        newPassword
      });
      
      setSuccess(t('passwordResetSuccess'));
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      
      // Enhanced error handling
      if (err.message === 'Network Error') {
        setError('Connection issue detected. Please try again.');
        console.error('Network error during password reset - this might be a CORS issue.');
      } else if (err.response?.status === 400) {
        setError(t('invalidOrExpiredToken'));
      } else {
        setError(err.response?.data?.message || t('errorResettingPassword'));
      }
    } finally {
      setLoading(false);
    }
  };  return (
    <ResetContainer themeContext={themeContext}>
      <StyledPaper themeContext={themeContext}>
        <Typography variant="h5" gutterBottom align="center" fontWeight="bold">
          {isResetMode ? t('resetPassword') : t('forgotPassword')}
        </Typography>        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: themeContext?.theme === 'dark' ? 'rgba(211, 47, 47, 0.1)' : undefined,
              color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
              '& .MuiAlert-icon': {
                color: themeContext?.theme === 'dark' ? '#f44336' : undefined
              }
            }} 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 2,
              backgroundColor: themeContext?.theme === 'dark' ? 'rgba(46, 125, 50, 0.1)' : undefined,
              color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
              '& .MuiAlert-icon': {
                color: themeContext?.theme === 'dark' ? '#66bb6a' : undefined
              }
            }} 
            onClose={() => setSuccess('')}
          >            {success}
          </Alert>
        )}

        <form onSubmit={isResetMode ? handleResetPassword : handleRequestReset}>
          {!isResetMode ? (            <TextField
              fullWidth
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                  },
                  '&:hover fieldset': {
                    borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: themeContext?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                  '&.Mui-focused': {
                    color: themeContext?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  },
                },
              }}
            />
          ) : (
            <>              <TextField
                fullWidth
                label={t('newPassword')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeContext?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: themeContext?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                  },
                }}
              />              <TextField
                fullWidth
                label={t('confirmPassword')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeContext?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: themeContext?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                  },
                }}
              />
            </>
          )}          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              mb: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #2963ff 0%, #1e4ecc 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2557e6 0%, #1b45b8 100%)'
              },
              color: '#ffffff'
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : isResetMode ? (
              t('resetPassword')
            ) : (
              t('sendResetLink')
            )}
          </Button>

          <Button
            fullWidth
            onClick={() => navigate('/login')}
            sx={{ 
              textTransform: 'none',
              color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : undefined
            }}
          >
            {t('backToLogin')}
          </Button>
        </form>
      </StyledPaper>
    </ResetContainer>
  );
}

export default ResetPassword;
