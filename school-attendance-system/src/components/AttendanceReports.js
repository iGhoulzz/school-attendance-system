// AttendanceReports.js

import React, { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import './AttendanceReports.css';
import StudentDetailsModal from './StudentDetail';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import amiriFont from '../Amiri-Regular'; // Base64-encoded Amiri font data
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';
import { ThemeContext, themes } from '../utils/themeContext';
import { useApiData, useApiPost, useApiDelete } from '../hooks/useApiData';
import { createDebouncedClickHandler } from '../utils/debounceUtils';
import DOMPurify from 'dompurify';
import apiService from '../services/apiService';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Fade,
  Card,
  CardContent
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

// Import the spinner
import ClipLoader from 'react-spinners/ClipLoader';

const ReportsContainer = styled(Box)(({ theme, themeMode }) => ({
  padding: theme.spacing(3),
  width: '100%',
  background: themeMode?.theme === 'dark' ? themes.dark.colors.background.main : themes.light.colors.background.main,
  color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
}));

const ReportsHeader = styled(Box)(({ theme, themeMode }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginBottom: theme.spacing(4),
  color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
}));

const ActionsContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const StatsContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

const StatsCard = styled(Card)(({ theme, bgcolor = 'primary.main', themeMode }) => ({
  background: themeMode?.theme === 'dark' 
    ? themes.dark.colors.card[bgcolor.split('.')[0] === 'primary' ? 'statCard1' : bgcolor.split('.')[0] === 'secondary' ? 'statCard2' : 'statCard3']
    : `linear-gradient(135deg, ${theme.palette[bgcolor.split('.')[0]][bgcolor.split('.')[1]]} 0%, ${theme.palette[bgcolor.split('.')[0]][Number(bgcolor.split('.')[1]) + 100 || bgcolor.split('.')[1]]} 100%)`,
  color: 'white',
  borderRadius: 16,
  overflow: 'hidden',
  boxShadow: themeMode?.theme === 'dark' 
    ? themes.dark.colors.card.shadow
    : '0 8px 20px rgba(0, 0, 0, 0.1)',
}));

const ReportTable = styled(TableContainer)(({ theme, themeMode }) => ({
  maxHeight: '65vh',
  marginTop: theme.spacing(3),
  borderRadius: 16,
  overflow: 'auto',
  backgroundColor: themeMode?.theme === 'dark' 
    ? themes.dark.colors.background.paper
    : themes.light.colors.background.paper,
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
    color: themeMode?.theme === 'dark' 
      ? (status === 'Present' 
        ? '#4d7dff' 
        : status === 'Absent' 
          ? '#f44336' 
          : '#ffad5c')
      : (status === 'Present' 
        ? theme.palette.primary.main 
        : status === 'Absent' 
          ? theme.palette.error.main 
          : theme.palette.warning.main),
    backgroundColor: status === 'Present' 
      ? themeMode?.theme === 'dark' ? 'rgba(41, 99, 255, 0.15)' : 'rgba(41, 99, 255, 0.1)' 
      : status === 'Absent' 
      ? themeMode?.theme === 'dark' ? 'rgba(211, 47, 47, 0.15)' : 'rgba(211, 47, 47, 0.1)'
      : themeMode?.theme === 'dark' ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.1)', 
  };
});

