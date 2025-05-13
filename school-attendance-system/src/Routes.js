import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App'; // Homepage
import Login from './components/Login'; // Login page
import Dashboard from './components/Dashboard'; // Dashboard page


function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard Route */}
      </Routes>
    </Router>
  );
}

export default AppRoutes;

