// StudentManagement.js
import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import './StudentManagement.css';
import StudentDetailsModal from './StudentDetail';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ThemeContext, themes } from '../utils/themeContext';
import { useApiData, useApiPost, useApiDelete } from '../hooks/useApiData';
import { createDebouncedClickHandler } from '../utils/debounceUtils';
import DOMPurify from 'dompurify';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  IconButton, 
  Card,
  InputAdornment,
  Grid,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Collapse,
  InputBase,
  MenuItem
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Add as AddIcon,  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Grade as GradeIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const FormPaper = styled(Paper, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  background: themeMode?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.95)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  boxShadow: themeMode?.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 8px 32px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(4),
  color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
  border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: themeMode?.theme === 'dark' 
      ? '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)' 
      : '0 10px 40px rgba(0, 0, 0, 0.08)',
  },
  '& .MuiTypography-root': {
    color: themeMode?.theme === 'dark' ? '#ffffff' : themes.light.colors.text.primary,
    fontWeight: 500,
  },
  '& .MuiSvgIcon-root': {
    color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
    transition: 'transform 0.2s ease',
  },
}));

const ListPaper = styled(Paper, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  background: themeMode?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.95)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  boxShadow: themeMode?.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 8px 32px rgba(0, 0, 0, 0.05)',
  color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
  border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
  '& .MuiListItemText-primary': {
    color: themeMode?.theme === 'dark' ? '#ffffff' : themes.light.colors.text.primary,
    fontWeight: 500,
  },
  '& .MuiListItemText-secondary': {
    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.75)' : themes.light.colors.text.secondary,
  },
  '& .MuiDivider-root': {
    borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
    margin: '0 16px',
  },
  '& .MuiList-root': {
    paddingTop: 0,
    paddingBottom: 0,
    '& .MuiListItem-root:last-child': {
      borderBottom: 'none',
    }
  },
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    boxShadow: themeMode?.theme === 'dark' 
      ? '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
      : '0 10px 40px rgba(0, 0, 0, 0.08)',
  },
}));

const SearchPaper = styled(Paper, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.75, 2.5),
  borderRadius: 50,
  marginBottom: theme.spacing(3),
  background: themeMode?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.95)' 
    : 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(12px)',
  boxShadow: themeMode?.theme === 'dark' 
    ? '0 6px 20px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
    : '0 4px 20px rgba(0, 0, 0, 0.05)',
  color: themeMode?.theme === 'dark' ? '#ffffff' : themes.light.colors.text.primary,
  border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
  transition: 'box-shadow 0.3s ease, transform 0.2s ease',
  '&:hover': {
    boxShadow: themeMode?.theme === 'dark' 
      ? '0 8px 24px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08)' 
      : '0 6px 22px rgba(0, 0, 0, 0.08)',
  },
  '& .MuiInputBase-root': {
    color: themeMode?.theme === 'dark' ? '#ffffff' : themes.light.colors.text.primary,
    '&::placeholder': {
      color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.42)',
      opacity: 1,
    },
    '&:focus-within': {
      '& + .MuiSvgIcon-root': {
        color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
      }
    }
  },
  '& .MuiSvgIcon-root': {
    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.54)',
    transition: 'color 0.2s ease',
  },
  '& .MuiButton-root': {
    color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
    fontWeight: 600,
    borderRadius: 30,
    padding: theme.spacing(0.5, 2),
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.12)' : 'rgba(25, 118, 210, 0.08)',
      transform: 'translateY(-1px)',
    },
  },
}));