function AttendanceReports() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const themeMode = useContext(ThemeContext);
  
  const [date, setDate] = useState(new Date());
  const [attendanceEntries, setAttendanceEntries] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [absentStudentsCount, setAbsentStudentsCount] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCache, setStudentCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  const fetchAttendanceData = useCallback(async (selectedDate) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setMessage(t('mustBeLoggedInToViewReports'));
        setLoading(false);
        return;
      }

      // Format the date for the API - ensure it's in the correct format
      // Use a more robust date formatting to avoid timezone issues
      const formattedDate = selectedDate instanceof Date 
        ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
        : selectedDate.toISOString().split('T')[0];

      console.log('Fetching attendance for date:', formattedDate);
      
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5001/api/attendance?date=${formattedDate}`, config);
      const fetchedData = response.data; 

      console.log('Fetched attendance data:', fetchedData);

      if (Array.isArray(fetchedData) && fetchedData.length > 0) {
        const allRecords = [];
        fetchedData.forEach((dateGroup) => {
          (dateGroup.records || []).forEach((teacherGroup) => {
            (teacherGroup.records || []).forEach((record) => {
              allRecords.push(record);
            });
          });
        });

        setAttendanceEntries(fetchedData);
        setAttendanceData(allRecords);
        setTotalStudents(allRecords.length);
        setAbsentStudentsCount(allRecords.filter((r) => r.status === 'Absent').length);
        setMessage('');
      } else {
        setAttendanceEntries([]);
        setAttendanceData([]);
        setTotalStudents(0);
        setAbsentStudentsCount(0);
        setMessage(t('noAttendanceRecordsFoundForDate'));
      }
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      setMessage(t('errorFetchingAttendanceRecords'));
    } finally {
      setLoading(false);
    }
  }, [t]);  const debouncedFetchAttendanceData = useCallback((selectedDate) => {
    // Use the debounceUtils helper for consistent implementation
    const debouncedSearchHandler = createDebouncedClickHandler(
      () => fetchAttendanceData(selectedDate),
      500
    );
    
    debouncedSearchHandler();
    
  }, [fetchAttendanceData]);

  const handleDateChange = (newDate) => {
    if (!newDate) return;
    
    setDate(newDate);
    // Don't use debounce for explicit user date selection
    fetchAttendanceData(newDate);
  };

  useEffect(() => {
    fetchAttendanceData(date);
  }, [date, fetchAttendanceData]);
  const handleViewStudent = async (studentId) => {
    setLoading(true);
    if (studentCache[studentId]) {
      setSelectedStudent(studentCache[studentId]);
      setLoading(false);
    } else {
      try {
        // Use API service rather than direct axios calls with localStorage tokens
        const { data } = await useApiData.get(`/students/by-id/${studentId}`);
        
        // Sanitize data with DOMPurify
        const sanitizedData = DOMPurify.sanitize(JSON.stringify(data));
        const sanitizedStudentData = JSON.parse(sanitizedData);
        
        setSelectedStudent(sanitizedStudentData);
        setStudentCache((prev) => ({ ...prev, [studentId]: sanitizedStudentData }));
      } catch (error) {
        console.error('Error fetching student details:', error);
        setMessage(t('errorFetchingStudentDetails'));
      } finally {
        setLoading(false);
      }
    }
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  const promptClearAttendance = () => {
    setConfirmMessage(t('confirmDeleteAllAttendanceForDate'));
    setConfirmAction('clear');
    setConfirmDialogOpen(true);
  };

  const promptSendAlerts = () => {
    setConfirmMessage(t('confirmSendEmailAlerts'));
    setConfirmAction('alerts');
    setConfirmDialogOpen(true);
  };

  const handleConfirmDialog = async () => {
    setConfirmDialogOpen(false);
    
    if (confirmAction === 'clear') {
      await handleClearAttendance();
    } else if (confirmAction === 'alerts') {
      await handleSendAlerts();
    }
  };

  const handleClearAttendance = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setMessage(t('mustBeLoggedInToPerformAction'));
        setLoading(false);
        return;
      }

      const formattedDate = date.toISOString().split('T')[0];
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`http://localhost:5001/api/attendance?date=${formattedDate}`, config);
      setMessage(t('attendanceRecordsDeletedSuccessfully'));
      setAttendanceEntries([]);
      setAttendanceData([]);
      setTotalStudents(0);
      setAbsentStudentsCount(0);
    } catch (error) {
      console.error('Error deleting attendance records:', error);
      setMessage(t('errorDeletingAttendanceRecords'));
    } finally {
      setLoading(false);
    }
  };
  const handleSendAlerts = async () => {
    try {      setLoading(true);
      const formattedDate = date.toISOString().split('T')[0];
      
      // Use apiService instead of direct axios call with hardcoded URL
      await apiService.post('/attendance/send-alerts', { date: formattedDate });
      
      setMessage(t('alertEmailsSentSuccessfully'));
    } catch (error) {
      console.error('Error sending alert emails:', error);
      setMessage(t('errorSendingAlertEmails'));
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    doc.addFileToVFS('Amiri-Regular.ttf', amiriFont);
    doc.addFont('Amiri-Regular.ttf', 'Amiri', 'normal');

    const currentFont = isArabic ? 'Amiri' : 'Helvetica';
    doc.setFont(currentFont, 'normal');

    const pageWidth = doc.internal.pageSize.getWidth();
    const xLeft = 40;
    const xRight = pageWidth - 40;
    doc.setFontSize(16);

    const writeText = (text, x, y, align = 'left') => {
      doc.text(text, x, y, { align: align });
    };

    doc.setFontSize(16);
    if (isArabic) {
      writeText(t('YourSchoolName'), xRight, 40, 'right');
    } else {
      writeText(t('YourSchoolName'), xLeft, 40);
    }

    doc.setFontSize(12);
    const lineHeight = 20;
    let currentY = 70;

    const printLine = (text) => {
      if (isArabic) {
        writeText(text, xRight, currentY, 'right');
      } else {
        writeText(text, xLeft, currentY);
      }
      currentY += lineHeight;
    };

    const formattedDate = date.toISOString().split('T')[0];
    printLine(`${t('Date')}: ${formattedDate}`);
    printLine(`${t('TotalStudents')}: ${totalStudents}`);
    printLine(`${t('AbsentStudents')}: ${absentStudentsCount}`);

    let startY = currentY + 10;

    attendanceEntries.forEach((dateGroup) => {
      doc.setFontSize(14);
      const headerText = `${t('AttendanceReportFor')} ${new Date(dateGroup.date).toLocaleDateString()}`;
      if (isArabic) {
        writeText(headerText, xRight, startY, 'right');
      } else {
        writeText(headerText, xLeft, startY);
      }
      startY += lineHeight;

      (dateGroup.records || []).forEach((teacherGroup) => {
        doc.setFontSize(12);
        if (isArabic) {
          writeText(`${t('Grade')}: ${teacherGroup.grade}`, xRight, startY, 'right');
          startY += 15;
          writeText(`${t('RecordedBy')}: ${teacherGroup.teacherName}`, xRight, startY, 'right');
        } else {
          writeText(`${t('Grade')}: ${teacherGroup.grade}`, xLeft, startY);
          startY += 15;
          writeText(`${t('RecordedBy')}: ${teacherGroup.teacherName}`, xLeft, startY);
        }
        startY += 15;

        const tableColumns = isArabic
          ? [t('Status'), t('StudentName')]
          : [t('StudentName'), t('Status')];

        const tableRows = (teacherGroup.records || []).map((record) =>
          isArabic ? [t(record.status), record.studentName] : [record.studentName, t(record.status)]
        );

        doc.autoTable({
          startY: startY,
          head: [tableColumns],
          body: tableRows,
          styles: { font: currentFont, fontSize: 10 },
          margin: { left: xLeft, right: xLeft },
          theme: 'grid',
          headStyles: { fillColor: [41, 99, 255] },
        });

        startY = doc.autoTable.previous.finalY + 30;
      });
    });

    doc.save(`${t('attendanceReport')}_${formattedDate}.pdf`);
  };

  // Create a debounced version of the PDF generation handler to prevent multiple clicks
  const debouncedGeneratePDF = useMemo(
    () => createDebouncedClickHandler(handleGeneratePDF, 1000),
    [handleGeneratePDF]
  );

  // Create debounced versions of potentially expensive operations
  const debouncedPromptSendAlerts = useMemo(
    () => createDebouncedClickHandler(promptSendAlerts, 1000),
    [promptSendAlerts]
  );
  
  const debouncedPromptClearAttendance = useMemo(
    () => createDebouncedClickHandler(promptClearAttendance, 1000),
    [promptClearAttendance]
  );

  const statusColors = {
    'Present': 'primary',
    'Absent': 'error',
    'Late': 'warning',
  };
  return (
    <ReportsContainer themeMode={themeMode}>
      <ReportsHeader themeMode={themeMode}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t('AttendanceReports')}
          </Typography>
        </motion.div>
      </ReportsHeader>      {message && (
        <Fade in={!!message}>
          <Alert 
            severity={message.includes('success') ? 'success' : message.includes('error') ? 'error' : 'info'} 
            sx={{ 
              mb: 3,
              backgroundColor: themeMode?.theme === 'dark' 
                ? (message.includes('success') 
                  ? 'rgba(46, 125, 50, 0.1)' 
                  : message.includes('error') 
                    ? 'rgba(211, 47, 47, 0.1)' 
                    : 'rgba(2, 136, 209, 0.1)')
                : undefined,
              color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
              '& .MuiAlert-icon': {
                color: themeMode?.theme === 'dark'
                  ? (message.includes('success') 
                    ? '#66bb6a' 
                    : message.includes('error') 
                      ? '#f44336' 
                      : '#29b6f6')
                  : undefined
              }
            }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        </Fade>
      )}<Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          mb: 4,
          background: themeMode?.theme === 'dark' 
            ? 'rgba(37, 42, 52, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderColor: 'transparent',
          color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2, mb: 3 }}>          <DatePicker
            label={t('SelectDate')}
            value={date}
            onChange={handleDateChange}
            slotProps={{
              textField: {
                variant: 'outlined',
                size: 'small',
                InputProps: {
                  startAdornment: <CalendarIcon color="primary" sx={{ mr: 1 }} />,
                },
                sx: { 
                  width: { xs: '100%', sm: 220 },
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
                }
              },
              popper: {
                sx: {
                  '& .MuiPaper-root': {
                    backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.background.paper : themes.light.colors.background.paper,
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
                  },
                  '& .MuiPickersDay-root': {
                    color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
                    '&.Mui-selected': {
                      backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : undefined,
                      color: '#fff'
                    },
                    '&:hover': {
                      backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.2)' : undefined,
                    }
                  }
                }
              }
            }}
          />
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>            <Tooltip title={t('GeneratePDF')}>
              <Button
                variant="contained"
                size="small"
                startIcon={<PdfIcon />}
                onClick={debouncedGeneratePDF}
                disabled={loading || attendanceData.length === 0}
                sx={{
                  backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.9)' : undefined
                  }
                }}
              >
                {t('GeneratePDF')}
              </Button>
            </Tooltip>

            <Tooltip title={t('SendAlerts')}>
              <Button
                variant="outlined"
                size="small"
                color="primary"
                startIcon={<EmailIcon />}
                onClick={debouncedPromptSendAlerts}
                disabled={loading || absentStudentsCount === 0}
                sx={{
                  borderColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  '&:hover': {
                    borderColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.9)' : undefined,
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.1)' : undefined
                  }
                }}
              >
                {t('SendAlerts')}
              </Button>
            </Tooltip>            <Tooltip title={t('Refresh')}>
              <IconButton 
                color="primary"
                onClick={() => fetchAttendanceData(date)}
                disabled={loading}
                size="small"
                sx={{
                  color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                  '&:hover': {
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.1)' : undefined
                  }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title={t('ClearAttendance')}>
              <IconButton
                color="error"
                onClick={debouncedPromptClearAttendance}
                disabled={loading || attendanceData.length === 0}
                size="small"
                sx={{
                  color: themeMode?.theme === 'dark' ? '#f44336' : undefined,
                  '&:hover': {
                    backgroundColor: themeMode?.theme === 'dark' ? 'rgba(244, 67, 54, 0.1)' : undefined
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <StatsContainer>          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <StatsCard bgcolor="primary.500" themeMode={themeMode}>
              <CardContent>
                <Typography variant="subtitle1">{t('TotalStudents')}</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {totalStudents}
                </Typography>
              </CardContent>
            </StatsCard>
          </motion.div>          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <StatsCard bgcolor="secondary.500" themeMode={themeMode}>
              <CardContent>
                <Typography variant="subtitle1">{t('PresentStudents')}</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {totalStudents - absentStudentsCount}
                </Typography>
              </CardContent>
            </StatsCard>
          </motion.div>          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <StatsCard bgcolor="error.main" themeMode={themeMode}>
              <CardContent>
                <Typography variant="subtitle1">{t('AbsentStudents')}</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {absentStudentsCount}
                </Typography>
              </CardContent>
            </StatsCard>
          </motion.div>          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <StatsCard bgcolor="primary.700" themeMode={themeMode}>
              <CardContent>
                <Typography variant="subtitle1">{t('AttendanceRate')}</Typography>
                <Typography variant="h4" fontWeight="bold">
                  {totalStudents ? `${Math.round(((totalStudents - absentStudentsCount) / totalStudents) * 100)}%` : '0%'}
                </Typography>
              </CardContent>
            </StatsCard>
          </motion.div>
        </StatsContainer>
      </Paper>      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={60} sx={{ 
            color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary 
          }} />
        </Box>
      ) : attendanceEntries.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              background: themeMode?.theme === 'dark' 
                ? 'rgba(37, 42, 52, 0.8)' 
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
            }}
          >
            {attendanceEntries.map((dateGroup, index) => (
              <Box key={index} mb={4}>
                {dateGroup.records && dateGroup.records.map((teacherGroup, tIndex) => (
                  <Box key={tIndex} my={2}>
                    <Box p={3} pb={1}>
                      <Typography variant="h6" fontWeight="bold">
                        {t('Grade')}: {teacherGroup.grade}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('RecordedBy')}: {teacherGroup.teacherName}
                      </Typography>
                    </Box>

                    <ReportTable component={Paper} elevation={0} themeMode={themeMode}>
                      <Table stickyHeader>                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ 
                              fontWeight: 'bold',
                              color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                              backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                            }}>{t('StudentName')}</TableCell>
                            <TableCell sx={{ 
                              fontWeight: 'bold',
                              color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                              backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                            }}>{t('Status')}</TableCell>
                            <TableCell align="center" sx={{ 
                              fontWeight: 'bold',
                              color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit',
                              backgroundColor: themeMode?.theme === 'dark' ? 'rgba(37, 42, 52, 0.9)' : 'white'
                            }}>{t('Actions')}</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {teacherGroup.records && teacherGroup.records.map((record, rIndex) => (                            <TableRow 
                              key={rIndex} 
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
                            >                              <TableCell sx={{
                                color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'
                              }}>{record.studentName}</TableCell>
                              <TableCell>                                <StatusChip
                                  label={t(record.status)}
                                  status={record.status}
                                  variant="outlined"
                                  size="small"
                                  themeMode={themeMode}
                                />
                              </TableCell>                              <TableCell align="center">
                                <Tooltip title={t('viewStudentDetails')}>
                                  <IconButton 
                                    onClick={() => handleViewStudent(record.studentId)}
                                    size="small"
                                    color="primary"
                                    sx={{
                                      color: themeMode?.theme === 'dark' ? themes.dark.colors.primary : themes.light.colors.primary,
                                      '&:hover': {
                                        backgroundColor: themeMode?.theme === 'dark' ? 'rgba(77, 125, 255, 0.1)' : undefined
                                      }
                                    }}
                                  >
                                    <InfoIcon />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ReportTable>
                  </Box>
                ))}
              </Box>
            ))}
          </Paper>
        </motion.div>      ) : (        <Paper
          elevation={0}
          sx={{
            p: 5,
            borderRadius: 4,
            backgroundColor: themeMode?.theme === 'dark' 
              ? 'rgba(37, 42, 52, 0.8)' 
              : 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            textAlign: 'center',
            color: themeMode?.theme === 'dark' ? '#e6e6e6' : 'inherit',
          }}
        >
          <Typography variant="h6" sx={{ 
            color: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary' 
          }}>
            {t('noAttendanceRecordsFoundForDate')}
          </Typography>
        </Paper>
      )}

      {selectedStudent && (
        <StudentDetailsModal
          studentId={selectedStudent.id}
          onClose={closeModal}
        />
      )}      <Dialog 
        open={confirmDialogOpen} 
        onClose={() => setConfirmDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.background.paper : themes.light.colors.background.paper,
            color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : themes.light.colors.text.primary,
          }
        }}
      >
        <DialogTitle>{t('confirmAction')}</DialogTitle>
        <DialogContent>
          <Typography color={themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : 'inherit'}>
            {confirmMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialogOpen(false)} 
            color="primary"
            sx={{
              color: themeMode?.theme === 'dark' ? themes.dark.colors.text.primary : undefined,
              '&:hover': {
                backgroundColor: themeMode?.theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : undefined,
              }
            }}
          >
            {t('Cancel')}
          </Button>
          <Button 
            onClick={handleConfirmDialog} 
            color="primary" 
            variant="contained"
            sx={{
              backgroundColor: themeMode?.theme === 'dark' ? themes.dark.colors.primary : undefined,
            }}
          >
            {t('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </ReportsContainer>
  );
}

export default AttendanceReports;


















