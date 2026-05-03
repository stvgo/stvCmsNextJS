/**
 * Environment variable configuration
 * Server-only variables use plain names
 * Client-accessible variables use NEXT_PUBLIC_ prefix
 */

const requiredServerEnv = [
  // Add required server-side variables here
] as const;

const requiredPublicEnv = [
  // Add required public variables here
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
  NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '0.2.0',
  NEXT_PUBLIC_IMAGE_URL: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080',
  NEXT_PUBLIC_DEFAULT_THEME: (process.env.NEXT_PUBLIC_DEFAULT_THEME || 'bw') as 'dark' | 'bw',
  NEXT_PUBLIC_AUTH_GOOGLE_ID: process.env.NEXT_PUBLIC_AUTH_GOOGLE_ID || '',
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET || '',
  AUTH_SECRET: process.env.AUTH_SECRET || '',
  API_TIMEOUT: Number(process.env.API_TIMEOUT || '120000'),
  API_RETRY_ATTEMPTS: Number(process.env.API_RETRY_ATTEMPTS || '3'),
  API_RETRY_DELAY: Number(process.env.API_RETRY_DELAY || '1000'),
  DEFAULT_PAGE_SIZE: Number(process.env.DEFAULT_PAGE_SIZE || '20'),
  NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION: process.env.NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION !== 'false',
  NEXT_PUBLIC_ENABLE_QUERY_CACHING: process.env.NEXT_PUBLIC_ENABLE_QUERY_CACHING !== 'false',
  DEBUG: process.env.DEBUG === 'true',
} as const;

export type Env = typeof env;