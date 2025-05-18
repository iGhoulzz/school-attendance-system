// src/components/TeacherManagement.js
import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import './TeacherManagement.css';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ThemeContext, themes } from '../utils/themeContext';
import { useApiData, useApiPost, useApiDelete } from '../hooks/useApiData';
import { createDebouncedClickHandler } from '../utils/debounceUtils';
import { debounce } from 'lodash';
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

const FormPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  background: themeContext?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: themeContext?.theme === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
    : '0 8px 32px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(4)
}));

const ListPaper = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  background: themeContext?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: themeContext?.theme === 'dark'
    ? '0 8px 32px rgba(0, 0, 0, 0.2)'
    : '0 8px 32px rgba(0, 0, 0, 0.05)'
}));

const StyledTextField = styled(TextField, {
  shouldForwardProp: (prop) => prop !== 'themeContext'
})(({ theme, themeContext }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: themeContext?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
      borderWidth: 2
    },
    '& fieldset': {
      borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
    },
    '& .MuiInputBase-input': {
      color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
    },
  },
  '& .MuiInputLabel-root': {
    color: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    '&.Mui-focused': {
      color: themeContext?.theme === 'dark' ? themes.dark.colors.primary : theme.palette.primary.main,
    },
  }
}));

const ActionButton = styled(Button, {
  shouldForwardProp: (prop) => !['themeContext', 'variant'].includes(prop)
})(({ theme, themeContext, variant }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  color: themeContext?.theme === 'dark' && variant === 'outlined'
    ? themes.dark.colors.text.primary 
    : undefined,
  borderColor: themeContext?.theme === 'dark' && variant === 'outlined'
    ? 'rgba(255, 255, 255, 0.3)' 
    : undefined,
  '&:hover': {
    boxShadow: themeContext?.theme === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
    borderColor: themeContext?.theme === 'dark' && variant === 'outlined'
      ? 'rgba(255, 255, 255, 0.5)' 
      : undefined,
    backgroundColor: themeContext?.theme === 'dark' && variant === 'outlined'
      ? 'rgba(255, 255, 255, 0.05)' 
      : undefined,
  },
}));

// Function to convert teachers array to a string for memoization comparison
const teachersToString = (teachers) => {
  return teachers.map(t => `${t._id}-${t.name}-${t.surname}`).join('|');
};

// Memoized TeachersList component to prevent unnecessary re-renders
const TeachersList = React.memo(
  ({ 
    teachers, 
    onDeleteClick, 
    themeContext 
  }) => {
    const { t } = useTranslation();
    
    if (teachers.length === 0) {
      return (
        <Box p={4} textAlign="center">
          <Typography sx={{
            color: themeContext?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
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
                <Avatar sx={{ bgcolor: themeContext?.theme === 'dark' ? themes.dark.colors.primary : 'primary.main' }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body1" fontWeight="medium" sx={{
                    color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
                  }}>
                    {teacher.name} {teacher.surname}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" sx={{
                    color: themeContext?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
                  }}>
                    {teacher.email}
                  </Typography>
                }
              />
              <ListItemSecondaryAction>
                <Tooltip title={t('Delete')}>
                  <IconButton 
                    edge="end" 
                    onClick={() => onDeleteClick(teacher)}
                    sx={{
                      color: themeContext?.theme === 'dark' ? '#f44336' : 'error.main'
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
            {index < teachers.length - 1 && <Divider 
              component="li" 
              sx={{
                borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : undefined
              }}
            />}
          </React.Fragment>
        ))}
      </List>
    );
  },
  // Custom comparison function for memoization
  (prevProps, nextProps) => {
    return teachersToString(prevProps.teachers) === teachersToString(nextProps.teachers) &&
           prevProps.themeContext?.theme === nextProps.themeContext?.theme;
  }
);

