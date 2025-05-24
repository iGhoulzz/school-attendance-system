// src/components/TeacherManagement.js
import React, { useState, useEffect, useCallback, useContext, useMemo, useRef } from 'react';
import './TeacherManagement.css';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ThemeContext, themes } from '../utils/themeContext';
import { useApiData, useApiPost, useApiDelete } from '../hooks/useApiData';
import { createDebouncedClickHandler } from '../utils/debounceUtils';
import { debounce, throttle } from 'lodash';
import DOMPurify from 'dompurify';
import {
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  IconButton, 
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
  Stack
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Save as SaveIcon,
  School as SchoolIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledMotionDiv = styled(motion.div, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(() => ({
  // No specific styling needed, just filtering the prop
}));

const FormPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  background: themeMode?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: themeMode?.theme === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
    : '0 8px 32px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(4)
}));

const ListPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  background: themeMode?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: themeMode?.theme === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
    : '0 8px 32px rgba(0, 0, 0, 0.05)'
}));

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
      borderWidth: 2
    },
    '& fieldset': {
      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
    },
    '& .MuiInputBase-input': {
      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
    },
  },  '& .MuiInputLabel-root': {
    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    '&.Mui-focused': {
      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
    },
  }
}));

const ActionButton = styled(Button, {
  shouldForwardProp: (prop) => !['themeMode', 'variant'].includes(prop)
})(({ theme, themeMode, variant }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  color: themeMode?.theme === 'dark' && variant === 'outlined'
    ? themes.dark.colors.text.primary 
    : undefined,
  borderColor: themeMode?.theme === 'dark' && variant === 'outlined'
    ? 'rgba(255, 255, 255, 0.3)' 
    : undefined,
  '&:hover': {
    boxShadow: themeMode?.theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderColor: themeMode?.theme === 'dark' && variant === 'outlined'
      ? 'rgba(255, 255, 255, 0.5)' 
      : undefined,
    backgroundColor: themeMode?.theme === 'dark' && variant === 'outlined'
      ? 'rgba(255, 255, 255, 0.05)' 
      : undefined,
  },
}));

// Function to convert teachers array to a string for memoization comparison
const teachersToString = (teachers) => {
  if (!Array.isArray(teachers)) return '';
  return teachers.map(t => `${t._id}-${t.name}-${t.surname}`).join('|');
};

