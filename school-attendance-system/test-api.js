// test-api.js - A simple test script to debug the apiService login function
const apiService = require('./src/services/apiService');

// Test the login function
console.log('Testing apiService.login functionality...');
console.log('apiService type:', typeof apiService);
console.log('apiService keys:', Object.keys(apiService));
console.log('login function type:', typeof apiService.login);

// Mock credentials for testing
const credentials = {
  email: 'test@example.com',
  password: 'password123'
};

// Test the login function
if (typeof apiService.login === 'function') {
  console.log('Login function exists and is callable');
  // Only attempt to call if it's a function
  apiService.login(credentials)
    .then(response => {
      console.log('Login success:', response);
    })
    .catch(error => {
      console.log('Login error:', error.message);
    });
} else {
  console.error('ERROR: apiService.login is not a function');
  console.log('apiService structure:', apiService);
}
