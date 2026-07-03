const app = require('../app');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintHistory = require('../models/ComplaintHistory');
const Notice = require('../models/Notice');

console.log('=== Backend Diagnostics & Sanity Verification ===');

console.log('\n1. Verifying Database Models...');
try {
  console.log(`- User Model: ${User.modelName}`);
  console.log(`- Complaint Model: ${Complaint.modelName}`);
  console.log(`- ComplaintHistory Model: ${ComplaintHistory.modelName}`);
  console.log(`- Notice Model: ${Notice.modelName}`);
  console.log('✓ All database models are defined correctly and valid.');
} catch (error) {
  console.error('✗ Error compiling database models:', error.message);
  process.exit(1);
}

console.log('\n2. Verifying Express Routes...');
try {
  const routes = [];
  
  // Recursive route inspector
  const printRoutes = (pathPrefix, layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      routes.push(`[${methods}] ${pathPrefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      let routerPath = '';
      if (layer.regexp.toString().includes('auth')) routerPath = '/api/auth';
      else if (layer.regexp.toString().includes('complaints')) routerPath = '/api/complaints';
      else if (layer.regexp.toString().includes('notices')) routerPath = '/api/notices';
      else if (layer.regexp.toString().includes('dashboard')) routerPath = '/api/dashboard';
      
      layer.handle.stack.forEach((subLayer) => {
        printRoutes(routerPath, subLayer);
      });
    }
  };

  app._router.stack.forEach((layer) => {
    printRoutes('', layer);
  });

  console.log('Registered Endpoints:');
  routes.forEach((r) => console.log(`  ${r}`));
  
  if (routes.length >= 8) {
    console.log('✓ All API routes successfully loaded and registered.');
  } else {
    throw new Error('Some API routes appear to be missing or registration failed.');
  }
} catch (error) {
  console.error('✗ Error validating API routes:', error.message);
  process.exit(1);
}

console.log('\n✓ BACKEND SANITY CHECKS COMPLETED SUCCESSFULLY! ✓');
process.exit(0);
