// StudentDetail.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentDetail.css';
import { useTranslation } from 'react-i18next';

function StudentDetail({ studentId, student, onClose }) {
  const { t } = useTranslation();
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
  }, [studentId, studentData]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5001/api/students/by-id/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStudentData(response.data);
      setFormData({
        name: response.data.name || '',
        surname: response.data.surname || '',
        parentName: response.data.parentName || '',
        parentEmail: response.data.parentEmail || '',
        parentPhone: response.data.parentPhone || '',
        grade: response.data.grade || '',
      });
    } catch (error) {
      console.error('Error fetching student:', error.message);
      setMessage(t('errorFetchingStudentData'));
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/students/by-id/${studentData.id}`,
        formData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
  };

  if (!studentData) return <div>{t('loading')}...</div>;

  return (
    <div className="student-detail-container">
      <h2>{t('editStudent')}</h2>
      {message && <div className={`message ${messageType}`}>{message}</div>}

      <div className="student-info">
        <p>
          <strong>{t('ID')}:</strong> {studentData.id}
        </p>
        <p>
          <strong>{t('dateAdded')}:</strong>{' '}
          {new Date(studentData.createdAt).toLocaleDateString()}
        </p>
      </div>

      <form onSubmit={handleUpdate}>
        <label>
          {t('Name')}:
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          {t('Surname')}:
          <input
            name="surname"
            value={formData.surname}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          {t('ParentName')}:
          <input
            name="parentName"
            value={formData.parentName}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          {t('ParentEmail')}:
          <input
            type="email"
            name="parentEmail"
            value={formData.parentEmail}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          {t('ParentPhone')}:
          <input
            type="tel"
            name="parentPhone"
            value={formData.parentPhone}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          {t('Grade')}:
          <input
            name="grade"
            value={formData.grade}
            onChange={handleInputChange}
            required
          />
        </label>
        <div className="button-group">
          <button type="submit" disabled={isLoading}>
            {isLoading ? t('saving') : t('save')}
          </button>
          <button type="button" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default StudentDetail;




