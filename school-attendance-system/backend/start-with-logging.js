// This script starts the server with output redirection to a log file
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting server with output logging...');

// Clear previous log file
const logFile = path.join(__dirname, 'server_output.log');
fs.writeFileSync(logFile, '', 'utf8');

// Start server process with output redirection
const serverProcess = spawn('node', ['server.js'], {
  cwd: __dirname,
  stdio: ['ignore', 'pipe', 'pipe'] // stdin, stdout, stderr
});

// Create writable stream to log file
const logStream = fs.createWriteStream(logFile, { flags: 'a' });

// Pipe stdout and stderr to log file
serverProcess.stdout.pipe(logStream);
serverProcess.stderr.pipe(logStream);

// Also display output in console
serverProcess.stdout.on('data', (data) => {
  process.stdout.write(data);
});

serverProcess.stderr.on('data', (data) => {
  process.stderr.write(data);
});

console.log('Server started. Output is being logged to server_output.log');
console.log('Press Ctrl+C to stop the server.');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Stopping server...');
  serverProcess.kill();
  process.exit();
});