// Memoized TeachersList component to prevent unnecessary re-renders
const TeachersList = React.memo(
  ({ 
    teachers = [], 
    onDeleteClick, 
    themeMode 
  }) => {
    const { t } = useTranslation();
    
    if (!Array.isArray(teachers) || teachers.length === 0) {
      return (
        <Box p={4} textAlign="center">
          <Typography sx={{
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
          }}>
            {t('noTeachersFound')}
          </Typography>
        </Box>
      );
    }
      return (
      <List sx={{ p: 0 }}>
        {teachers.map((teacher, index) => (
          <React.Fragment key={teacher._id}>
            <ListItem sx={{ py: 2, px: 3 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="medium" sx={{
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
                  }}>
                    {teacher.name} {teacher.surname}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
                  }}>
                    {teacher.email}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title={t('Delete')}>
                  <span>
                    <IconButton 
                      edge="end" 
                      onClick={() => onDeleteClick(teacher)}
                      sx={{
                        color: themeMode?.theme === 'dark' ? '#f44336' : 'error.main'
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
            {index < teachers.length - 1 && <Divider 
              component="li" 
              sx={{
                borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined
              }}
            />}
          </React.Fragment>
        ))}
      </List>
    );
  },  // Custom comparison function for memoization
  (prevProps, nextProps) => {
    const prevTeachers = Array.isArray(prevProps.teachers) ? prevProps.teachers : [];
    const nextTeachers = Array.isArray(nextProps.teachers) ? nextProps.teachers : [];
    return teachersToString(prevTeachers) === teachersToString(nextTeachers) &&
           prevProps.themeMode?.theme === nextProps.themeMode?.theme;
  }
);

// Filter teachers by search query with sanitization and memoization
const useFilteredTeachers = (teachers, searchQuery) => {
  return useMemo(() => {
    if (!Array.isArray(teachers)) return [];
    if (!searchQuery.trim()) return teachers;
    
    // Sanitize the search query to prevent XSS
    const sanitizedQuery = DOMPurify.sanitize(searchQuery.toLowerCase());
    
    return teachers.filter((teacher) => {
      const fullName = `${teacher.name} ${teacher.surname}`.toLowerCase();
      const email = teacher.email.toLowerCase();
      
      return fullName.includes(sanitizedQuery) || email.includes(sanitizedQuery);
    });
  }, [teachers, searchQuery]);
};

function TeacherManagement() {
  const { t } = useTranslation();
  const themeMode = useContext(ThemeContext);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Use our custom hooks for API data with proper default value
  const { 
    data: teachers = [], 
    loading, 
    refetch: fetchTeachers 
  } = useApiData('/teachers', { 
    cacheExpiryMinutes: 5 // Cache teacher list for 5 minutes
  });

  // Create a throttled function to fetch teachers to avoid excessive API calls
  const throttledFetchTeachers = useRef(
    throttle(fetchTeachers, 30000, { trailing: true })
  ).current;

  // Use the throttled function in useEffect to prevent API hammering
  useEffect(() => {
    throttledFetchTeachers();
    
    // Optional visibility change listener to refresh when tab becomes visible
    const onVisible = () => {
      if (!document.hidden) {
        throttledFetchTeachers();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []); // Empty deps array = run only once on mount

  const { postData, posting: creatingTeacher } = useApiPost();
  const { deleteData, deleting: deletingTeacher } = useApiDelete();
  // Create a debounced version of the create teacher function
  const handleCreateTeacher = async () => {
    try {
      // Validate inputs
      const requiredFields = ['name', 'surname', 'email', 'password'];
      const missingFields = requiredFields.filter(field => !newTeacher[field]);
      
      if (missingFields.length > 0) {
        setMessage(t('pleaseCompleteAllFields'));
        setMessageType('error');
        return;
      }
      
      // Use the API service through our custom hook
      await postData('/teachers', newTeacher);
      setMessage(t('teacherCreatedSuccessfully'));
      setMessageType('success');
      
      // Refetch teachers list to update UI
      fetchTeachers();
      
      // Reset form
      setNewTeacher({ name: '', surname: '', email: '', password: '' });
    } catch (error) {
      console.error('Error creating teacher:', error);
      setMessage(error.response?.data?.message || t('errorCreatingTeacher'));
      setMessageType('error');
    }
  };
  
  // Create a debounced version of the create teacher function
  const debouncedCreateTeacher = useMemo(
    () => createDebouncedClickHandler(handleCreateTeacher, 500), 
    [handleCreateTeacher]
  );

  const promptDeleteTeacher = (teacher) => {
    setTeacherToDelete(teacher);
    setConfirmDialogOpen(true);
  };

  // Create a debounced version of the delete handler
  const debouncedPromptDeleteTeacher = useMemo(
    () => createDebouncedClickHandler(promptDeleteTeacher, 300),
    [promptDeleteTeacher]
  );

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    
    try {
      setConfirmDialogOpen(false);
      
      // Use the API service through our custom hook
      await deleteData(`/teachers/${teacherToDelete._id}`);
      setMessage(t('teacherDeletedSuccessfully'));
      setMessageType('success');
      
      // Refetch teachers list to update UI
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      setMessage(t('errorDeletingTeacher'));
      setMessageType('error');
    } finally {
      setTeacherToDelete(null);
    }
  };
  
  // Create a debounced version of the confirm delete handler
  const debouncedConfirmDelete = useMemo(
    () => createDebouncedClickHandler(handleConfirmDelete, 300),
    [handleConfirmDelete]
  );

  // Filtered teachers based on search query
  const safeTeachers = Array.isArray(teachers) ? teachers : [];
  const filteredTeachers = useFilteredTeachers(safeTeachers, searchQuery);

  const handleSearchChange = useCallback((e) => {
    // Sanitize input to prevent XSS attacks
    const sanitizedValue = DOMPurify.sanitize(e.target.value);
    setSearchQuery(sanitizedValue);
  }, []);

  // Create a debounced version of the search change handler
  const debouncedSearchChange = useMemo(
    () => {
      const debounced = debounce(handleSearchChange, 300);
      return (e) => {
        // No need to debounce this simple state update
        setSearchQuery(e.target.value);
        // But debounce any expensive operations that might follow
        debounced(e);
      };
    },
    [handleSearchChange]
  );
  return (    <Box sx={{ p: 3, maxWidth: '100%' }}>      <StyledMotionDiv
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        themeMode={themeMode}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{
          color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary
        }}>
          {t('TeacherManagement')}
        </Typography>
      </StyledMotionDiv>

      {message && (
        <Fade in={!!message}>          <Alert 
            severity={messageType}
            sx={{ 
              mb: 3, 
              borderRadius: 2,
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
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        </Fade>
      )}      <StyledMotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        themeMode={themeMode}><FormPaper elevation={0} themeMode={themeMode}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                gutterBottom                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary
                }}
              >
                <PersonAddIcon sx={{ mr: 1 }} /> {t('AddNewTeacher')}
              </Typography>
              <Typography 
                variant="body2" 
                paragraph
                sx={{
                  color: themeMode?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
                }}
              >
                {t('fillTheFormToAddNewTeacher')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>                <StyledTextField
                  fullWidth
                  label={t('FirstName')}
                  value={newTeacher.name}
                  // No need to debounce this simple state update
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}                  required
                  variant="outlined"
                  placeholder={t('enterFirstName')}
                  themeMode={themeMode}
                />
                <StyledTextField
                  fullWidth
                  label={t('Surname')}
                  value={newTeacher.surname}
                  onChange={(e) => setNewTeacher({ ...newTeacher, surname: e.target.value })}                  required
                  variant="outlined"
                  placeholder={t('enterSurname')}
                  themeMode={themeMode}
                /><StyledTextField
                  fullWidth
                  label={t('Email')}
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}                  required
                  variant="outlined"
                  type="email"
                  placeholder={t('enterEmail')}
                  themeMode={themeMode}
                  InputProps={{
                    startAdornment: <EmailIcon 
                      sx={{ 
                        mr: 1, 
                        color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'action.active' 
                      }} 
                    />
                  }}
                />
                <StyledTextField
                  fullWidth
                  label={t('Password')}
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}                  required
                  variant="outlined"
                  type="password"
                  placeholder={t('enterPassword')}
                  themeMode={themeMode}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>                  <StyledMotionDiv
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    themeMode={themeMode}
                  >
                    <Tooltip title={t('AddTeacher')}>
                      <span>                        <ActionButton
                          variant="contained"
                          onClick={debouncedCreateTeacher}
                          disabled={creatingTeacher}
                          startIcon={<SaveIcon />}
                          themeMode={themeMode}
                          sx={{ 
                            py: 1, 
                            px: 4,
                            background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                          }}
                        >
                          {creatingTeacher ? <CircularProgress size={24} /> : t('AddTeacherButton')}
                        </ActionButton>
                      </span>
                    </Tooltip>
                  </StyledMotionDiv>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </FormPaper>      </StyledMotionDiv>      <StyledMotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        themeMode={themeMode}
      ><Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon sx={{ 
            mr: 1, 
            color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : 'primary.main' 
          }} />
          <Typography variant="h6" fontWeight="bold" sx={{
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
          }}>
            {t('TeachersList')}
          </Typography>
        </Box>
        {loading && !Array.isArray(teachers) ? (          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress size={60} />
          </Box>
        ) : (          <ListPaper elevation={0} themeMode={themeMode}>
            <TeachersList 
              teachers={filteredTeachers} 
              onDeleteClick={debouncedPromptDeleteTeacher}
              themeMode={themeMode} 
            />
          </ListPaper>
        )}
      </StyledMotionDiv>      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 1,
            backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.background.paper : 'white',
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
          }
        }}
      >
        <DialogTitle sx={{
          color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
        }}>
          {t('confirmDeletion')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
          }}>
            {teacherToDelete && 
              t('confirmTeacherDeletion', { 
                name: `${teacherToDelete.name} ${teacherToDelete.surname}` 
              })
            }
          </DialogContentText>
        </DialogContent>        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="primary"
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
              color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
              '&:hover': {
                borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
                backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined,
              }
            }}
          >
            {t('Cancel')}
          </Button><Button 
            onClick={debouncedConfirmDelete} 
            color="error"
            variant="contained"
            disabled={deletingTeacher}
            sx={{ borderRadius: 2 }}
          >
            {deletingTeacher ? <CircularProgress size={24} color="inherit" /> : t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeacherManagement;




