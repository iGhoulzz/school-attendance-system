// StudentManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StudentManagement.css';
import StudentDetailsModal from './StudentDetail';
import { useTranslation } from 'react-i18next';

function StudentManagement() {
  const { t } = useTranslation();
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
  const [messageType, setMessageType] = useState('');
  const [errorFields, setErrorFields] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchQuery]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/students', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents(response.data);
      setMessage('');
      setMessageType('');
    } catch (error) {
      console.error('Error fetching students:', error);
      setMessage(t('errorFetchingStudents'));
      setMessageType('error');
    }
  };

  const filterStudents = () => {
    const filtered = students.filter((student) => {
      const fullName = `${student.name} ${student.surname}`.toLowerCase();
      return (
        fullName.includes(searchQuery.toLowerCase()) ||
        student.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredStudents(filtered);
  };

  const handleCreateStudent = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/students', newStudent, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(t('studentCreatedSuccessfully'));
      setMessageType('success');
      setErrorFields([]);
      fetchStudents();
      setNewStudent({ name: '', surname: '', parentName: '', parentEmail: '', parentPhone: '', grade: '' });
    } catch (error) {
      console.error('Error creating student:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || t('errorCreatingStudent'));
      setMessageType('error');
      if (error.response?.status === 400 && error.response?.data?.missingFields) {
        setErrorFields(error.response.data.missingFields);
      } else {
        setErrorFields([]);
      }
    }
  };

  const handleDeleteStudent = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5001/api/students/by-id/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage(t('studentDeletedSuccessfully'));
      setMessageType('success');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      setMessage(t('errorDeletingStudent'));
      setMessageType('error');
    }
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
  };

  const closeModal = () => {
    setSelectedStudent(null);
  };

  return (
    <div className="student-management-container">
      <h2>{t('StudentManagement')}</h2>
      {message && (
        <div className={`message ${messageType}`}>
          {message}
        </div>
      )}

      <div className="search-bar">
        <input
          type="text"
          placeholder={t('searchStudentsPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="add-student-form">
        <input
          type="text"
          placeholder={t('Name')}
          value={newStudent.name}
          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
          className={errorFields.includes('name') ? 'error' : ''}
        />
        <input
          type="text"
          placeholder={t('Surname')}
          value={newStudent.surname}
          onChange={(e) => setNewStudent({ ...newStudent, surname: e.target.value })}
          className={errorFields.includes('surname') ? 'error' : ''}
        />
        <input
          type="text"
          placeholder={t('ParentName')}
          value={newStudent.parentName}
          onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
          className={errorFields.includes('parentName') ? 'error' : ''}
        />
        <input
          type="email"
          placeholder={t('ParentEmail')}
          value={newStudent.parentEmail}
          onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
          className={errorFields.includes('parentEmail') ? 'error' : ''}
        />
        <input
          type="text"
          placeholder={t('ParentPhone')}
          value={newStudent.parentPhone}
          onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
          className={errorFields.includes('parentPhone') ? 'error' : ''}
        />
        <input
          type="text"
          placeholder={t('Grade')}
          value={newStudent.grade}
          onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
          className={errorFields.includes('grade') ? 'error' : ''}
        />
        <button onClick={handleCreateStudent}>{t('AddStudent')}</button>
      </div>

      <h3>{t('StudentsList')}</h3>
      <ul>
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <li key={student.id} className="student-item">
              <span
                className="student-name"
                onClick={() => handleViewStudent(student)}
              >
                {student.name} {student.surname} - {t('Grade')}: {student.grade} - {t('ID')}: {student.id}
              </span>
              <button onClick={() => handleDeleteStudent(student.id)}>{t('Delete')}</button>
            </li>
          ))
        ) : (
          <p>{t('noStudentsFound')}</p>
        )}
      </ul>

      {selectedStudent && (
        <StudentDetailsModal
          studentId={selectedStudent.id}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default StudentManagement;





