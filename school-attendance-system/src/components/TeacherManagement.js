
// src/components/TeacherManagement.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TeacherManagement.css';
import { useTranslation } from 'react-i18next';

function TeacherManagement() {
  const { t } = useTranslation();
  const [teachers, setTeachers] = useState([]);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get('http://localhost:5001/api/teachers', config);
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setMessage(t('errorFetchingTeachers'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.post('http://localhost:5001/api/teachers', newTeacher, config);
      setMessage(t('teacherCreatedSuccessfully'));
      fetchTeachers();
      setNewTeacher({ name: '', surname: '', email: '', password: '' });
    } catch (error) {
      console.error('Error creating teacher:', error);
      setMessage(error.response?.data?.message || t('errorCreatingTeacher'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      await axios.delete(`http://localhost:5001/api/teachers/${id}`, config);
      setMessage(t('teacherDeletedSuccessfully'));
      fetchTeachers();
    } catch (error) {
      console.error('Error deleting teacher:', error);
      setMessage(t('errorDeletingTeacher'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="teacher-management-container">
      <h2>{t('TeacherManagement')}</h2>
      {message && <div className="message">{message}</div>}
      <div className="add-teacher-form">
        <input
          type="text"
          placeholder={t('FirstName')}
          value={newTeacher.name}
          onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder={t('Surname')}
          value={newTeacher.surname}
          onChange={(e) => setNewTeacher({ ...newTeacher, surname: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder={t('Email')}
          value={newTeacher.email}
          onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder={t('Password')}
          value={newTeacher.password}
          onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
          required
        />
        <button onClick={handleCreateTeacher} disabled={loading}>
          {loading ? t('Adding') : t('AddTeacherButton')}
        </button>
      </div>

      <h3>{t('TeachersList')}</h3>
      {loading && <p>{t('Loading')}</p>}
      <ul>
        {teachers.length > 0 ? (
          teachers.map((teacher) => (
            <li key={teacher._id} className="teacher-item">
              <span>
                {teacher.name} {teacher.surname} - {teacher.email}
              </span>
              <button onClick={() => handleDeleteTeacher(teacher._id)} disabled={loading}>
                {loading ? t('Deleting') : t('Delete')}
              </button>
            </li>
          ))
        ) : (
          <p>{t('noTeachersFound')}</p>
        )}
      </ul>
    </div>
  );
}

export default TeacherManagement;