// Filter teachers by search query with sanitization and memoization
const useFilteredTeachers = (teachers, searchQuery) => {
  return useMemo(() => {
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
  const themeContext = useContext(ThemeContext);
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

  // Use our custom hooks for API data
  const { 
    data: teachers = [], 
    loading, 
    refetch: fetchTeachers 
  } = useApiData('/teachers', { 
    cacheExpiryMinutes: 5 // Cache teacher list for 5 minutes
  });

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
  const filteredTeachers = useFilteredTeachers(teachers, searchQuery);

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

  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{
          color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary
        }}>
          {t('TeacherManagement')}
        </Typography>
      </motion.div>

      {message && (
        <Fade in={!!message}>
          <Alert 
            severity={messageType}
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              backgroundColor: themeContext?.theme === 'dark' 
                ? (messageType === 'success' ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)')
                : undefined,
              color: themeContext?.theme === 'dark' 
                ? themes.dark.colors.text.primary 
                : undefined,
              '& .MuiAlert-icon': {
                color: themeContext?.theme === 'dark'
                  ? (messageType === 'success' ? '#66bb6a' : '#f44336')
                  : undefined
              }
            }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        </Fade>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >        <FormPaper elevation={0} themeMode={themeContext}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary
                }}
              >
                <PersonAddIcon sx={{ mr: 1 }} /> {t('AddNewTeacher')}
              </Typography>
              <Typography 
                variant="body2" 
                paragraph
                sx={{
                  color: themeContext?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
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
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  required
                  variant="outlined"
                  placeholder={t('enterFirstName')}
                  themeMode={themeContext}
                />
                <StyledTextField
                  fullWidth
                  label={t('Surname')}
                  value={newTeacher.surname}
                  onChange={(e) => setNewTeacher({ ...newTeacher, surname: e.target.value })}
                  required
                  variant="outlined"
                  placeholder={t('enterSurname')}
                  themeMode={themeContext}
                />                <StyledTextField
                  fullWidth
                  label={t('Email')}
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  required
                  variant="outlined"
                  type="email"
                  placeholder={t('enterEmail')}
                  themeMode={themeContext}
                  InputProps={{
                    startAdornment: <EmailIcon 
                      sx={{ 
                        mr: 1, 
                        color: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'action.active' 
                      }} 
                    />
                  }}
                />
                <StyledTextField
                  fullWidth
                  label={t('Password')}
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  required
                  variant="outlined"
                  type="password"
                  placeholder={t('enterPassword')}
                  themeMode={themeContext}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >                    <ActionButton
                      variant="contained"
                      onClick={debouncedCreateTeacher}
                      disabled={creatingTeacher}
                      startIcon={<SaveIcon />}
                      themeMode={themeContext}
                      sx={{ 
                        py: 1, 
                        px: 4,
                        background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                      }}
                    >
                      {creatingTeacher ? <CircularProgress size={24} /> : t('AddTeacherButton')}
                    </ActionButton>
                  </motion.div>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </FormPaper>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <SchoolIcon sx={{ 
            mr: 1, 
            color: themeContext?.theme === 'dark' ? themes.dark.colors.primary : 'primary.main' 
          }} />
          <Typography variant="h6" fontWeight="bold" sx={{
            color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
          }}>
            {t('TeachersList')}
          </Typography>
        </Box>        {loading && !teachers.length ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <ListPaper elevation={0} themeMode={themeContext}>
            <TeachersList 
              teachers={filteredTeachers} 
              onDeleteClick={debouncedPromptDeleteTeacher}
              themeContext={themeContext} 
            />
          </ListPaper>
        )}
      </motion.div>      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 1,
            backgroundColor: themeContext?.theme === 'dark' ? themes.dark.colors.background.paper : 'white',
            color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
          }
        }}
      >
        <DialogTitle sx={{
          color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
        }}>
          {t('confirmDeletion')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{
            color: themeContext?.theme === 'dark' ? themes.dark.colors.text.secondary : 'text.secondary'
          }}>
            {teacherToDelete && 
              t('confirmTeacherDeletion', { 
                name: `${teacherToDelete.name} ${teacherToDelete.surname}` 
              })
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="primary"
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined,
              color: themeContext?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
              '&:hover': {
                borderColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
                backgroundColor: themeContext?.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined,
              }
            }}
          >
            {t('Cancel')}
          </Button>          <Button 
            onClick={debouncedConfirmDelete} 
            color="error"
            variant="contained"
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




