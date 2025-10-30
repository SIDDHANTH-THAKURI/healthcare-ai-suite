#!/usr/bin/env node

/**
 * Quick script to toggle maintenance mode
 * Usage: node scripts/toggle-maintenance.js [on|off]
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../apps/web/src/config/maintenance.ts');
const args = process.argv.slice(2);
const command = args[0]?.toLowerCase();

if (!command || !['on', 'off', 'status'].includes(command)) {
  console.log('Usage: node scripts/toggle-maintenance.js [on|off|status]');
  console.log('');
  console.log('Commands:');
  console.log('  on      - Enable maintenance mode');
  console.log('  off     - Disable maintenance mode');
  console.log('  status  - Check current maintenance mode status');
  process.exit(1);
}

try {
  const content = fs.readFileSync(configPath, 'utf8');
  const currentStatus = content.includes('MAINTENANCE_MODE = true');

  if (command === 'status') {
    console.log('');
    console.log('🔍 Current Status:');
    console.log(`   Maintenance Mode: ${currentStatus ? '🔴 ENABLED' : '🟢 DISABLED'}`);
    console.log('');
    process.exit(0);
  }

  const shouldEnable = command === 'on';

  if (currentStatus === shouldEnable) {
    console.log('');
    console.log(`⚠️  Maintenance mode is already ${shouldEnable ? 'enabled' : 'disabled'}`);
    console.log('');
    process.exit(0);
  }

  const newContent = content.replace(
    /export const MAINTENANCE_MODE = (true|false);/,
    `export const MAINTENANCE_MODE = ${shouldEnable};`
  );

  fs.writeFileSync(configPath, newContent, 'utf8');

  console.log('');
  console.log('✅ Success!');
  console.log(`   Maintenance mode is now ${shouldEnable ? '🔴 ENABLED' : '🟢 DISABLED'}`);
  console.log('');
  
  if (shouldEnable) {
    console.log('🔧 Maintenance mode is active');
    console.log('   All routes will show the maintenance page');
    console.log('');
    console.log('💡 To disable: node scripts/toggle-maintenance.js off');
  } else {
    console.log('🚀 Site is now live');
    console.log('   All routes are accessible');
    console.log('');
    console.log('💡 To enable: node scripts/toggle-maintenance.js on');
  }
  console.log('');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
