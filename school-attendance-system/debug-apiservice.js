// debug-apiservice.js - A focused test script to debug the apiService
console.log('Starting apiService debug test...');

// Import the apiService directly using CommonJS require
const apiService = require('./src/services/apiService');

// Log the imported object for inspection
console.log('apiService:', apiService);
console.log('Type of apiService:', typeof apiService);
console.log('Is apiService null or undefined?', apiService === null || apiService === undefined);

// Check which methods are available
if (apiService && typeof apiService === 'object') {
  console.log('Available methods:', Object.keys(apiService));
  
  // Check if get method exists and is a function
  console.log('Has get method?', typeof apiService.get === 'function');
  console.log('Has post method?', typeof apiService.post === 'function');
  
  // Try to call the get method if it exists
  if (typeof apiService.get === 'function') {
    console.log('Attempting to call apiService.get()...');
    apiService.get('/csrf-token', { useCache: false })
      .then(response => {
        console.log('Get request succeeded:', response);
      })
      .catch(error => {
        console.error('Get request failed:', error);
      });
  }
}

// Exit after tests complete or on failure
setTimeout(() => {
  console.log('Debug test complete!');
  process.exit(0);
}, 5000);  // Give requests some time to complete
