#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../apps/api-gateway/logs');

function analyzeLogs() {
  console.log('🔍 Analyzing Patient Portal Logs...\n');
  
  try {
    const files = fs.readdirSync(logsDir).filter(f => f.endsWith('.log'));
    
    if (files.length === 0) {
      console.log('No log files found in', logsDir);
      return;
    }
    
    files.forEach(file => {
      console.log(`📄 Analyzing ${file}:`);
      const content = fs.readFileSync(path.join(logsDir, file), 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      const stats = {
        total: lines.length,
        errors: 0,
        warnings: 0,
        patientClicks: 0,
        navigationErrors: 0,
        dataFetchErrors: 0,
        validationFailures: 0
      };
      
      lines.forEach(line => {
        if (line.includes('[ERROR]')) stats.errors++;
        if (line.includes('[WARN]')) stats.warnings++;
        if (line.includes('PATIENT_CLICK')) stats.patientClicks++;
        if (line.includes('PATIENT_NAVIGATION_ERROR')) stats.navigationErrors++;
        if (line.includes('PATIENT_DATA_FETCH_ERROR')) stats.dataFetchErrors++;
        if (line.includes('PATIENT_VALIDATION_FAILED')) stats.validationFailures++;
      });
      
      console.log(`  📊 Total entries: ${stats.total}`);
      console.log(`  ❌ Errors: ${stats.errors}`);
      console.log(`  ⚠️  Warnings: ${stats.warnings}`);
      console.log(`  👆 Patient clicks: ${stats.patientClicks}`);
      console.log(`  🚫 Navigation errors: ${stats.navigationErrors}`);
      console.log(`  📡 Data fetch errors: ${stats.dataFetchErrors}`);
      console.log(`  ✅ Validation failures: ${stats.validationFailures}`);
      
      if (stats.navigationErrors > 0) {
        console.log('\n🔍 Recent navigation errors:');
        lines.filter(line => line.includes('PATIENT_NAVIGATION_ERROR'))
             .slice(-3)
             .forEach(line => console.log(`    ${line}`));
      }
      
      console.log('\n' + '='.repeat(50) + '\n');
    });
    
  } catch (error) {
    console.error('Error analyzing logs:', error.message);
  }
}

if (require.main === module) {
  analyzeLogs();
}

module.exports = { analyzeLogs };