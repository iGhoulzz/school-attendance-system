// StudentDetail.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import './StudentDetail.css';
import { useTranslation } from 'react-i18next';
import { ThemeContext, themes } from '../utils/themeContext';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Grid, 
  Button, 
  Typography, 
  Divider, 
  Box,
  Alert,
  CircularProgress,
  Chip,
  IconButton
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon, 
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Event as EventIcon,
  Key as KeyIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

function StudentDetail({ studentId, student, onClose }) {
  const { t } = useTranslation();
  const themeMode = useContext(ThemeContext);
  const [studentData, setStudentData] = useState(student || null);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    grade: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudent = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5001/api/students/by-id/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudentData(response.data);
      setFormData({
        name: response.data.name || '',
        surname: response.data.surname || '',
        parentName: response.data.parentName || '',
        parentEmail: response.data.parentEmail || '',
        parentPhone: response.data.parentPhone || '',
        grade: response.data.grade || '',
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      setMessage(t('errorFetchingStudentData'));
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  }, [studentId, t]);

  useEffect(() => {
    if (!studentData && studentId) {
      fetchStudent();
    } else if (studentData) {
      setFormData({
        name: studentData.name || '',
        surname: studentData.surname || '',
        parentName: studentData.parentName || '',
        parentEmail: studentData.parentEmail || '',
        parentPhone: studentData.parentPhone || '',
        grade: studentData.grade || '',
      });
    }
  }, [studentId, studentData, fetchStudent]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/students/by-id/${studentData.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage(t('studentUpdatedSuccessfully'));
      setMessageType('success');
      setStudentData({ ...studentData, ...formData });
    } catch (error) {
      console.error('Error updating student:', error.message);
      setMessage(t('errorUpdatingStudent'));
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };
  if (!studentData) {
    return (      <Dialog 
        open={true}
        fullWidth 
        maxWidth="md"
        PaperProps={{ 
          sx: { 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.background.paper : themes.light.colors.background.paper,
          } 
        }}
      >
        <DialogContent sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          p: 4,
          color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
        }}>
          <CircularProgress color="primary" />
        </DialogContent>
      </Dialog>
    );
  }

  return (    <Dialog 
      open={true} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 3, 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.background.paper : themes.light.colors.background.paper,
          color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
        }
      }}
    >      <DialogTitle 
        component={motion.div} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        sx={{ 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          background: themeMode?.theme === 'dark' 
            ? 'linear-gradient(90deg, rgba(77, 125, 255, 0.1) 0%, rgba(77, 125, 255, 0.0) 100%)'
            : 'linear-gradient(90deg, rgba(41, 99, 255, 0.1) 0%, rgba(41, 99, 255, 0.0) 100%)' 
        }}
      >
        <PersonIcon color="primary" />
        <Typography variant="h5" fontWeight="bold">{t('editStudent')}</Typography>
      </DialogTitle>      {message && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Alert 
            severity={messageType === 'success' ? 'success' : 'error'} 
            sx={{ 
              mb: 2,
              backgroundColor: themeMode?.theme === 'dark' 
                ? (messageType === 'success' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)')
                : undefined,
              color: themeMode?.theme === 'dark' 
                ? themes.dark.colors.text.primary 
                : undefined,
              '& .MuiAlert-icon': {
                color: themeMode?.theme === 'dark'
                  ? (messageType === 'success' ? '#66bb6a' : '#f44336')
                  : undefined
              }
            }}
          >
            {message}
          </Alert>
        </Box>
      )}        <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ mb: 3, p: 2, 
          bgcolor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', 
          borderRadius: 2,
          color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary, 
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <KeyIcon fontSize="small" color="primary" />                <Typography variant="body2" color={themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}>
                  {t('ID')}: <Chip size="small" label={studentData.id} sx={{ 
                    ml: 1,
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined,
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
                  }} />
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventIcon fontSize="small" color="primary" />                <Typography variant="body2" color={themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'}>
                  {t('dateAdded')}: <Chip size="small" label={new Date(studentData.createdAt).toLocaleDateString()} sx={{ 
                    ml: 1,
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined,
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
                  }} />
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ 
          mb: 3, 
          borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }} />

        <form onSubmit={handleUpdate}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField                fullWidth
                label={t('Name')}
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <PersonIcon color="primary" sx={{ mr: 1 }} />,
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>              <TextField
                fullWidth
                label={t('Surname')}
                name="surname"
                value={formData.surname}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <PersonIcon color="primary" sx={{ mr: 1 }} />,
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>              <TextField
                fullWidth
                label={t('ParentName')}
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <PersonIcon color="primary" sx={{ mr: 1 }} />,
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>              <TextField
                fullWidth
                label={t('ParentEmail')}
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <EmailIcon color="primary" sx={{ mr: 1 }} />,
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>              <TextField
                fullWidth
                label={t('ParentPhone')}
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <PhoneIcon color="primary" sx={{ mr: 1 }} />,
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>              <TextField
                fullWidth
                label={t('Grade')}
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: <SchoolIcon color="primary" sx={{ mr: 1 }} />,
                }}
                sx={{ 
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                    '& .MuiInputBase-input': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
                    '&.Mui-focused': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>        <Button 
          variant="outlined" 
          onClick={onClose} 
          disabled={isLoading} 
          startIcon={<CancelIcon />}
          sx={{
            borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
            '&:hover': {
              borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
              backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined,
            }
          }}
        >
          {t('cancel')}
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleUpdate}
          disabled={isLoading} 
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          sx={{ 
            background: themeMode?.theme === 'dark'
              ? 'linear-gradient(90deg, #4d7dff 0%, #3a67e0 100%)'
              : 'linear-gradient(90deg, #2963ff 0%, #2963ff 100%)',
            boxShadow: '0 4px 12px rgba(41, 99, 255, 0.2)',
            '&:hover': {
              background: themeMode?.theme === 'dark'
                ? 'linear-gradient(90deg, #3a67e0 0%, #2854c8 100%)'
                : 'linear-gradient(90deg, #1e50e0 0%, #1e50e0 100%)',
              boxShadow: '0 6px 16px rgba(41, 99, 255, 0.3)',
            }
          }}
        >
          {isLoading ? t('saving') : t('save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default StudentDetail;




