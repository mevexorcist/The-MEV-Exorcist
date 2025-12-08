#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that a deployed MEV Exorcist backend is functioning correctly.
 * 
 * Usage:
 *   node scripts/verify-deployment.js <backend-url>
 * 
 * Example:
 *   node scripts/verify-deployment.js https://mev-exorcist-backend.railway.app
 */

const https = require('https');
const http = require('http');

// Get backend URL from command line argument
const backendUrl = process.argv[2];

if (!backendUrl) {
  console.error('Error: Backend URL is required');
  console.error('Usage: node scripts/verify-deployment.js <backend-url>');
  console.error('Example: node scripts/verify-deployment.js https://mev-exorcist-backend.railway.app');
  process.exit(1);
}

// Parse URL
let parsedUrl;
try {
  parsedUrl = new URL(backendUrl);
} catch (error) {
  console.error('Error: Invalid URL format');
  console.error('Please provide a valid URL starting with http:// or https://');
  process.exit(1);
}

console.log('=== MEV Exorcist Backend Deployment Verification ===');
console.log('');
console.log(`Testing backend at: ${backendUrl}`);
console.log('');

/**
 * Test 1: Health Check Endpoint
 */
async function testHealthCheck() {
  return new Promise((resolve, reject) => {
    console.log('Test 1: Health Check Endpoint');
    console.log('  Endpoint: /health');
    console.log('  Method: GET');
    
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    const healthUrl = `${backendUrl}/health`;
    
    const req = protocol.get(healthUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const health = JSON.parse(data);
            console.log('  ✓ Status Code: 200');
            console.log('  ✓ Response:', JSON.stringify(health, null, 2).split('\n').map((line, i) => i === 0 ? line : '    ' + line).join('\n'));
            
            // Validate response structure
            if (health.status === 'ok' && typeof health.connections === 'number' && typeof health.uptime === 'number') {
              console.log('  ✓ Health check passed');
              console.log('');
              resolve(true);
            } else {
              console.log('  ✗ Invalid health check response structure');
              console.log('');
              resolve(false);
            }
          } catch (error) {
            console.log('  ✗ Failed to parse JSON response');
            console.log('  Response:', data);
            console.log('');
            resolve(false);
          }
        } else {
          console.log(`  ✗ Status Code: ${res.statusCode}`);
          console.log('  Response:', data);
          console.log('');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('  ✗ Request failed:', error.message);
      console.log('');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('  ✗ Request timeout (10s)');
      console.log('');
      resolve(false);
    });
  });
}

/**
 * Test 2: Socket.io Connection
 */
async function testSocketConnection() {
  return new Promise((resolve) => {
    console.log('Test 2: Socket.io Connection');
    console.log('  Testing WebSocket upgrade capability...');
    
    // We can't fully test Socket.io without the client library,
    // but we can check if the server responds to HTTP requests
    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    const socketPath = `${backendUrl}/socket.io/?EIO=4&transport=polling`;
    
    const req = protocol.get(socketPath, (res) => {
      if (res.statusCode === 200) {
        console.log('  ✓ Socket.io endpoint is accessible');
        console.log('  ✓ Server supports Socket.io connections');
        console.log('');
        resolve(true);
      } else {
        console.log(`  ✗ Unexpected status code: ${res.statusCode}`);
        console.log('  Note: Socket.io may still work, but endpoint check failed');
        console.log('');
        resolve(false);
      }
    });
    
    req.on('error', (error) => {
      console.log('  ✗ Socket.io endpoint check failed:', error.message);
      console.log('  Note: This may be normal if CORS is restricted');
      console.log('');
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log('  ✗ Request timeout (10s)');
      console.log('');
      resolve(false);
    });
  });
}

/**
 * Run all tests
 */
async function runTests() {
  const results = [];
  
  results.push(await testHealthCheck());
  results.push(await testSocketConnection());
  
  // Summary
  console.log('=== Verification Summary ===');
  console.log('');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`Tests Passed: ${passed}/${total}`);
  console.log('');
  
  if (passed === total) {
    console.log('✓ All tests passed! Backend is ready for use.');
    console.log('');
    console.log('Next steps:');
    console.log('  1. Update frontend NEXT_PUBLIC_BACKEND_URL to:', backendUrl);
    console.log('  2. Deploy frontend to Vercel');
    console.log('  3. Test end-to-end functionality');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed. Please review the errors above.');
    console.log('');
    console.log('Common issues:');
    console.log('  - Backend is still starting up (wait 30-60 seconds)');
    console.log('  - Environment variables not configured correctly');
    console.log('  - Build failed (check deployment logs)');
    console.log('  - Network/firewall issues');
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
