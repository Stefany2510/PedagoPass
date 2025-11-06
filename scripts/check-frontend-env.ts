#!/usr/bin/env node
/**
 * Frontend Environment Validation Script
 * 
 * Checks if required NEXT_PUBLIC_* variables are set.
 * Run: npx ts-node scripts/check-frontend-env.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const requiredPublicEnvs = {
  'NEXT_PUBLIC_API_URL': 'Backend API URL',
};

const optionalPublicEnvs = {
  'NEXT_PUBLIC_ENV': 'Environment identifier',
  'NEXT_PUBLIC_DEMO_EMAIL': 'Demo login email',
  'NEXT_PUBLIC_DEMO_PASSWORD': 'Demo login password',
};

function loadEnv(): Record<string, string> {
  const envFiles = [
    path.join(process.cwd(), '.env.local'),
    path.join(process.cwd(), '.env'),
  ];

  const env: Record<string, string> = {};

  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      console.log(`📄 Loading ${file}`);
      const config = dotenv.config({ path: file });
      Object.assign(env, config.parsed || {});
      break;
    }
  }

  // Also check process.env (from Netlify, etc.)
  Object.assign(env, process.env);

  return env;
}

function validateEnv() {
  const env = loadEnv();
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];

  // Check required
  Object.entries(requiredPublicEnvs).forEach(([key, description]) => {
    if (!env[key]) {
      const msg = `Missing required: ${key} (${description})`;
      missingRequired.push(msg);
      console.error(`❌ ${msg}`);
    } else {
      console.log(`✅ ${key}: ${env[key]}`);
    }
  });

  // Check optional
  Object.entries(optionalPublicEnvs).forEach(([key, description]) => {
    if (!env[key]) {
      const msg = `Missing optional: ${key} (${description})`;
      missingOptional.push(msg);
      console.warn(`⚠️  ${msg}`);
    } else {
      const masked = env[key].length > 20 ? env[key].slice(0, 20) + '...' : env[key];
      console.log(`✅ ${key}: ${masked}`);
    }
  });

  // Warnings
  if (missingRequired.length > 0) {
    console.error(
      `\n❌ Validation failed: ${missingRequired.length} required env(s) missing`
    );
    return false;
  }

  if (missingOptional.length > 0) {
    console.warn(
      `\n⚠️  ${missingOptional.length} optional env(s) not set`
    );
  }

  console.log('\n✅ Frontend environment validation passed');
  return true;
}

// Run
const success = validateEnv();
process.exit(success ? 0 : 1);
