// StudentDetail.js
import React, { useState, useEffect, useCallback, useContext } from 'react';
import './StudentDetail.css';
import { useTranslation } from 'react-i18next';
import { ThemeContext, themes } from '../utils/themeContext';
import apiService from '../services/apiService';
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
import { styled } from '@mui/material/styles';

// Create a styled wrapper for motion.div that filters out themeMode prop
const StyledMotionDiv = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(() => ({
  // No specific styling needed, just filtering the prop
}));

// Create styled components for MUI components to prevent themeMode prop warnings
const StyledChip = styled(Chip, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

const StyledDialog = styled(Dialog, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

const StyledAlert = styled(Alert, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

// Add a styled TextField component to filter themeMode prop
const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

// Add a styled Button component to filter themeMode prop
const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

// Add a styled Divider component to filter themeMode prop
const StyledDivider = styled(Divider, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

// Add a styled Typography component to filter themeMode prop
const StyledTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

// Add styled components for Dialog-related components
const StyledDialogContent = styled(DialogContent, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

const StyledDialogActions = styled(DialogActions, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

const StyledCircularProgress = styled(CircularProgress, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

// Add a styled DialogTitle component
const StyledDialogTitle = styled(DialogTitle, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})({});

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
      const data = await apiService.get(`/students/by-id/${studentId}`);
      
      setStudentData(data);
      setFormData({
        name: data.name || '',
        surname: data.surname || '',
        parentName: data.parentName || '',
        parentEmail: data.parentEmail || '',
        parentPhone: data.parentPhone || '',
        grade: data.grade || '',
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
      await apiService.put(`/students/by-id/${studentData.id}`, formData);
      
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
  };  if (!studentData) {    return (      <StyledDialog 
        open={true}
        fullWidth 
        maxWidth="md"
        themeMode={themeMode}
        PaperProps={{ 
          sx: { 
            borderRadius: 3, 
            boxShadow: themeMode?.theme === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            backgroundColor: themeMode?.theme === 'dark' 
              ? 'rgba(37, 42, 52, 0.95)' 
              : '#ffffff',
            border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            backdropFilter: 'blur(12px)',
          } 
        }}
      >        <StyledDialogContent sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          p: 4,
          color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
        }} themeMode={themeMode}>
          <StyledCircularProgress color="primary" themeMode={themeMode} />        </StyledDialogContent>
      </StyledDialog>
    );
  }  return (    <StyledDialog 
      open={true} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
      themeMode={themeMode}
      PaperProps={{
        sx: {
          borderRadius: 3, 
          boxShadow: themeMode?.theme === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)',
          backgroundColor: themeMode?.theme === 'dark' 
            ? 'rgba(37, 42, 52, 0.95)' 
            : '#ffffff',
          color: themeMode?.theme === 'dark' ? '#ffffff' : themes.light.colors.text.primary,
          border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }
      }}
      BackdropProps={{
        sx: {
          backdropFilter: 'blur(4px)',
          backgroundColor: themeMode?.theme === 'dark' 
            ? 'rgba(0, 0, 0, 0.7)' 
            : 'rgba(0, 0, 0, 0.5)',
        }
      }}
    >      <StyledDialogTitle 
        component={StyledMotionDiv} 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        themeMode={themeMode}
        sx={{ 
          pb: 1, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          position: 'relative',
          background: themeMode?.theme === 'dark' 
            ? 'linear-gradient(90deg, rgba(77, 125, 255, 0.15) 0%, rgba(77, 125, 255, 0.05) 100%)'
            : 'linear-gradient(90deg, rgba(41, 99, 255, 0.1) 0%, rgba(41, 99, 255, 0.0) 100%)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: themeMode?.theme === 'dark' 
              ? 'linear-gradient(90deg, #4d7dff 30%, #7C4DFF 100%)' 
              : 'linear-gradient(90deg, #2963ff 30%, #536DFE 100%)',
          }
        }}
      >        <PersonIcon color="primary" />
        <StyledTypography variant="h5" fontWeight="bold" themeMode={themeMode}>{t('editStudent')}</StyledTypography>
      </StyledDialogTitle>      {message && (
        <Box sx={{ px: 3, pt: 2 }}>
          <StyledAlert 
            severity={messageType === 'success' ? 'success' : 'error'} 
            themeMode={themeMode}
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
          </StyledAlert>
        </Box>
      )}<StyledDialogContent sx={{ pt: 2 }} themeMode={themeMode}>
        <Box sx={{ mb: 3, p: 2, 
          bgcolor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)', 
          borderRadius: 2,
          color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary, 
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>                <KeyIcon fontSize="small" color="primary" />                <StyledTypography variant="body2" color={themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} themeMode={themeMode}>
                  {t('ID')}: <StyledChip size="small" label={studentData.id} sx={{ 
                    ml: 1,
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined,
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
                  }} />
                </StyledTypography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>                <EventIcon fontSize="small" color="primary" />                <StyledTypography variant="body2" color={themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} themeMode={themeMode}>
                  {t('dateAdded')}: <StyledChip size="small" label={new Date(studentData.createdAt).toLocaleDateString()} sx={{ 
                    ml: 1,
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined,
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
                  }} />
                </StyledTypography>
              </Box>
            </Grid>
          </Grid>
        </Box>        <StyledDivider 
          themeMode={themeMode}
          sx={{ 
            mb: 3, 
            borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }}/>

        <form onSubmit={handleUpdate}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>              <StyledTextField                fullWidth
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
                    borderRadius: 8,
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.07)' : undefined,
                    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                    '&.Mui-focused': {
                      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.09)' : undefined,
                      boxShadow: themeMode?.theme === 'dark' ? '0 0 0 1px rgba(77, 125, 255, 0.7)' : 'none',
                    },
                    '& fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.23)',
                      transition: 'border-color 0.2s ease',
                    },
                    '&:hover fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                      borderWidth: 2
                    },
                    '&:hover': {
                      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.01)',
                    },
                    '& .MuiInputBase-input': {
                      color: themeMode?.theme === 'dark' ? '#ffffff' : themes.light.colors.text.primary,
                      '&::placeholder': {
                        color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
                        opacity: 1,
                      },
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.6)',
                    transition: 'color 0.2s ease, transform 0.2s ease',
                    '&.Mui-focused': {
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                      fontWeight: 600,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>              <StyledTextField
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
            <Grid item xs={12} sm={6}>              <StyledTextField
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
            <Grid item xs={12} sm={6}>              <StyledTextField
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
            <Grid item xs={12} sm={6}>              <StyledTextField
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
            <Grid item xs={12} sm={6}>              <StyledTextField
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
        </form>      </StyledDialogContent>        <StyledDialogActions sx={{ px: 3, pb: 3, pt: 2 }} themeMode={themeMode}>        <StyledButton 
          variant="outlined" 
          onClick={onClose} 
          disabled={isLoading} 
          startIcon={<CancelIcon />}
          themeMode={themeMode}
          sx={{
            borderRadius: 2,
            borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(25, 118, 210, 0.5)',
            color: themeMode?.theme === 'dark' ? '#ffffff' : 'primary.main',
            px: 2.5,
            py: 0.8,
            textTransform: 'none',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'primary.main',
              backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(25, 118, 210, 0.04)',
              transform: 'translateY(-1px)',
              boxShadow: themeMode?.theme === 'dark' ? '0 3px 8px rgba(0, 0, 0, 0.3)' : '0 3px 8px rgba(0, 0, 0, 0.1)',
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
        >
          {t('cancel')}
        </StyledButton>
        <StyledButton 
          variant="contained" 
          color="primary" 
          onClick={handleUpdate}
          disabled={isLoading} 
          startIcon={isLoading ? <StyledCircularProgress size={16} color="inherit" themeMode={themeMode} /> : <SaveIcon />}
          themeMode={themeMode}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 0.8,
            textTransform: 'none',
            fontWeight: 500,
            background: themeMode?.theme === 'dark'
              ? 'linear-gradient(90deg, #4d7dff 0%, #3a67e0 100%)'
              : 'linear-gradient(90deg, #2963ff 0%, #2963ff 100%)',
            boxShadow: themeMode?.theme === 'dark' 
              ? '0 4px 12px rgba(41, 99, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 4px 12px rgba(41, 99, 255, 0.2)',
            transition: 'all 0.2s ease',
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              background: 'linear-gradient(rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0))',
              opacity: 0,
              transition: 'opacity 0.2s ease',
            },
            '&:hover': {
              background: themeMode?.theme === 'dark'
                ? 'linear-gradient(90deg, #3a67e0 0%, #2854c8 100%)'
                : 'linear-gradient(90deg, #1e50e0 0%, #1e50e0 100%)',
              boxShadow: themeMode?.theme === 'dark'
                ? '0 6px 16px rgba(41, 99, 255, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)' 
                : '0 6px 16px rgba(41, 99, 255, 0.3)',
              transform: 'translateY(-2px)',
              '&::after': {
                opacity: 1,
              }
            },
            '&:active': {
              transform: 'translateY(0)',
            }
          }}
        >
          {isLoading ? t('saving') : t('save')}        </StyledButton>
      </StyledDialogActions>
    </StyledDialog>
  );
}

export default StudentDetail;




