// debug-login.js - Test the Login component functionality
console.log('Starting Login component debug...');

import React from 'react';
import apiService from './src/services/apiService.js';

// Test apiService methods to ensure they work
console.log('Testing apiService methods directly:');
console.log('apiService object:', apiService);
console.log('apiService methods:', Object.keys(apiService));

// Test CSRF token fetch
console.log('\nTesting CSRF token fetch:');
apiService.fetchCsrfToken()
  .then(token => {
    console.log('CSRF token received:', token ? `${token.substring(0, 10)}...` : 'null');
  })
  .catch(error => {
    console.error('CSRF token fetch failed:', error);
  });

// Simulate login attempt
console.log('\nSimulating login attempt with apiService:');
apiService.post('/auth/login', {
  email: 'test@example.com',
  password: 'testpassword'
})
  .then(response => {
    console.log('Login response:', response);
  })
  .catch(error => {
    // Expected to fail if credentials are invalid, but should not throw "is not a function" error
    console.log('Login request error (expected if credentials invalid):');
    console.log('Error type:', error.name);
    console.log('Error message:', error.message);
    if (error.response) {
      console.log('Error status:', error.response.status);
      console.log('Error data:', error.response.data);
    }
  });

// Exit after tests complete
setTimeout(() => {
  console.log('\nLogin component debug complete!');
  process.exit(0);
}, 5000);  // Give requests time to complete
