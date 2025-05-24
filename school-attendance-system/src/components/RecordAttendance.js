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
import storageUtils from '../utils/storageUtils';
import logger from '../utils/logger';
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
// Modify the styled components to use shouldForwardProp to prevent themeMode from being passed to DOM elements
const StyledTableContainer = styled(TableContainer, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
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

const StatusChip = styled(Chip, {
  shouldForwardProp: prop => !['themeMode', 'status'].includes(prop)
})(({ status, theme, themeMode }) => {
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

const ActionButton = styled(Button, {
  shouldForwardProp: prop => prop !== 'themeMode'
})(({ theme, themeMode }) => ({
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

const POLLING_INTERVAL = 10 * 60 * 1000; // 10 minutes to reduce status resets

function RecordAttendance({ themeMode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  // Use provided themeMode from props or fallback to context
  const themeModeFromContext = useContext(ThemeContext);
  const effectiveThemeMode = themeMode || themeModeFromContext;
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [loading, setLoading] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [classId, setClassId] = useState(null);  // Helper function to get or derive a class ID from grade
  // Fixed: Removed date component to ensure stable ClassId across days
  const getClassIdFromGrade = useCallback(async (grade) => {
    try {
      if (!grade) {
        logger.error('Cannot generate classId: grade is undefined or null');
        return null;
      }
      
      // Generate a deterministic ID based on the grade only
      // This ensures the same grade always gets the same stable ID
      const classIdHash = grade.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      // Create a stable string ID without date component
      const derivedClassId = `class-${grade}-${classIdHash}`;
      
      return derivedClassId;
    } catch (error) {
      logger.error('Error getting class ID:', error);
      // Return a fallback value based on grade only
      return `fallback-class-${grade}`;
    }
  }, []);

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
      storageUtils.cacheApiResponse(cacheKey, gradesData, 60);    } catch (error) {
      logger.error('Error fetching grades:', error);
      setMessage(t('errorFetchingGrades'));
      setMessageType('error');
      
      // If the error is auth-related, try to refresh token using apiService
      if (error.response && error.response.status === 401) {
        try {
          await apiService.post('/auth/refresh-token', {});
          // Try again after refreshing token
          fetchGrades();
        } catch (refreshError) {
          logger.error('Error refreshing token:', refreshError);
          // Redirect to login if refresh fails
          window.location.href = '/login';
        }
      }
    }
  }, [t]);  // Fixed: Removed circular dependency by removing attendanceRecords from dependencies
  const fetchStudents = useCallback(async (preserveAttendance = false) => {
    if (!selectedGrade) return;
    
    try {
      setLoading(true);
      
      // Preserve existing attendance status by capturing current records BEFORE any async operations
      let currentAttendanceMap = {};
      if (preserveAttendance) {
        // Access attendanceRecords directly from the most recent state
        setAttendanceRecords(prevRecords => {
          prevRecords.forEach(record => {
            currentAttendanceMap[record.studentId] = record.status;
          });
          return prevRecords; // Return unchanged to avoid state update
        });
      }
      
      // Try to get from cache first
      const cacheKey = `students-by-grade-${selectedGrade}`;
      const cachedStudents = storageUtils.getCachedApiResponse(cacheKey);
      
      let studentsData;
      if (cachedStudents) {
        studentsData = cachedStudents;
      } else {
        // If not in cache, fetch from API using apiService
        studentsData = await apiService.get(`/students/byGrade/${selectedGrade}`);
        // Cache the response for longer (30 minutes since attendance doesn't change frequently)
        storageUtils.cacheApiResponse(cacheKey, studentsData, 30);
      }
      
      // Apply existing status if preserving, otherwise use default 'Present'
      const studentsWithAttendance = studentsData.map(student => ({
        ...student,
        status: preserveAttendance ? (currentAttendanceMap[student.id] || 'Present') : 'Present'
      }));
      
      setStudents(studentsWithAttendance);
      setAttendanceRecords(studentsWithAttendance.map(student => ({
        studentId: student.id,
        status: preserveAttendance ? (currentAttendanceMap[student.id] || 'Present') : 'Present'
      })));
      setLastUpdateTime(Date.now());
    } catch (error) {
      logger.error('Error fetching students:', error);
      setMessage(t('errorFetchingStudents'));
      setMessageType('error');
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        try {
          await apiService.post('/auth/refresh-token', {});
          // Try fetching again after token refresh
          await fetchStudents(preserveAttendance);
        } catch (refreshError) {
          logger.error('Error refreshing token:', refreshError);
          // Redirect to login if refresh fails
          window.location.href = '/login';
        }
      }
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, t]); // Removed attendanceRecords dependency to break circular dependency

  useEffect(() => {
    fetchGrades();  }, [fetchGrades]);
    // Effect for setting classId when grade changes - separated from student fetching
  useEffect(() => {
    if (selectedGrade) {
      getClassIdFromGrade(selectedGrade).then(id => {
        setClassId(id);
      });
    } else {
      setClassId(null);
    }
  }, [selectedGrade, getClassIdFromGrade]);

  // Effect for fetching students when grade changes - optimized to prevent memory leaks
  useEffect(() => {
    if (!selectedGrade) return;

    // Clear previous data when grade changes
    setStudents([]);
    setAttendanceRecords([]);
    
    // Fetch new data for the selected grade (don't preserve attendance for new grade)
    fetchStudents(false);
    
    // Reset lastUpdateTime for new grade
    setLastUpdateTime(Date.now());
  }, [selectedGrade, fetchStudents]);

  // Separate effect for polling - prevents recreation on every fetchStudents change
  useEffect(() => {
    if (!selectedGrade) return;

    // Set up polling interval with longer delay
    const pollingInterval = setInterval(() => {
      // Only fetch if the component is visible/active and preserve current attendance selections
      if (document.visibilityState === 'visible') {
        fetchStudents(true); // Pass true to preserve attendance selections during auto-refresh
      }
    }, POLLING_INTERVAL);
    
    return () => {
      clearInterval(pollingInterval);
    };
  }, [selectedGrade, fetchStudents]);

  // Separate effect for visibility change handling
  useEffect(() => {
    if (!selectedGrade) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Fetch when tab becomes visible if enough time has passed
        if (!lastUpdateTime || Date.now() - lastUpdateTime > POLLING_INTERVAL) {
          fetchStudents(true); // Preserve selections when refetching on visibility change
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
  }, []);  // Create a direct version for UI events - no debouncing needed for dropdown selection
  const debouncedStatusChange = useCallback((studentId, status) => {
    // Reduced logging for production readiness - only log significant changes
    if (process.env.NODE_ENV === 'development') {
      logger.debug(`Status change: student ${studentId} -> ${status}`);
    }
    
    // Pass parameters directly to handleStatusChange without creating a new debounced function
    handleStatusChange(studentId, status);
  }, [handleStatusChange]); // Removed attendanceRecords dependency to prevent re-renders

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

  // Validate attendance data before submission
  const validateAttendanceData = useCallback((data) => {
    const errors = [];
    
    // Check required fields
    if (!data.date) errors.push('Date is missing');
    if (!data.grade) errors.push('Grade is missing');
    if (!data.classId) errors.push('Class ID is missing');
    
    // Validate records
    if (!data.records || !Array.isArray(data.records)) {
      errors.push('Attendance records are missing or invalid');
    } else if (data.records.length === 0) {
      errors.push('No attendance records to submit');
    } else {
      // Check if each record has required properties
      const invalidRecords = data.records.filter(record => 
        !record.studentId || !record.status
      );
      
      if (invalidRecords.length > 0) {
        errors.push(`${invalidRecords.length} records are missing studentId or status`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);  const handleSubmit = useCallback(async () => {
    try {
      setLoading(true);
      
      // Always get a fresh classId for submission to ensure consistency
      const submissionClassId = await getClassIdFromGrade(selectedGrade);
      
      const data = {
        date: new Date().toISOString().split('T')[0],
        grade: selectedGrade,
        classId: submissionClassId, // Include classId in submission
        records: attendanceRecords,
      };
      
      // Validate the data before sending
      const validation = validateAttendanceData(data);
      if (!validation.isValid) {
        logger.error('Attendance data validation failed:', validation.errors);
        setMessage(`Validation failed: ${validation.errors.join(', ')}`);
        setMessageType('error');
        setLoading(false);
        return;
      }
      
      // Use apiService instead of direct axios call      
      const response = await apiService.post('/attendance', data);
      
      // Set a flag in localStorage to trigger refresh in Dashboard and Reports
      localStorage.setItem('lastAttendanceSubmission', Date.now());
      
      setMessage(t('attendanceRecordedSuccessfully'));
      setMessageType('success');
      
      // Invalidate cache for attendance data
      storageUtils.clearApiCache('attendance');
    } catch (error) {      
      logger.error('Error recording attendance:', error);
      
      // Enhanced error reporting for development
      if (process.env.NODE_ENV === 'development' && error.response?.data) {
        logger.error('Server error response:', error.response.data);
      }
      
      // Check if there's a network error
      if (error.message === 'Network Error') {
        setMessage(t('networkErrorTryAgain'));
      } else {
        setMessage(
          error.response?.data?.message || t('errorRecordingAttendance')
        );
      }
      setMessageType('error');
      
      // Handle authentication errors
      if (error.response && error.response.status === 401) {
        try {
          // Use apiService for token refresh instead of direct axios call          
          await apiService.post('/auth/refresh-token', {});
          
          // Try again after refreshing token
          handleSubmit();
        } catch (refreshError) {
          logger.error('Error refreshing token:', refreshError);
          window.location.href = '/login';
        }
      }
    } finally {
      setLoading(false);
    }
  }, [selectedGrade, attendanceRecords, t, getClassIdFromGrade, validateAttendanceData]); // Removed classId dependency

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
          background: effectiveThemeMode?.theme === 'dark' 
            ? 'rgba(37, 42, 52, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          color: effectiveThemeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
        }}
      >
        <FormControl fullWidth variant="outlined" sx={{ mb: 3 }}>
          <InputLabel id="grade-select-label">{t('SelectGrade')}</InputLabel>          <Select
            labelId="grade-select-label"
            value={selectedGrade}            onChange={(e) => {
              const newGrade = e.target.value;
              if (newGrade) {
                setMessage(t('loadingStudentsForGrade', { grade: newGrade }));
                setMessageType('info');
              }
              setSelectedGrade(newGrade);
              // Reset lastUpdateTime to force a fetch when grade changes
              setLastUpdateTime(null);
            }}
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
                    bgcolor: effectiveThemeMode?.theme === 'dark' ? 'rgba(41, 99, 255, 0.15)' : 'primary.50', 
                    borderRadius: 4,
                    boxShadow: effectiveThemeMode?.theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    color: effectiveThemeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit'
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
                    bgcolor: effectiveThemeMode?.theme === 'dark' ? 'rgba(211, 47, 47, 0.15)' : 'error.50', 
                    borderRadius: 4,
                    boxShadow: effectiveThemeMode?.theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    color: effectiveThemeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit'
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
                    bgcolor: effectiveThemeMode?.theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'warning.50', 
                    borderRadius: 4,
                    boxShadow: effectiveThemeMode?.theme === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 4px 20px rgba(0, 0, 0, 0.05)',
                    color: effectiveThemeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit'
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

            <StyledTableContainer component={Paper} elevation={0} themeMode={effectiveThemeMode}>              <Table stickyHeader>                <TableHead><TableRow>
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      color: effectiveThemeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                      backgroundColor: effectiveThemeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                    }}>
                      {t('StudentName')}
                    </TableCell>
                    <TableCell sx={{ 
                      fontWeight: 'bold',
                      color: effectiveThemeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                      backgroundColor: effectiveThemeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                    }}>
                      {t('Status')}
                    </TableCell>                  </TableRow>
                </TableHead>
                <TableBody>{attendanceRecords.map((record) => {
                    const student = students.find((s) => s.id === record.studentId);
                    return (<TableRow 
                        key={record.studentId}                        sx={{ 
                          '&:nth-of-type(odd)': { 
                            backgroundColor: effectiveThemeMode?.theme === 'dark' 
                              ? 'rgba(255, 255, 255, 0.02)' 
                              : 'rgba(0, 0, 0, 0.02)' 
                          },
                          '&:hover': { 
                            backgroundColor: effectiveThemeMode?.theme === 'dark' 
                              ? 'rgba(255, 255, 255, 0.05)' 
                              : 'rgba(0, 0, 0, 0.04)' 
                          } 
                        }}
                      >                        <TableCell sx={{ color: effectiveThemeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit' }}>
                          {student ? `${student.name} ${student.surname}` : t('UnknownStudent')}
                        </TableCell>
                        <TableCell sx={{ color: effectiveThemeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit' }}>                          <Select
                            value={record.status}
                            onChange={(e) => debouncedStatusChange(record.studentId, e.target.value)}
                            variant="outlined"
                            size="small"
                            sx={{ 
                              minWidth: 140,
                              '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: effectiveThemeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : undefined
                              },
                              '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: effectiveThemeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : undefined
                              },
                              '& .MuiSvgIcon-root': {
                                color: effectiveThemeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined
                              }
                            }}
                            renderValue={(selected) => (                              <StatusChip
                                label={t(selected)}
                                status={selected}
                                size="small"
                                themeMode={effectiveThemeMode}
                              />
                            )}
                            MenuProps={{                              PaperProps: {
                                sx: {
                                  backgroundColor: effectiveThemeMode?.theme === 'dark' ? themes.dark.colors.background.paper : 'white',
                                  '& .MuiMenuItem-root': {
                                    color: effectiveThemeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
                                  },
                                  '& .MuiMenuItem-root:hover': {
                                    backgroundColor: effectiveThemeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'
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




