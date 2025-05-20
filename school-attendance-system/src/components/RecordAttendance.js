// RecordAttendance.js
import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import axios from 'axios';
import './RecordAttendance.css';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ThemeContext, themes } from '../utils/themeContext';
import { createDebouncedClickHandler } from '../utils/debounceUtils';
import DOMPurify from 'dompurify';
import apiService from '../services/apiService';
import {
  Box, 
  Typography, 
  Paper, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Alert,
  Fade,
  CircularProgress,
  Chip,
  Grid,
  Card,
  CardContent,
  ButtonGroup,
  useTheme
} from '@mui/material';
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  Schedule as LateIcon,
  Save as SaveIcon,
  Class as ClassIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
// Import storageUtils only once
import storageUtils from '../utils/storageUtils';

const StyledTableContainer = styled(TableContainer)(({ theme, themeMode }) => ({
  maxHeight: '60vh',
  borderRadius: 16,
  backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.8)' : 'white',
  '&::-webkit-scrollbar': {
    width: '10px',
    height: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: themeMode?.theme === 'dark' ? '#555' : '#d1d1d1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-track': {
    background: themeMode?.theme === 'dark' ? '#333' : '#f1f1f1',
    borderRadius: '10px',
  },
}));

const StatusChip = styled(Chip)(({ status, theme, themeMode }) => {
  let color = 'primary';
  if (status === 'Absent') color = 'error';
  if (status === 'Late') color = 'warning';

  return {
    fontWeight: 600,
    color: status === 'Present' ? theme.palette.primary.main : status === 'Absent' ? theme.palette.error.main : theme.palette.warning.main,
    backgroundColor: status === 'Present' 
      ? themeMode?.theme === 'dark' ? 'rgba(41, 99, 255, 0.2)' : 'rgba(41, 99, 255, 0.1)' 
      : status === 'Absent' 
      ? themeMode?.theme === 'dark' ? 'rgba(211, 47, 47, 0.2)' : 'rgba(211, 47, 47, 0.1)'
      : themeMode?.theme === 'dark' ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)', 
  };
});

const ActionButton = styled(Button)(({ theme, themeMode }) => ({
  borderRadius: 8,
  padding: '8px 16px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: 'none',
  backgroundColor: themeMode?.theme === 'dark' ? 'rgba(41, 99, 255, 0.15)' : undefined,
  '&:hover': {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(41, 99, 255, 0.25)' : undefined,
  },
}));

const POLLING_INTERVAL = 5 * 60 * 1000; // 5 minutes instead of 1 minute

