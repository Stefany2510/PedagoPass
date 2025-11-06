#!/usr/bin/env node
/**
 * Print Environment Audit Report
 * 
 * Reads ops/env/env-audit.json and prints a formatted table
 * of required vs optional environment variables.
 * 
 * Run: node ops/env/print-env-audit.cjs
 */

const fs = require('fs');
const path = require('path');

const auditFile = path.join(__dirname, 'env-audit.json');

if (!fs.existsSync(auditFile)) {
  console.error(`❌ Audit file not found: ${auditFile}`);
  process.exit(1);
}

const audit = JSON.parse(fs.readFileSync(auditFile, 'utf-8'));

const required = audit.filter((e) => e.required);
const optional = audit.filter((e) => !e.required);
const backendEnvs = audit.filter((e) => e.scope === 'backend');
const frontendEnvs = audit.filter((e) => e.scope === 'frontend');

console.log('\n' + '='.repeat(80));
console.log('📋 PedagoPass Environment Variables Audit Report');
console.log('='.repeat(80));

console.log('\n📊 Summary');
console.log(`  Total: ${audit.length} variables`);
console.log(`  Required: ${required.length}`);
console.log(`  Optional: ${optional.length}`);
console.log(`  Backend: ${backendEnvs.length}`);
console.log(`  Frontend: ${frontendEnvs.length}`);

console.log('\n' + '='.repeat(80));
console.log('🔐 Required Variables (Must be set in production)');
console.log('='.repeat(80));

required.forEach((env) => {
  console.log(`\n  ${env.name}`);
  console.log(`    Scope: ${env.scope}`);
  console.log(`    Description: ${env.description}`);
  console.log(`    Default: ${env.default || '(none)'}`);
  console.log(`    Used in: ${env.used_in.join(', ')}`);
});

console.log('\n' + '='.repeat(80));
console.log('⚙️  Optional Variables');
console.log('='.repeat(80));

optional.forEach((env) => {
  console.log(`\n  ${env.name}`);
  console.log(`    Scope: ${env.scope}`);
  console.log(`    Description: ${env.description}`);
  console.log(`    Default: ${env.default || '(none)'}`);
});

console.log('\n' + '='.repeat(80));
console.log('✅ Report Generated');
console.log('='.repeat(80) + '\n');
