// StudentManagement.js
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
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
  InputBase
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
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const FormPaper = styled(Paper)(({ theme, themeMode }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  background: themeMode?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: themeMode?.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
    : '0 8px 32px rgba(0, 0, 0, 0.05)',
  marginBottom: theme.spacing(4),
  color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
}));

const ListPaper = styled(Paper)(({ theme, themeMode }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  background: themeMode?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: themeMode?.theme === 'dark' 
    ? '0 8px 32px rgba(0, 0, 0, 0.2)' 
    : '0 8px 32px rgba(0, 0, 0, 0.05)',
  color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
}));

const SearchPaper = styled(Paper)(({ theme, themeMode }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0.5, 2),
  borderRadius: 50,
  marginBottom: theme.spacing(3),
  background: themeMode?.theme === 'dark' 
    ? 'rgba(37, 42, 52, 0.8)' 
    : 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  boxShadow: themeMode?.theme === 'dark' 
    ? '0 4px 20px rgba(0, 0, 0, 0.15)' 
    : '0 4px 20px rgba(0, 0, 0, 0.05)',
  color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
}));

const StyledTextField = styled(TextField)(({ theme, themeMode }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2
    },
    '& .MuiOutlinedInput-input': {
      color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.23)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.87)',
    },
  },
  '& .MuiInputLabel-root': {
    color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: theme.palette.primary.main,
  }
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1, 3),
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
}));

const StudentChip = styled(Chip)(({ theme, themeMode }) => ({
  borderRadius: 16,
  fontWeight: 600,
  backgroundColor: themeMode?.theme === 'dark' 
    ? 'rgba(41, 99, 255, 0.2)' 
    : 'rgba(25, 118, 210, 0.1)',
  color: themeMode?.theme === 'dark' ? '#8fb4ff' : theme.palette.primary.main,
  margin: theme.spacing(0.5),
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

  const { mutate: createStudent, isLoading: isCreating } = useApiPost('http://localhost:5001/api/students');
  const { mutate: deleteStudent, isLoading: isDeleting } = useApiDelete('http://localhost:5001/api/students/by-id');

  useEffect(() => {
    if (apiData) {
      setStudents(apiData);
      setMessage('');
      setMessageType('success');
    }
  }, [apiData]);

  useEffect(() => {
    const fetchStudents = async () => {
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

    fetchStudents();
  }, [refetchStudents]);
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
        return;
      }
      
      setLoading(true);
      await createStudent(newStudent);
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
      
      await deleteStudent(studentToDelete.id);
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
        </Fade>
      )}

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
          transition={{ duration: 0.5 }}
        >
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
                  helperText={errorFields.includes('name') ? t('fieldRequired') : ''}
                  InputProps={{
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
                  helperText={errorFields.includes('surname') ? t('fieldRequired') : ''}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><BadgeIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  label={t('Grade')}
                  value={newStudent.grade}
                  onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  error={errorFields.includes('grade')}
                  helperText={errorFields.includes('grade') ? t('fieldRequired') : ''}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SchoolIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
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
                  type="email"
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                  error={errorFields.includes('parentEmail')}
                  helperText={errorFields.includes('parentEmail') ? t('fieldRequired') : ''}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>                <StyledTextField
                  fullWidth
                  label={t('ParentPhone')}
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  error={errorFields.includes('parentPhone')}
                  helperText={errorFields.includes('parentPhone') ? t('fieldRequired') : ''}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment>,
                  }}
                  themeMode={themeMode}
                />
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  onClick={handleCreateStudent}
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  sx={{ 
                    py: 1, 
                    px: 4,
                    borderRadius: 8,
                    background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : t('AddStudent')}
                </Button>
              </motion.div>
            </Box>
          </FormPaper>
        </motion.div>
      </Collapse>

      <Box sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center' }}>
        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold">
          {t('StudentsList')} 
          <Typography component="span" color="text.secondary" sx={{ fontWeight: 'normal', ml: 1, fontSize: '1rem' }}>
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
                transition={{ duration: 0.5 }}
              >
                <ListPaper elevation={0} themeMode={themeMode}>                  <Box sx={{ px: 3, py: 2, bgcolor: themeMode?.theme === 'dark' ? 'rgba(41, 99, 255, 0.1)' : 'primary.50', color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit' }}>
                    <Typography variant="h6" fontWeight="medium">
                      {t('Grade')}: {grade}
                      <Chip 
                        label={`${studentsInGrade.length} ${t('students')}`} 
                        size="small" 
                        sx={{ ml: 2, bgcolor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'white', color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit' }}
                      />
                    </Typography>
                  </Box>
                  <List sx={{ p: 0 }}>
                    {studentsInGrade.map((student, index) => (
                      <React.Fragment key={student.id}>
                        <ListItem sx={{ py: 2, px: 3 }}>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              {student.name.charAt(0)}{student.surname.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="medium">
                                {student.name} {student.surname}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                ID: {student.id}
                              </Typography>
                            }
                          />
                          <Box sx={{ display: 'flex' }}>
                            <Tooltip title={t('viewStudentDetails')}>
                              <IconButton 
                                edge="end" 
                                onClick={() => handleViewStudent(student)}
                                color="primary"
                              >
                                <InfoIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('Delete')}>
                              <IconButton 
                                edge="end" 
                                onClick={() => promptDeleteStudent(student)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </ListItem>
                        {index < studentsInGrade.length - 1 && <Divider component="li" />}
                      </React.Fragment>
                    ))}
                  </List>
                </ListPaper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      ) : (        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            background: themeMode?.theme === 'dark' 
              ? 'rgba(37, 42, 52, 0.8)' 
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {t('noStudentsFound')}
          </Typography>
        </Paper>
      )}

      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 1
          }
        }}
      >
        <DialogTitle>{t('confirmDeletion')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {studentToDelete && 
              t('confirmStudentDeletion', { 
                name: `${studentToDelete.name} ${studentToDelete.surname}` 
              })
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="primary"
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error"
            variant="contained"
            sx={{ borderRadius: 2 }}
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





