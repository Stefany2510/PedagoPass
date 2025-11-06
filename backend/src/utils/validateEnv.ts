/**
 * Backend Environment Validation
 * 
 * Checks if required environment variables are set.
 * In production, throws error; in dev, logs warning.
 */

const requiredEnvs = {
  'DATABASE_URL': 'MySQL connection string',
  'JWT_SECRET': 'Secret for signing JWT tokens',
  'CORS_ORIGIN': 'Allowed frontend origins',
};

const recommendedEnvs = {
  'NODE_ENV': 'Environment mode (development/production)',
  'LOG_LEVEL': 'Logging level',
  'COOKIE_SECURE': 'HTTPS-only cookies',
  'COOKIE_SAME_SITE': 'SameSite cookie policy',
  'SESSION_SECRET': 'Session secret for signed cookies',
};

function validateEnv() {
  const isProd = process.env.NODE_ENV === 'production';
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];

  // Check required
  Object.entries(requiredEnvs).forEach(([key, description]) => {
    if (!process.env[key]) {
      const msg = `Missing required: ${key} (${description})`;
      missingRequired.push(msg);
      if (isProd) {
        console.error(`❌ ${msg}`);
      } else {
        console.warn(`⚠️  ${msg}`);
      }
    } else {
      console.log(`✅ ${key} is set`);
    }
  });

  // Check recommended (only warn)
  Object.entries(recommendedEnvs).forEach(([key, description]) => {
    if (!process.env[key]) {
      const msg = `Missing recommended: ${key} (${description})`;
      missingRecommended.push(msg);
      console.warn(`⚠️  ${msg}`);
    } else {
      console.log(`✅ ${key} is set`);
    }
  });

  if (isProd && missingRequired.length > 0) {
    throw new Error(
      `Production environment validation failed:\n${missingRequired.join('\n')}`
    );
  }

  return {
    valid: missingRequired.length === 0,
    missing_required: missingRequired,
    missing_recommended: missingRecommended,
  };
}

export { validateEnv };
