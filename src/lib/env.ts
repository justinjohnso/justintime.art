/**
 * Environment Variable Utilities
 *
 * Type-safe access to environment variables with validation
 */

/**
 * Get a required environment variable
 * Throws if not found
 */
export function getRequiredEnv(key: string): string {
  const value = import.meta.env?.[key] || process.env[key]

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }

  return value
}

/**
 * Get an optional environment variable with default
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  return import.meta.env?.[key] || process.env[key] || defaultValue
}

/**
 * Get a numeric environment variable
 */
export function getEnvNumber(key: string, defaultValue: number): number {
  const value = import.meta.env?.[key] || process.env[key]

  if (!value) {
    return defaultValue
  }

  const parsed = parseInt(value, 10)

  if (isNaN(parsed)) {
    console.warn(`[ENV] Invalid number for ${key}: ${value}, using default: ${defaultValue}`)
    return defaultValue
  }

  return parsed
}

/**
 * Get a boolean environment variable
 */
export function getEnvBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = import.meta.env?.[key] || process.env[key]

  if (!value) {
    return defaultValue
  }

  return value.toLowerCase() === 'true'
}

/**
 * Validate that all required environment variables are present
 * Call this at app startup
 */
export function validateEnv(): void {
   const required = ['PUBLIC_TINA_CLIENT_ID', 'TINA_TOKEN']

  const missing: string[] = []

  for (const key of required) {
    const value = import.meta.env?.[key] || process.env[key]
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  - ${missing.join('\n  - ')}\n\n` +
        `Please check your .env file against .env.example`,
    )
  }
}

/**
 * Validate Notion-specific environment variables
 * Call this before any Notion API operations
 */
export function validateNotionEnv(options: { requireBlogDbId?: boolean } = {}): void {
  const required = ['NOTION_API_KEY', 'NOTION_PROJECTS_DB_ID']
  if (options.requireBlogDbId) {
    required.push('NOTION_BLOG_DB_ID')
  }

  const missing: string[] = []

  for (const key of required) {
    const value = import.meta.env?.[key] || process.env[key]
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Notion environment variables:\n  - ${missing.join('\n  - ')}\n\n` +
        `Please check your .env file against .env.example`,
    )
  }
}

const RESUME_NOTION_ENV_KEYS = [
  'NOTION_RESUME_ROLES_DB_ID',
  'NOTION_RESUME_EDUCATION_DB_ID',
  'NOTION_RESUME_SKILLS_DB_ID',
] as const

export interface ResumeNotionConfig {
  rolesDbId: string
  educationDbId: string
  skillsDbId: string
}

/**
 * Validate optional resume-specific Notion environment variables.
 * Returns false (with warning) when resume sync config is incomplete.
 */
export function validateResumeNotionEnv(): boolean {
  const missing: string[] = []

  for (const key of RESUME_NOTION_ENV_KEYS) {
    const value = import.meta.env?.[key] || process.env[key]
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️  Resume sync skipped: missing optional resume environment variables:\n  - ${missing.join('\n  - ')}`,
    )
    return false
  }

  return true
}

/**
 * Get resume-specific Notion configuration.
 * Returns null when optional resume sync config is not fully set.
 */
export function getResumeNotionConfig(): ResumeNotionConfig | null {
  if (!validateResumeNotionEnv()) {
    return null
  }

  return {
    rolesDbId: getRequiredEnv('NOTION_RESUME_ROLES_DB_ID'),
    educationDbId: getRequiredEnv('NOTION_RESUME_EDUCATION_DB_ID'),
    skillsDbId: getRequiredEnv('NOTION_RESUME_SKILLS_DB_ID'),
  }
}

/**
 * Get all Notion configuration
 */
export function getNotionConfig() {
  validateNotionEnv()

  return {
    apiKey: getRequiredEnv('NOTION_API_KEY'),
    projectsDbId: getRequiredEnv('NOTION_PROJECTS_DB_ID'),
    blogDbId: getEnv('NOTION_BLOG_DB_ID'),
    webhookSecret: getEnv('NOTION_WEBHOOK_SECRET'),
  }
}

/**
 * Get site configuration
 */
export function getSiteConfig() {
  return {
    url: getEnv('PUBLIC_SITE_URL', 'http://localhost:4321'),
    title: getEnv('PUBLIC_SITE_TITLE', 'Portfolio'),
    description: getEnv('PUBLIC_SITE_DESCRIPTION', 'My Portfolio'),
  }
}

/**
 * Get media storage configuration
 */
export function getMediaConfig() {
  return {
    storagePath: getEnv('MEDIA_STORAGE_PATH', 'media'),
    maxImageSize: getEnvNumber('MAX_IMAGE_SIZE', 5 * 1024 * 1024), // 5MB
  }
}

/**
 * Get rate limiting configuration
 */
export function getRateLimitConfig() {
  return {
    window: getEnvNumber('RATE_LIMIT_WINDOW', 60000), // 1 minute
    maxRequests: getEnvNumber('RATE_LIMIT_MAX_REQUESTS', 10),
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return getEnv('NODE_ENV', 'development') === 'development'
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return getEnv('NODE_ENV') === 'production'
}
