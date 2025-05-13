// AttendanceReports.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import './AttendanceReports.css';
import StudentDetailsModal from './StudentDetail';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import amiriFont from '../Amiri-Regular'; // Base64-encoded Amiri font data
import { useTranslation } from 'react-i18next';

// Import the spinner
import ClipLoader from 'react-spinners/ClipLoader';

function AttendanceReports() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceEntries, setAttendanceEntries] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [absentStudentsCount, setAbsentStudentsCount] = useState(0);
  const [message, setMessage] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentCache, setStudentCache] = useState({});
  const [loading, setLoading] = useState(false); // Track loading state

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

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(`http://localhost:5001/api/attendance?date=${selectedDate}`, config);
      const fetchedData = response.data; 

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
  }, [t]);

  const debouncedFetchAttendanceData = useCallback(
    debounce((selectedDate) => {
      fetchAttendanceData(selectedDate);
    }, 300),
    [fetchAttendanceData]
  );

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    debouncedFetchAttendanceData(selectedDate);
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
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`http://localhost:5001/api/students/by-id/${studentId}`, config);
        setSelectedStudent(response.data);
        setStudentCache((prev) => ({ ...prev, [studentId]: response.data }));
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

  const handleClearAttendance = async () => {
    const confirmDelete = window.confirm(t('confirmDeleteAllAttendanceForDate'));
    if (confirmDelete) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          setMessage(t('mustBeLoggedInToPerformAction'));
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`http://localhost:5001/api/attendance?date=${date}`, config);
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
    }
  };

  const handleSendAlerts = async () => {
    const confirmSend = window.confirm(t('confirmSendEmailAlerts'));
    if (confirmSend) {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post(`http://localhost:5001/api/attendance/send-alerts`, { date }, config);
        setMessage(t('alertEmailsSentSuccessfully'));
      } catch (error) {
        console.error('Error sending alert emails:', error);
        setMessage(t('errorSendingAlertEmails'));
      } finally {
        setLoading(false);
      }
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

    printLine(`${t('Date')}: ${date}`);
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
          headStyles: { fillColor: [150, 150, 150] }, // Darker gray for better visibility
        });

        startY = doc.autoTable.previous.finalY + 30;
      });
    });

    doc.setFontSize(12);
    if (isArabic) {
      writeText('_____________________________', xRight, startY, 'right');
      writeText(t('AuthorizedSignature'), xRight, startY + 15, 'right');
    } else {
      writeText('_____________________________', xLeft, startY);
      writeText(t('AuthorizedSignature'), xLeft, startY + 15);
    }

    doc.save(`attendance-report-${date}.pdf`);
  };

  return (
    <div className="attendance-reports-container">
      <h2>{t('AttendanceReports')}</h2>

      <label>
        {t('SelectDate')}
        <input type="date" value={date} onChange={handleDateChange} />
      </label>

      {message && <p className="message">{message}</p>}

      {/* Show spinner if loading */}
      {loading && (
        <div className="loading-container">
          <ClipLoader color="#000" size={50} />
        </div>
      )}

      {attendanceEntries.length > 0 && (
        <div className="summary">
          <p>{t('TotalStudents')}: {totalStudents}</p>
          <p>{t('AbsentStudents')}: {absentStudentsCount}</p>
        </div>
      )}

      {attendanceEntries.length > 0 &&
        attendanceEntries.map((dateGroup, dateIndex) => (
          <div key={dateIndex} className="attendance-entry">
            <h3>{t('Date')}: {new Date(dateGroup.date).toLocaleDateString()}</h3>
            {(dateGroup.records || []).map((teacherGroup, teacherIndex) => (
              <div key={teacherIndex}>
                <p>{t('Grade')}: {teacherGroup.grade}</p>
                <p>{t('RecordedBy')}: {teacherGroup.teacherName}</p>
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>{t('StudentName')}</th>
                      <th>{t('Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(teacherGroup.records || []).map((record, recordIndex) => (
                      <tr key={recordIndex}>
                        <td>
                          <span className="student-name" onClick={() => handleViewStudent(record.studentId)}>
                            {record.studentName}
                          </span>
                        </td>
                        <td>{t(record.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}

      {attendanceEntries.length > 0 && (
        <div className="action-buttons">
          <button className="pdf-button" onClick={handleGeneratePDF} disabled={loading}>
            <i className="fa-solid fa-file-pdf"></i> {t('DownloadPDF')}
          </button>
          <button className="send-alert-button" onClick={handleSendAlerts} disabled={loading}>
            {t('SendAlertEmails')}
          </button>
        </div>
      )}

      {attendanceEntries.length > 0 && (
        <button className="clear-attendance-button" onClick={handleClearAttendance} disabled={loading}>
          {t('ClearAttendanceRecords')}
        </button>
      )}

      {selectedStudent && <StudentDetailsModal student={selectedStudent} onClose={closeModal} />}
    </div>
  );
}

export default AttendanceReports;


















