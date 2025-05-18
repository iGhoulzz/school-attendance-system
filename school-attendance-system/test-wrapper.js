// test-wrapper.js - A test script to debug the apiServiceWrapper
// Use a try-catch block to better handle any errors

try {
  console.log('Attempting to import apiServiceWrapper...');
  
  const apiServiceWrapper = require('./src/services/apiServiceWrapper');
  
  // Test the apiServiceWrapper
  console.log('Testing apiServiceWrapper functionality...');
  console.log('apiServiceWrapper type:', typeof apiServiceWrapper);
  
  if (apiServiceWrapper) {
    console.log('apiServiceWrapper keys:', Object.keys(apiServiceWrapper));
    
    // Log direct properties
    for (const key in apiServiceWrapper) {
      console.log(`Property '${key}' is type:`, typeof apiServiceWrapper[key]);
    }
    
    if (typeof apiServiceWrapper.login === 'function') {
      console.log('Login function exists and is callable');
    } else {
      console.error('ERROR: apiServiceWrapper.login is not a function');
    }
  } else {
    console.error('apiServiceWrapper is null or undefined');
  }
} catch (error) {
  console.error('Error during testing:', error);
}

// Try loading the file directly to see if there are syntax errors
try {
  const fs = require('fs');
  const fileContent = fs.readFileSync('./src/services/apiServiceWrapper.js', 'utf-8');
  console.log('File was read successfully, content length:', fileContent.length);
  
  // Check the structure quickly
  console.log('File contains login function:', fileContent.includes('const login ='));
  console.log('File contains export default:', fileContent.includes('export default'));
} catch (fileError) {
  console.error('Error reading file:', fileError);
}