const StyledTextField = styled(TextField, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.07)' : undefined,
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
    '&.Mui-focused': {
      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.09)' : undefined,
      boxShadow: themeMode?.theme === 'dark' ? '0 0 0 1px rgba(77, 125, 255, 0.7)' : 'none',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
        borderWidth: 2
      },
    },
    '& .MuiOutlinedInput-input': {
      color: themeMode?.theme === 'dark' ? '#ffffff' : themes.light.colors.text.primary,
      '&::placeholder': {
        color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
        opacity: 1,
      },
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.23)',
      transition: 'border-color 0.2s ease',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.87)',
    },
    '&:hover': {
      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.01)',
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
      color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.54)',
      transition: 'color 0.2s ease',
    },
  },
  '& .MuiInputLabel-root': {
    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.6)',
    transition: 'color 0.2s ease, transform 0.2s ease',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
    fontWeight: 600,
  },
  '& .MuiFormHelperText-root': {
    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)',
    marginTop: '4px',
    fontSize: '0.75rem',
    letterSpacing: '0.03em',
  },
  '& .MuiFormHelperText-root.Mui-error': {
    color: themeMode?.theme === 'dark' ? '#ff6b6b' : theme.palette.error.main,
    fontWeight: 500,
  },
  '& .MuiSelect-icon': {
    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : undefined,
    transition: 'transform 0.2s ease',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiSelect-icon': {
    transform: 'rotate(180deg)',
  },
  '& .MuiMenuItem-root': {
    transition: 'background-color 0.2s ease',
    '&.Mui-selected': {
      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.25)' : 'rgba(25, 118, 210, 0.12)',
      color: themeMode?.theme === 'dark' ? '#ffffff' : theme.palette.primary.main,
      fontWeight: 500,
      '&:hover': {
        backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.35)' : 'rgba(25, 118, 210, 0.2)',
      },
    },
    '&:hover': {
      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
    },
  }
}));

const ActionButton = styled(Button)(({ theme, themeMode }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: themeMode?.theme === 'dark' 
    ? '0 4px 12px rgba(0, 0, 0, 0.25)' 
    : '0 2px 6px rgba(0, 0, 0, 0.05)',
  color: themeMode?.theme === 'dark' 
    ? '#ffffff' 
    : theme.palette.getContrastText(theme.palette.primary.main),
  transition: 'all 0.3s ease',
  borderWidth: 0,
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: themeMode?.theme === 'dark'
      ? 'linear-gradient(rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))'
      : 'linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  '&:hover': {
    boxShadow: themeMode?.theme === 'dark' 
      ? '0 6px 16px rgba(0, 0, 0, 0.35)' 
      : '0 4px 12px rgba(0, 0, 0, 0.15)',
    transform: 'translateY(-2px)',
    '&::after': {
      opacity: 1,
    },
  },
  '&:active': {
    boxShadow: themeMode?.theme === 'dark' 
      ? '0 2px 8px rgba(0, 0, 0, 0.4)' 
      : '0 1px 4px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(0)',
  },
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    transition: 'transform 0.2s ease',
  },
  '&:hover .MuiButton-startIcon, &:hover .MuiButton-endIcon': {
    transform: 'scale(1.1)',
  },
}));

const StudentChip = styled(Chip)(({ theme, themeMode }) => ({
  borderRadius: 16,
  fontWeight: 600,
  backgroundColor: themeMode?.theme === 'dark' 
    ? 'rgba(77, 125, 255, 0.35)' 
    : 'rgba(25, 118, 210, 0.1)',
  color: themeMode?.theme === 'dark' ? '#ffffff' : theme.palette.primary.main,
  margin: theme.spacing(0.5),
  border: themeMode?.theme === 'dark' ? '1px solid rgba(77, 125, 255, 0.5)' : 'none',
  transition: 'all 0.2s ease',
  boxShadow: themeMode?.theme === 'dark' ? '0 2px 5px rgba(0, 0, 0, 0.2)' : 'none',
  '&:hover': {
    backgroundColor: themeMode?.theme === 'dark' 
      ? 'rgba(77, 125, 255, 0.45)' 
      : 'rgba(25, 118, 210, 0.15)',
    transform: 'translateY(-1px)',
    boxShadow: themeMode?.theme === 'dark' ? '0 3px 7px rgba(0, 0, 0, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  '&:active': {
    transform: 'translateY(0)',
    boxShadow: 'none',
  },
  '& .MuiChip-label': {
    paddingLeft: 12,
    paddingRight: 12,
    letterSpacing: '0.01em',
  },
  '& .MuiChip-deleteIcon': {
    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : undefined,
    '&:hover': {
      color: themeMode?.theme === 'dark' ? '#ffffff' : undefined,
    }
  }
}));

