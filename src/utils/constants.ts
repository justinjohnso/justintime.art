/**
 * Application-wide constants
 */

/**
 * Responsive breakpoints (in pixels)
 * Should match Tailwind's default breakpoints
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const

/**
 * Sidebar dimensions
 */
export const SIDEBAR = {
  MIN_WIDTH_DESKTOP: '18rem', // 288px
  WIDTH_MD: '28%',
  WIDTH_LG: '24%',
  MOBILE_WIDTH: '280px',
} as const

/**
 * Layout spacing
 */
export const LAYOUT = {
  TOP_NAV_HEIGHT: '4rem', // 64px (h-16)
  MAIN_PADDING_MOBILE: '1rem',
  MAIN_PADDING_DESKTOP: '2rem',
} as const
