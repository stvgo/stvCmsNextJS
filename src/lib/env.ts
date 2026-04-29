/**
 * Environment variable validation
 * Ensures all required env vars are present at startup
 */

const requiredServerEnv = [
  // Add required server-side variables here
  'AUTH_SECRET',
  'AUTH_GOOGLE_ID',
  'AUTH_GOOGLE_SECRET',
] as const;

const requiredPublicEnv = [
  // Add required public variables here
  // 'NEXT_PUBLIC_API_URL',
] as const;

/**
 * Validate environment variables
 * Throws error if required variables are missing
 */
export function validateEnv() {
  const missingServerVars = requiredServerEnv.filter(
    (key) => !process.env[key]
  );
  
  const missingPublicVars = requiredPublicEnv.filter(
    (key) => !process.env[key]
  );

  const allMissing = [...missingServerVars, ...missingPublicVars];

  if (allMissing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${allMissing
        .map((v) => `  - ${v}`)
        .join('\n')}\n\nPlease check your .env file`
    );
  }
}

/**
 * Type-safe environment variable access
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.API_URL || 'http://localhost:8080',
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'STV CMS',
  NEXT_PUBLIC_IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080',
  AUTH_SECRET: process.env.AUTH_SECRET || '',
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID || '',
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || '',
  DEBUG: process.env.DEBUG === 'true',
} as const;

export type Env = typeof env;