function RecordAttendance() {
  const { t } = useTranslation();
  const theme = useTheme();
  const themeMode = useContext(ThemeContext);
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  const fetchGrades = useCallback(async () => {
    try {
      // Check in cache first
      const cacheKey = 'grades-list';
      const cachedGrades = storageUtils.getCachedApiResponse(cacheKey);
      
      if (cachedGrades) {
        setGrades(cachedGrades);
        return;
      }
      
      // If not in cache, fetch from API using apiService
      const gradesData = await apiService.get('/grades');
      
      setGrades(gradesData);
      
      // Cache the response for 1 hour (grades don't change often)
      storageUtils.cacheApiResponse(cacheKey, gradesData, 60);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setMessage(t('errorFetchingGrades'));
      setMessageType('error');
      
      // If the error is auth-related, try to refresh token using apiService
      if (error.response && error.response.status === 401) {
        try {
          await apiService.post('/auth/refresh-token', {});
          // Try again after refreshing token
          fetchGrades();
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          // Redirect to login if refresh fails
          window.location.href = '/login';
        }
      }
    }
  }, [t]);

  const fetchStudents = useCallback(async () => {
    if (!selectedGrade) return;
    
    try {
      setLoading(true);
      
      // Check if we recently updated (within last 30 seconds)
      if (lastUpdateTime && Date.now() - lastUpdateTime < 30000) {
        setLoading(false);
        return;
      }
      
      // Try to get from cache first
      const cacheKey = `students-by-grade-${selectedGrade}`;
      const cachedStudents = storageUtils.getCachedApiResponse(cacheKey);
      
      if (cachedStudents) {
        const studentsWithAttendance = cachedStudents.map(student => ({
          ...student,
          status: 'Present' // Default status
        }));
        
        setStudents(studentsWithAttendance);
        setAttendanceRecords(studentsWithAttendance.map(student => ({
          studentId: student.id,
          status: 'Present'
        })));
        setLoading(false);
        setLastUpdateTime(Date.now());
        return;
      }

      // If not in cache, fetch from API using apiService
      const studentsData = await apiService.get(`/students/byGrade/${selectedGrade}`);
      
      // Cache the response for longer (30 minutes since attendance doesn't change frequently)
      storageUtils.cacheApiResponse(cacheKey, studentsData, 30);
      
      const studentsWithAttendance = studentsData.map(student => ({
        ...student,
        status: 'Present'
      }));
      
      setStudents(studentsWithAttendance);
      setAttendanceRecords(studentsWithAttendance.map(student => ({
        studentId: student.id,
        status: 'Present'
      })));
      setLastUpdateTime(Date.now());
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage(t('errorFetchingStudents'));
      setMessageType('error');
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        try {
          await apiService.post('/auth/refresh-token', {});
          // Try fetching again after token refresh
          fetchStudents();
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          // Redirect to login if refresh fails
          window.location.href = '/login';
        }
      }
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, t, lastUpdateTime]);

  useEffect(() => {
    fetchGrades();
  }, [fetchGrades]);

  useEffect(() => {
    if (selectedGrade) {
      fetchStudents();
      
      // Set up polling interval with longer delay
      const pollingInterval = setInterval(() => {
        // Only fetch if the component is visible/active
        if (document.visibilityState === 'visible') {
          fetchStudents();
        }
      }, POLLING_INTERVAL);
      
      // Add visibility change listener
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          // Fetch when tab becomes visible if enough time has passed
          if (!lastUpdateTime || Date.now() - lastUpdateTime > POLLING_INTERVAL) {
            fetchStudents();
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(pollingInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [selectedGrade, fetchStudents, lastUpdateTime]);

  // Create debounced status change handler
  const handleStatusChange = useCallback((studentId, status) => {
    // Sanitize status input
    const sanitizedStatus = DOMPurify.sanitize(status);
    
    setAttendanceRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.studentId === studentId ? { ...record, status: sanitizedStatus } : record
      )
    );
  }, []);

  // Create a debounced version for UI events
  const debouncedStatusChange = useCallback((studentId, status) => {
    const debouncedHandler = createDebouncedClickHandler(
      () => handleStatusChange(studentId, status),
      300
    );
    debouncedHandler();
  }, [handleStatusChange]);

  // Create debounced mark all function
  const markAll = useCallback((status) => {
    const sanitizedStatus = DOMPurify.sanitize(status);
    
    setAttendanceRecords((prevRecords) =>
      prevRecords.map((record) => ({ ...record, status: sanitizedStatus }))
    );
  }, []);

  // Create a debounced version for "Mark All" button
  const debouncedMarkAll = useCallback((status) => {
    const debouncedHandler = createDebouncedClickHandler(
      () => markAll(status),
      300
    );
    debouncedHandler();
  }, [markAll]);

  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      
      const data = {
        date: new Date().toISOString().split('T')[0],
        grade: selectedGrade,
        records: attendanceRecords,      };
        // Use apiService instead of direct axios call
      await apiService.post('/attendance', data);
      
      setMessage(t('attendanceRecordedSuccessfully'));
      setMessageType('success');
      
      // Invalidate cache for attendance data
      storageUtils.clearApiCache('attendance');
    } catch (error) {
      console.error('Error recording attendance:', error.response?.data || error.message);
      setMessage(
        error.response?.data?.message || t('errorRecordingAttendance')
      );
      setMessageType('error');
      
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        try {
          // Use apiService for token refresh instead of direct axios call          await apiService.post('/auth/refresh-token', {});
          
          // Try again after refreshing token
          handleSubmit();
        } catch (refreshError) {
          console.error('Error refreshing token:', refreshError);
          window.location.href = '/login';
        }
      }
    } finally {
      setLoading(false);
    }
  }, [attendanceRecords, selectedGrade, t]);

  // Memoize attendance stats for performance
  const attendanceStats = useMemo(() => {
    return {
      presentCount: attendanceRecords.filter(record => record.status === 'Present').length,
      absentCount: attendanceRecords.filter(record => record.status === 'Absent').length,
      lateCount: attendanceRecords.filter(record => record.status === 'Late').length,
      totalCount: attendanceRecords.length
    };
  }, [attendanceRecords]);
  
  return (
    <Box sx={{ p: 3, maxWidth: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          {t('RecordAttendance')}
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
      )}      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 4,
          background: themeMode?.theme === 'dark' 
            ? 'rgba(37, 42, 52, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
        }}
      >
        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="grade-select-label">{t('SelectGrade')}</InputLabel>
          <Select
            labelId="grade-select-label"
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            label={t('SelectGrade')}
            startAdornment={<ClassIcon sx={{ mr: 1, color: 'primary.main' }} />}
          >
            <MenuItem value="">{t('selectAGrade')}</MenuItem>
            {grades.map((grade) => (
              <MenuItem key={grade} value={grade}>
                {grade}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedGrade && !loading && (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >                  <Card sx={{ 
                    bgcolor: themeMode?.theme === 'dark' ? 'rgba(41, 99, 255, 0.15)' : 'primary.50', 
                    borderRadius: 4,
                    boxShadow: themeMode?.theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary">{t('Present')}</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {attendanceStats.presentCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >                  <Card sx={{ 
                    bgcolor: themeMode?.theme === 'dark' ? 'rgba(211, 47, 47, 0.15)' : 'error.50', 
                    borderRadius: 4,
                    boxShadow: themeMode?.theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary">{t('Absent')}</Typography>
                      <Typography variant="h4" fontWeight="bold" color="error.main">
                        {attendanceStats.absentCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >                  <Card sx={{ 
                    bgcolor: themeMode?.theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'warning.50', 
                    borderRadius: 4,
                    boxShadow: themeMode?.theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" color="text.secondary">{t('Late')}</Typography>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {attendanceStats.lateCount}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', mb: 3, gap: 2, flexWrap: 'wrap' }}>
              <ButtonGroup variant="outlined" sx={{ borderRadius: 2 }}>
                <ActionButton 
                  onClick={() => debouncedMarkAll('Present')}
                  startIcon={<PresentIcon />}
                  color="primary"
                >
                  {t('MarkAllPresent')}
                </ActionButton>
                <ActionButton 
                  onClick={() => debouncedMarkAll('Absent')}
                  startIcon={<AbsentIcon />}
                  color="error"
                >
                  {t('MarkAllAbsent')}
                </ActionButton>
                <ActionButton 
                  onClick={() => debouncedMarkAll('Late')}
                  startIcon={<LateIcon />}
                  color="warning"
                >
                  {t('MarkAllLate')}
                </ActionButton>
              </ButtonGroup>
            </Box>

            <StyledTableContainer component={Paper} elevation={0} themeMode={themeMode}>
              <Table stickyHeader>                <TableHead><TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                    }}>
                      {t('StudentName')}
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                    }}>
                      {t('Status')}
                    </TableCell>                  </TableRow>
                </TableHead>
                <TableBody>{attendanceRecords.map((record) => {
                    const student = students.find((s) => s.id === record.studentId);
                    return (<TableRow 
                        key={record.studentId}
                        sx={{ 
                          '&:nth-of-type(odd)': { 
                            backgroundColor: themeMode?.theme === 'dark' 
                              ? 'rgba(255, 255, 255, 0.02)' 
                              : 'rgba(0, 0, 0, 0.02)' 
                          },
                          '&:hover': { 
                            backgroundColor: themeMode?.theme === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.04)' 
                          } 
                        }}
                      >                        <TableCell sx={{ color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit' }}>
                          {student ? `${student.name} ${student.surname}` : t('UnknownStudent')}
                        </TableCell>
                        <TableCell sx={{ color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit' }}>                          <Select
                            value={record.status}
                            onChange={(e) => debouncedStatusChange(record.studentId, e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              minWidth: 140,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined
                              },
                              '& .MuiSvgIcon-root': {
                                color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined
                              }
                            }}
                            renderValue={(selected) => (                              <StatusChip
                                label={t(selected)}
                                status={selected}
                                size="small"
                                themeMode={themeMode}
                              />
                            )}
                            MenuProps={{
                              PaperProps: {
                                sx: {
                                  backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.background.paper : 'white',
                                  '& .MuiMenuItem-root': {
                                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
                                  },
                                  '& .MuiMenuItem-root:hover': {
                                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
                                  }
                                }
                              }
                            }}
                          >
                            <MenuItem value="Present">{t('Present')}</MenuItem>
                            <MenuItem value="Absent">{t('Absent')}</MenuItem>
                            <MenuItem value="Late">{t('Late')}</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </StyledTableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ 
                    py: 1.5, 
                    px: 5, 
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #4776E6 0%, #8E54E9 100%)',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : t('SubmitAttendance')}
                </Button>
              </motion.div>
            </Box>
          </>
        )}

        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress size={60} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default RecordAttendance;




