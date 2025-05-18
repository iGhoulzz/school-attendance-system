// debug-api.js - A comprehensive test script to debug the apiService
// This can be run with Node.js directly: node debug-api.js

// Try to import with both CommonJS and ESM methods
console.log('Attempting to load apiService...');

// Method 1: CommonJS require
try {
  const apiService = require('./src/services/apiService');
  console.log('CommonJS import result:');
  console.log('- Type:', typeof apiService);
  console.log('- Is null or undefined?', apiService === null || apiService === undefined);
  if (apiService) {
    console.log('- Object keys:', Object.keys(apiService));
    console.log('- Has login?', typeof apiService.login === 'function');
    
    // If we have the apiService object but not the login method, it could be a nested structure
    if (typeof apiService === 'object' && apiService !== null) {
      console.log('- Checking for nested properties...');
      Object.keys(apiService).forEach(key => {
        console.log(`  - Key: ${key}, Type: ${typeof apiService[key]}`);
        
        // Check if one of the properties is an object with a login method
        if (typeof apiService[key] === 'object' && apiService[key] !== null) {
          console.log(`    - Sub-keys for ${key}:`, Object.keys(apiService[key]));
          console.log(`    - Has login?`, typeof apiService[key].login === 'function');
        }
      });
    }
    
    // Log the full structure
    console.log('Full apiService structure:', JSON.stringify(apiService, null, 2));
  }
} catch (error) {
  console.error('Error with CommonJS import:', error.message);
}

console.log('\n--------------------------------------------------\n');

// Check the structure of the original apiService definition in the file 
// to see if there's a mismatch between definition and export
try {
  // Read the file directly to analyze its structure
  const fs = require('fs');
  const apiServiceCode = fs.readFileSync('./src/services/apiService.js', 'utf-8');
  
  console.log('File analysis:');
  
  // Check for login method definition
  const hasLoginDef = apiServiceCode.includes('async login(');
  console.log('- Has login method definition?', hasLoginDef);
  
  // Check export style
  const hasDefaultExport = apiServiceCode.includes('export default');
  const hasNamedExports = apiServiceCode.includes('export {') || apiServiceCode.includes('export const');
  console.log('- Uses default export?', hasDefaultExport);
  console.log('- Uses named exports?', hasNamedExports);
  
  // Check module.exports
  const hasCommonJSExport = apiServiceCode.includes('module.exports');
  console.log('- Has CommonJS export?', hasCommonJSExport);
  
  // Verify if the login method is properly connected to the exported object
  console.log('\nLogin method definition:');
  const loginMethodMatch = apiServiceCode.match(/async\s+login\([^)]*\)\s*{[^}]*}/s);
  if (loginMethodMatch) {
    console.log('- Found login method definition:', loginMethodMatch[0].substring(0, 100) + '...');
  } else {
    console.log('- Could not find login method definition');
  }
  
  // How is apiService defined?
  const apiServiceDefMatch = apiServiceCode.match(/const\s+apiService\s*=\s*{[^}]*}/s);
  if (apiServiceDefMatch) {
    console.log('- Found apiService definition:', apiServiceDefMatch[0].substring(0, 100) + '...');
  } else {
    console.log('- Could not find clear apiService object definition');
  }
} catch (error) {
  console.error('Error analyzing file:', error.message);
}

console.log('\nRecommended fix:');
console.log('If login is defined but not exported, make sure the method is correctly added to the export object.');
