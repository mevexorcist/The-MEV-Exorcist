#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies that the frontend deployment configuration is correct
 * and all required files are in place.
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'vercel.json',
  '.env.local.example',
  '.env.production.example',
  'DEPLOYMENT.md',
  'DEPLOYMENT-CHECKLIST.md',
  'package.json',
  'next.config.mjs',
];

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_BACKEND_URL',
  'NEXT_PUBLIC_ETHERSCAN_BASE',
];

let errors = 0;
let warnings = 0;

console.log('🔍 Verifying Frontend Deployment Configuration...\n');

// Check required files exist
console.log('📁 Checking required files...');
REQUIRED_FILES.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✓ ${file}`);
  } else {
    console.log(`  ✗ ${file} - MISSING`);
    errors++;
  }
});

// Check vercel.json configuration
console.log('\n⚙️  Checking vercel.json configuration...');
try {
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'vercel.json'), 'utf8'));
  
  if (vercelConfig.framework === 'nextjs') {
    console.log('  ✓ Framework set to Next.js');
  } else {
    console.log('  ⚠ Framework not set to Next.js');
    warnings++;
  }
  
  if (vercelConfig.headers && vercelConfig.headers.length > 0) {
    console.log('  ✓ Security headers configured');
    
    const cspHeader = vercelConfig.headers[0].headers.find(h => h.key === 'Content-Security-Policy');
    if (cspHeader) {
      console.log('  ✓ Content-Security-Policy header present');
      
      if (cspHeader.value.includes('wss://*')) {
        console.log('  ✓ CSP allows WebSocket connections');
      } else {
        console.log('  ⚠ CSP may not allow WebSocket connections');
        warnings++;
      }
    } else {
      console.log('  ⚠ Content-Security-Policy header missing');
      warnings++;
    }
  } else {
    console.log('  ⚠ No security headers configured');
    warnings++;
  }
} catch (error) {
  console.log(`  ✗ Error reading vercel.json: ${error.message}`);
  errors++;
}

// Check package.json scripts
console.log('\n📦 Checking package.json scripts...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  
  const requiredScripts = ['dev', 'build', 'start', 'test'];
  requiredScripts.forEach(script => {
    if (packageJson.scripts && packageJson.scripts[script]) {
      console.log(`  ✓ Script "${script}" present`);
    } else {
      console.log(`  ✗ Script "${script}" missing`);
      errors++;
    }
  });
  
  // Check for required dependencies
  const requiredDeps = ['next', 'react', 'socket.io-client'];
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✓ Dependency "${dep}" present`);
    } else {
      console.log(`  ✗ Dependency "${dep}" missing`);
      errors++;
    }
  });
} catch (error) {
  console.log(`  ✗ Error reading package.json: ${error.message}`);
  errors++;
}

// Check environment variable examples
console.log('\n🔐 Checking environment variable examples...');
try {
  const envExample = fs.readFileSync(path.join(__dirname, '.env.local.example'), 'utf8');
  
  REQUIRED_ENV_VARS.forEach(envVar => {
    if (envExample.includes(envVar)) {
      console.log(`  ✓ ${envVar} documented`);
    } else {
      console.log(`  ⚠ ${envVar} not documented in .env.local.example`);
      warnings++;
    }
  });
} catch (error) {
  console.log(`  ✗ Error reading .env.local.example: ${error.message}`);
  errors++;
}

// Check Next.js configuration
console.log('\n⚡ Checking Next.js configuration...');
try {
  const nextConfig = fs.readFileSync(path.join(__dirname, 'next.config.mjs'), 'utf8');
  
  if (nextConfig.includes('eslint')) {
    console.log('  ✓ ESLint configuration present');
  } else {
    console.log('  ⚠ ESLint configuration may need adjustment');
    warnings++;
  }
} catch (error) {
  console.log(`  ✗ Error reading next.config.mjs: ${error.message}`);
  errors++;
}

// Check documentation
console.log('\n📚 Checking documentation...');
try {
  const deploymentMd = fs.readFileSync(path.join(__dirname, 'DEPLOYMENT.md'), 'utf8');
  
  const requiredSections = [
    'Environment Variables',
    'Build Configuration',
    'Deploy to Vercel',
    'Browser and Device Testing',
    'Socket.io Connection',
  ];
  
  requiredSections.forEach(section => {
    if (deploymentMd.includes(section)) {
      console.log(`  ✓ Section "${section}" present`);
    } else {
      console.log(`  ⚠ Section "${section}" may be missing`);
      warnings++;
    }
  });
} catch (error) {
  console.log(`  ✗ Error reading DEPLOYMENT.md: ${error.message}`);
  errors++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Verification Summary');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✅ All checks passed! Deployment configuration is ready.');
  console.log('\n📝 Next steps:');
  console.log('  1. Push code to Git repository');
  console.log('  2. Connect repository to Vercel');
  console.log('  3. Configure environment variables in Vercel');
  console.log('  4. Deploy and test');
  console.log('\n📖 See DEPLOYMENT.md for detailed instructions.');
  process.exit(0);
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} error(s) found - must be fixed before deployment`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} warning(s) found - review recommended`);
  }
  console.log('\n📖 See DEPLOYMENT.md for configuration details.');
  process.exit(errors > 0 ? 1 : 0);
}
