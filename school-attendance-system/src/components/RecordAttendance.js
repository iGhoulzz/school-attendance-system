// RecordAttendance.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecordAttendance.css';
import { useTranslation } from 'react-i18next';

function RecordAttendance() {
  const { t } = useTranslation();
  const [grades, setGrades] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchStudents();
    }
  }, [selectedGrade]);

  const fetchGrades = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/grades', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5001/api/students?grade=${selectedGrade}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setStudents(response.data);

      const initialRecords = response.data.map((student) => ({
        studentId: student.id,
        status: 'Present',
      }));
      setAttendanceRecords(initialRecords);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords((prevRecords) =>
      prevRecords.map((record) =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
  };

  const markAll = (status) => {
    setAttendanceRecords((prevRecords) =>
      prevRecords.map((record) => ({ ...record, status }))
    );
  };

  const handleSubmit = async () => {
    try {
      const data = {
        date: new Date().toISOString().split('T')[0],
        grade: selectedGrade,
        records: attendanceRecords,
      };
      await axios.post('http://localhost:5001/api/attendance', data, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMessage({ type: 'success', text: t('attendanceRecordedSuccessfully') });
    } catch (error) {
      console.error('Error recording attendance:', error.response?.data || error.message);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || t('errorRecordingAttendance'),
      });
    }
  };

  return (
    <div className="record-attendance-container">
      <h2>{t('RecordAttendance')}</h2>
      {message && (
        <p className={`message ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </p>
      )}

      <label>
        {t('SelectGrade')}:
        <select
          className="select-grade"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          <option value="">{t('selectAGrade')}</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>
              {grade}
            </option>
          ))}
        </select>
      </label>

      {selectedGrade && (
        <>
          <div className="bulk-actions">
            <button onClick={() => markAll('Present')}>{t('MarkAllPresent')}</button>
            <button onClick={() => markAll('Absent')}>{t('MarkAllAbsent')}</button>
            <button onClick={() => markAll('Late')}>{t('MarkAllLate')}</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>{t('StudentName')}</th>
                <th>{t('Status')}</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => {
                const student = students.find((s) => s.id === record.studentId);
                return (
                  <tr key={record.studentId}>
                    <td>
                      {student ? `${student.name} ${student.surname}` : t('UnknownStudent')}
                    </td>
                    <td>
                      <select
                        value={record.status}
                        onChange={(e) =>
                          handleStatusChange(record.studentId, e.target.value)
                        }
                      >
                        <option value="Present">{t('Present')}</option>
                        <option value="Absent">{t('Absent')}</option>
                        <option value="Late">{t('Late')}</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <button className="submit-button" onClick={handleSubmit}>
            {t('SubmitAttendance')}
          </button>
        </>
      )}
    </div>
  );
}

export default RecordAttendance;