function StudentManagement() {
  const { t } = useTranslation();
  const themeMode = useContext(ThemeContext);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({
    name: '',
    surname: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    grade: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [errorFields, setErrorFields] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [formVisible, setFormVisible] = useState(false);
  const { data: apiData, refetch: refetchStudents } = useApiData('http://localhost:5001/api/students', {}, { 
    enabled: false,
    refetchOnWindowFocus: false,
  });

  const { postData: createStudent, posting: isCreating } = useApiPost();
  const { deleteData: deleteStudent, deleting: isDeleting } = useApiDelete();
  useEffect(() => {
    if (apiData) {
      setStudents(apiData);
      setMessage('');
      setMessageType('success');
    }
  }, [apiData]);

  // Create a stable fetch function with useRef
  const stableFetch = useRef(null);
  if (!stableFetch.current) {
    stableFetch.current = async () => {
      setLoading(true);
      try {
        await refetchStudents();
      } catch (error) {
        console.error('Error fetching students:', error);
        setMessage(t('errorFetchingStudents'));
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };
  }

  // Use the stable function in an effect with an empty dependency array
  useEffect(() => {
    stableFetch.current();
    
    // Optional: refetch when tab becomes visible
    const onVisibilityChange = () => {
      if (!document.hidden) {
        stableFetch.current();
      }
    };
    
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []); // Empty dependency array = run only once
  useEffect(() => {
    const filtered = students.filter((student) => {
      const fullName = `${student.name} ${student.surname}`.toLowerCase();
      const sanitizedQuery = DOMPurify.sanitize(searchQuery.toLowerCase());
      return (
        fullName.includes(sanitizedQuery) ||
        student.id.toLowerCase().includes(sanitizedQuery) ||
        (student.grade && student.grade.toLowerCase().includes(sanitizedQuery))
      );
    });
    setFilteredStudents(filtered);
  }, [students, searchQuery]);

  const handleCreateStudent = async () => {
    try {
      // Validate inputs
      const requiredFields = ['name', 'surname', 'parentName', 'parentEmail', 'parentPhone', 'grade'];
      const missingFields = requiredFields.filter(field => !newStudent[field]);
      
      if (missingFields.length > 0) {
        setErrorFields(missingFields);
        setMessage(t('pleaseCompleteAllFields'));
        setMessageType('error');
        return;      }
      
      setLoading(true);
      await createStudent('http://localhost:5001/api/students', newStudent);
      setMessage(t('studentCreatedSuccessfully'));
      setMessageType('success');
      setErrorFields([]);
      refetchStudents();
      setNewStudent({ name: '', surname: '', parentName: '', parentEmail: '', parentPhone: '', grade: '' });
      setFormVisible(false);
    } catch (error) {
      console.error('Error creating student:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || t('errorCreatingStudent'));
      setMessageType('error');
      if (error.response?.status === 400 && error.response?.data?.missingFields) {
        setErrorFields(error.response.data.missingFields);
      } else {
        setErrorFields([]);
      }
      setLoading(false);
    }
  };

  const promptDeleteStudent = (student) => {
    setStudentToDelete(student);
    setConfirmDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    
    try {
      setLoading(true);
      setConfirmDialogOpen(false);
      
      await deleteStudent(`http://localhost:5001/api/students/by-id/${studentToDelete.id}`);
      setMessage(t('studentDeletedSuccessfully'));
      setMessageType('success');
      refetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      setMessage(t('errorDeletingStudent'));
      setMessageType('error');
      setLoading(false);
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  const toggleForm = () => {
    setFormVisible(!formVisible);
  };

  // Group students by grade
  const studentsByGrade = useMemo(() => {
    return filteredStudents.reduce((groups, student) => {
      const grade = student.grade || t('noGradeAssigned');
      if (!groups[grade]) {
        groups[grade] = [];
      }
      groups[grade].push(student);
      return groups;
    }, {});
  }, [filteredStudents, t]);

  const debouncedFetchStudents = useCallback(createDebouncedClickHandler(refetchStudents, 300), [refetchStudents]);

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('StudentManagement')}
        </Typography>
      </motion.div>

      {message && (
        <Fade in={!!message}>
          <Alert 
            severity={messageType}
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        </Fade>      )}

      <SearchPaper elevation={0} themeMode={themeMode}>
        <SearchIcon color="action" sx={{ mr: 1 }} />
        <InputBase
          fullWidth
          placeholder={t('searchStudentsPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button 
          color="primary"
          onClick={toggleForm}
          startIcon={formVisible ? <ExpandLessIcon /> : <AddIcon />}
        >
          {formVisible ? t('hideForm') : t('addStudent')}
        </Button>
      </SearchPaper>

      <Collapse in={formVisible}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}        >
          <FormPaper elevation={0} themeMode={themeMode}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <PersonAddIcon sx={{ mr: 1 }} /> {t('AddNewStudent')}
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  label={t('Name')}
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  error={errorFields.includes('name')}
                  helperText={errorFields.includes('name') ? t('fieldRequired') : ''}                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  label={t('Surname')}
                  value={newStudent.surname}
                  onChange={(e) => setNewStudent({ ...newStudent, surname: e.target.value })}
                  error={errorFields.includes('surname')}
                  helperText={errorFields.includes('surname') ? t('fieldRequired') : ''}                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  label={t('ParentName')}
                  value={newStudent.parentName}
                  onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                  error={errorFields.includes('parentName')}
                  helperText={errorFields.includes('parentName') ? t('fieldRequired') : ''}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  label={t('ParentEmail')}
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                  error={errorFields.includes('parentEmail')}
                  helperText={errorFields.includes('parentEmail') ? t('fieldRequired') : ''}                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  label={t('ParentPhone')}
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  error={errorFields.includes('parentPhone')}
                  helperText={errorFields.includes('parentPhone') ? t('fieldRequired') : ''}                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid><Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  select
                  label={t('Grade')}
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  error={errorFields.includes('grade')}
                  helperText={errorFields.includes('grade') ? t('fieldRequired') : ''}                  InputProps={{
                    startAdornment: <InputAdornment position="start"><GradeIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                >
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map((grade) => (
                    <MenuItem key={grade} value={grade}>
                      {t('Grade')} {grade}
                    </MenuItem>
                  ))}
                </StyledTextField>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  type="date"
                  label={t('DateOfBirth')}
                  value={newStudent.dateOfBirth}
                  onChange={(e) => setNewStudent({ ...newStudent, dateOfBirth: e.target.value })}
                  InputLabelProps={{ shrink: true }}                  InputProps={{
                    startAdornment: <InputAdornment position="start"><CalendarTodayIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >                <Button
                  variant="contained"
                  onClick={handleCreateStudent}
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  sx={{ 
                    py: 1.2, 
                    px: 4,
                    borderRadius: 8,
                    background: themeMode?.theme === 'dark'
                      ? 'linear-gradient(90deg, #3462D8 0%, #7C4DFF 100%)'
                      : 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    letterSpacing: '0.01em',
                    fontWeight: 600,
                    boxShadow: themeMode?.theme === 'dark'
                      ? '0 6px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                      : '0 6px 16px rgba(0, 0, 0, 0.15)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '100%',
                      background: 'linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                      boxShadow: themeMode?.theme === 'dark'
                        ? '0 8px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08)'
                        : '0 8px 20px rgba(0, 0, 0, 0.2)',
                      transform: 'translateY(-2px)',
                      '&::after': {
                        opacity: 1,
                      }
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                      boxShadow: themeMode?.theme === 'dark'
                        ? '0 3px 10px rgba(0, 0, 0, 0.5)'
                        : '0 3px 10px rgba(0, 0, 0, 0.15)',
                    },
                    '& .MuiButton-startIcon': {
                      transition: 'transform 0.2s ease',
                    },
                    '&:hover .MuiButton-startIcon': {
                      transform: 'rotate(10deg)',
                    },
                    '&.Mui-disabled': {
                      background: themeMode?.theme === 'dark'
                        ? 'linear-gradient(90deg, #2a4398 0%, #5a3db8 100%)'
                        : undefined,
                      opacity: 0.7,
                    }
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : t('AddStudent')}
                </Button>
              </motion.div>
            </Box>
          </FormPaper>
        </motion.div>
      </Collapse>      <Box sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
        <SchoolIcon sx={{ 
          mr: 1, 
          color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : 'primary.main' 
        }} />
        <Typography 
          variant="h6" 
          fontWeight="bold"
          sx={{
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
          }}
        >
          {t('StudentsList')} 
          <Typography 
            component="span" 
            sx={{ 
              fontWeight: 'normal', 
              ml: 1, 
              fontSize: '1rem',
              color: themeMode?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
            }}
          >
            ({filteredStudents.length} {t('students')})
          </Typography>
        </Typography>
      </Box>

      {loading && !students.length ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      ) : filteredStudents.length > 0 ? (
        <Grid container spacing={3}>
          {Object.entries(studentsByGrade).map(([grade, studentsInGrade]) => (
            <Grid item xs={12} key={grade}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}              >                <ListPaper elevation={0} themeMode={themeMode}>                <Box sx={{ 
                    px: 3, 
                    py: 2, 
                    bgcolor: themeMode?.theme === 'dark' 
                      ? 'rgba(77, 125, 255, 0.30)' 
                      : 'primary.50', 
                    color: themeMode?.theme === 'dark' 
                      ? '#ffffff' 
                      : 'inherit',
                    borderBottom: themeMode?.theme === 'dark' 
                      ? '1px solid rgba(77, 125, 255, 0.4)' 
                      : '1px solid rgba(25, 118, 210, 0.15)',
                    borderTopLeftRadius: 16,
                    borderTopRightRadius: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backdropFilter: themeMode?.theme === 'dark' ? 'blur(5px)' : 'none',
                    boxShadow: themeMode?.theme === 'dark' ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                  }}>
                    <Typography variant="h6" fontWeight="medium" sx={{
                      textShadow: themeMode?.theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                    }}>
                      {t('Grade')}: {grade}
                      <Chip 
                        label={`${studentsInGrade.length} ${t('students')}`} 
                        size="small" 
                        sx={{ 
                          ml: 2, 
                          bgcolor: themeMode?.theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.25)' 
                            : 'white', 
                          color: themeMode?.theme === 'dark' 
                            ? '#ffffff' 
                            : 'inherit',
                          fontWeight: 600,
                          borderRadius: '12px',
                          border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
                          boxShadow: themeMode?.theme === 'dark' ? '0 1px 4px rgba(0, 0, 0, 0.2)' : 'none',
                          letterSpacing: '0.01em',
                        }}
                      />
                    </Typography>
                    <Box></Box>
                  </Box>
                  <List sx={{ p: 0 }}>
                    {studentsInGrade.map((student, index) => (
                      <React.Fragment key={student.id}>                        <ListItem 
                          sx={{ 
                            py: 2, 
                            px: 3,
                            transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                            '&:hover': {
                              bgcolor: themeMode?.theme === 'dark' 
                                ? 'rgba(255, 255, 255, 0.1)' 
                                : 'rgba(0, 0, 0, 0.03)',
                              transform: 'translateY(-2px)',
                              boxShadow: themeMode?.theme === 'dark'
                                ? '0 3px 10px rgba(0, 0, 0, 0.3)'
                                : '0 2px 8px rgba(0, 0, 0, 0.08)',
                            }
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: themeMode?.theme === 'dark' 
                                ? 'rgba(77, 125, 255, 0.95)' 
                                : 'primary.main',
                              boxShadow: themeMode?.theme === 'dark' 
                                ? '0 2px 8px rgba(77, 125, 255, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)' 
                                : '0 2px 6px rgba(0, 0, 0, 0.15)',
                              color: '#ffffff',
                              fontWeight: 'bold',
                              transform: 'scale(1.1)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.15)',
                                boxShadow: themeMode?.theme === 'dark' 
                                  ? '0 3px 10px rgba(77, 125, 255, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.2)' 
                                  : '0 3px 8px rgba(0, 0, 0, 0.2)',
                              }
                            }}>
                              {student.name.charAt(0)}{student.surname.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="medium" sx={{
                                color: themeMode?.theme === 'dark' ? '#ffffff' : 'inherit',
                                textShadow: themeMode?.theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.3)' : 'none',
                                letterSpacing: '0.01em',
                                fontSize: '1rem',
                              }}>
                                {student.name} {student.surname}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{
                                color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.85)' : 'text.secondary',
                                mt: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                '& .MuiSvgIcon-root': {
                                  fontSize: '0.9rem',
                                  opacity: themeMode?.theme === 'dark' ? 0.8 : 0.6,
                                }
                              }}>
                                <BadgeIcon fontSize="small" /> ID: {student.id}
                              </Typography>
                            }
                          />                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title={t('viewStudentDetails')} arrow placement="top">
                              <IconButton 
                                edge="end" 
                                onClick={() => handleViewStudent(student)}
                                sx={{
                                  color: themeMode?.theme === 'dark' 
                                    ? '#4d7dff' 
                                    : 'primary.main',
                                  backgroundColor: themeMode?.theme === 'dark' 
                                    ? 'rgba(77, 125, 255, 0.15)' 
                                    : 'rgba(25, 118, 210, 0.08)',
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                  '&:hover': {
                                    backgroundColor: themeMode?.theme === 'dark' 
                                      ? 'rgba(77, 125, 255, 0.25)' 
                                      : 'rgba(25, 118, 210, 0.12)',
                                    transform: 'scale(1.1)',
                                    boxShadow: themeMode?.theme === 'dark'
                                      ? '0 2px 8px rgba(77, 125, 255, 0.4)'
                                      : '0 2px 6px rgba(25, 118, 210, 0.2)',
                                  },
                                  '&:active': {
                                    transform: 'scale(0.95)',
                                  }
                                }}
                              >
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Delete')} arrow placement="top">
                              <span>
                                <IconButton 
                                  edge="end" 
                                  onClick={() => promptDeleteStudent(student)}
                                  sx={{
                                    color: themeMode?.theme === 'dark' ? '#f44336' : 'error.main',
                                    backgroundColor: themeMode?.theme === 'dark' 
                                      ? 'rgba(244, 67, 54, 0.15)' 
                                      : 'rgba(244, 67, 54, 0.08)',
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                      backgroundColor: themeMode?.theme === 'dark' 
                                        ? 'rgba(244, 67, 54, 0.25)' 
                                        : 'rgba(244, 67, 54, 0.12)',
                                      transform: 'scale(1.1)',
                                      boxShadow: themeMode?.theme === 'dark'
                                        ? '0 2px 8px rgba(244, 67, 54, 0.4)'
                                        : '0 2px 6px rgba(244, 67, 54, 0.2)',
                                    },
                                    '&:active': {
                                      transform: 'scale(0.95)',
                                    }
                                  }}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </ListItem>                        {index < studentsInGrade.length - 1 && 
                          <Divider 
                            component="li" 
                            sx={{
                              borderColor: themeMode?.theme === 'dark' 
                                ? 'rgba(255, 255, 255, 0.12)' 
                                : 'rgba(0, 0, 0, 0.12)',
                              mx: 3,
                              my: 0.5,
                              opacity: themeMode?.theme === 'dark' ? 0.8 : 0.5,
                            }}
                          />
                        }
                      </React.Fragment>
                    ))}
                  </List>
                </ListPaper>
              </motion.div>
            </Grid>
          ))}
        </Grid>      ) : (        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            background: themeMode?.theme === 'dark' 
              ? 'rgba(37, 42, 52, 0.95)' 
              : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            textAlign: 'center',
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
            boxShadow: themeMode?.theme === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 8px 32px rgba(0, 0, 0, 0.05)',
            border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <SearchIcon sx={{ 
            fontSize: 48, 
            color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
            mb: 1,
          }} />
          <Typography variant="h6" sx={{ 
            color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {t('noStudentsFound')}
          </Typography>
          <Typography variant="body2" sx={{ 
            color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'text.secondary',
            maxWidth: 400,
            mt: 1,
          }}>
            {t('tryAdjustingSearchCriteria')}
          </Typography>
        </Paper>
      )}      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 1,
            backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.98)' : 'white',
            color: themeMode?.theme === 'dark' ? '#ffffff' : 'inherit',
            boxShadow: themeMode?.theme === 'dark' 
              ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
            border: themeMode?.theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
            backdropFilter: 'blur(12px)',
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: themeMode?.theme === 'dark' 
                ? 'linear-gradient(90deg, #f44336 30%, #ff9800 100%)' 
                : 'linear-gradient(90deg, #f44336 30%, #ff9800 100%)',
            }
          }
        }}
        TransitionComponent={Fade}
        transitionDuration={300}
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(4px)',
            backgroundColor: themeMode?.theme === 'dark' 
              ? 'rgba(0, 0, 0, 0.7)' 
              : 'rgba(0, 0, 0, 0.5)',
          }
        }}
      >
        <DialogTitle sx={{
          color: themeMode?.theme === 'dark' ? '#ffffff' : 'inherit',
          fontWeight: 600,
          pt: 3,
          pb: 1,
          fontSize: '1.25rem',
        }}>{t('confirmDeletion')}</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{
            color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'text.secondary',
            fontSize: '1rem',
            my: 1
          }}>
            {studentToDelete && 
              t('confirmStudentDeletion', { 
                name: `${studentToDelete.name} ${studentToDelete.surname}` 
              })
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="primary"
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'primary.main',
              color: themeMode?.theme === 'dark' ? '#ffffff' : 'primary.main',
              px: 2.5,
              py: 0.8,
              textTransform: 'none',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
                backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : undefined,
                transform: 'translateY(-1px)',
                boxShadow: themeMode?.theme === 'dark' ? '0 3px 8px rgba(0, 0, 0, 0.3)' : undefined,
              }
            }}
          >
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
            sx={{ 
              borderRadius: 2,
              px: 2.5,
              py: 0.8,
              textTransform: 'none',
              fontWeight: 500,
              boxShadow: themeMode?.theme === 'dark' ? '0 4px 12px rgba(244, 67, 54, 0.3)' : undefined,
              background: themeMode?.theme === 'dark' 
                ? 'linear-gradient(90deg, #f44336 30%, #ff5252 100%)' 
                : undefined,
              transition: 'all 0.2s ease',
              '&:hover': {
                boxShadow: themeMode?.theme === 'dark' ? '0 6px 16px rgba(244, 67, 54, 0.4)' : undefined,
                transform: 'translateY(-1px)',
                background: themeMode?.theme === 'dark' 
                  ? 'linear-gradient(90deg, #d32f2f 30%, #f44336 100%)' 
                  : undefined,
              }
            }}
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>

      {selectedStudent && (
        <StudentDetailsModal
          studentId={selectedStudent.id}
          onClose={closeModal}
        />
      )}
    </Box>
  );
}

export default StudentManagement;





