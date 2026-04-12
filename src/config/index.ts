/**
 * Application configuration
 * Centralized config management with type safety
 */

export const config = {
  /** API Configuration */
  api: {
    /** Base URL for API requests (uses proxy in browser, direct in SSR) */
    baseUrl: typeof window === 'undefined' 
      ? (process.env.API_URL || 'http://localhost:8080')
      : '/api',
    
    /** Base URL for image resources */
    imageBaseUrl: process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8080',
    
    /** Request timeout in milliseconds */
    timeout: Number(process.env.API_TIMEOUT || '10000'),
    
    /** Number of retry attempts */
    retryAttempts: Number(process.env.API_RETRY_ATTEMPTS || '3'),
    
    /** Base delay between retries in ms */
    retryDelay: Number(process.env.API_RETRY_DELAY || '1000'),
  },

  /** App Configuration */
  app: {
    /** Application name */
    name: process.env.NEXT_PUBLIC_APP_NAME || 'STV CMS',
    
    /** Application version */
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.2.0',
    
    /** Default theme */
    defaultTheme: (process.env.NEXT_PUBLIC_DEFAULT_THEME || 'dark') as 'dark' | 'bw',
  },

  /** Pagination */
  pagination: {
    /** Default page size */
    pageSize: Number(process.env.DEFAULT_PAGE_SIZE || '20'),
  },

  /** Feature Flags */
  features: {
    /** Enable image optimization */
    imageOptimization: process.env.NEXT_PUBLIC_ENABLE_IMAGE_OPTIMIZATION !== 'false',
    
    /** Enable query caching */
    queryCaching: process.env.NEXT_PUBLIC_ENABLE_QUERY_CACHING !== 'false',
  },
} as const;

/** Type for config object */
export type Config = typeof config;
