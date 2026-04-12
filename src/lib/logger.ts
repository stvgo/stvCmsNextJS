/**
 * Production-safe logging utility
 * Automatically strips console.log in production builds
 */

const isDevelopment = process.env.NODE_ENV === 'development';
const isDebug = process.env.DEBUG === 'true';

export const logger = {
  /**
   * Development-only logging
   * Automatically disabled in production
   */
  debug: (...args: unknown[]) => {
    if (isDevelopment || isDebug) {
      console.info('[DEBUG]', ...args);
    }
  },

  /**
   * Standard info logging
   * Always enabled
   */
  info: (...args: unknown[]) => {
    console.info('[INFO]', ...args);
  },

  /**
   * Warning logging
   * Always enabled
   */
  warn: (...args: unknown[]) => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error logging
   * Always enabled
   */
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },

  /**
   * API request/response logging
   * Only in development mode
   */
  api: (message: string, data?: unknown) => {
    if (isDevelopment || isDebug) {
      console.log('[API]', message, data ? JSON.stringify(data, null, 2) : '');
    }
  },
};
