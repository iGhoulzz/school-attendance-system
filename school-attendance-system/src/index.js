import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './Routes'; 
import reportWebVitals from './reportWebVitals';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n'; // Import your i18n configuration
import { initializeApp } from './utils/startupCheck';

// Run startup checks before rendering
const appInitResult = initializeApp();

// Create fallback component for critical errors
const FallbackComponent = ({ errors }) => (
  <div style={{ 
    padding: '20px', 
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '800px',
    margin: '40px auto',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  }}>
    <h1 style={{ color: '#d32f2f' }}>Application Initialization Issue</h1>
    <p>The application couldn't initialize properly due to browser restrictions.</p>
    
    <h3>Details:</h3>
    <ul>
      {errors.map((error, index) => (
        <li key={index} style={{ marginBottom: '8px' }}>{error}</li>
      ))}
    </ul>
    
    <h3>Possible Solutions:</h3>
    <ul>
      <li>Try using a different browser</li>
      <li>Disable privacy/tracking blockers for this site</li>
      <li>Try using the site outside of an iframe</li>
      <li>Enable cookies and localStorage for this site</li>
      <li>Try disabling incognito/private browsing mode</li>
    </ul>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application or fallback component
if (appInitResult.success) {
  root.render(
    <I18nextProvider i18n={i18n}>
      <React.StrictMode>
        <AppRoutes />  
      </React.StrictMode>
    </I18nextProvider>
  );
} else {
  // Render error page for critical issues
  root.render(<FallbackComponent errors={appInitResult.errors} />);
}

reportWebVitals();
