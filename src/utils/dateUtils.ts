/**
 * Date formatting utilities for consistent date display across the site
 */

export interface FormatOptions {
  format?: 'short' | 'long' | 'year' | 'month-year';
  locale?: string;
}

/**
 * Format a date string or Date object for display
 * 
 * @param date - Date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 * 
 * @example
 * formatDate('2024-03-15') // 'March 2024'
 * formatDate('2024-03-15', { format: 'long' }) // 'March 15, 2024'
 * formatDate('2024-03-15', { format: 'year' }) // '2024'
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: FormatOptions = {}
): string {
  if (!date) return '';

  const { format = 'month-year', locale = 'en-US' } = options;

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Handle invalid dates
    if (isNaN(dateObj.getTime())) {
      console.warn(`Invalid date: ${date}`);
      return '';
    }

    switch (format) {
      case 'short':
        // 3/15/24
        return dateObj.toLocaleDateString(locale, {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
        });

      case 'long':
        // March 15, 2024
        return dateObj.toLocaleDateString(locale, {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });

      case 'year':
        // 2024
        return dateObj.getFullYear().toString();

      case 'month-year':
      default:
        // March 2024
        return dateObj.toLocaleDateString(locale, {
          month: 'long',
          year: 'numeric',
        });
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a year number consistently
 * 
 * @param year - Year number
 * @returns Formatted year string or empty string if invalid
 * 
 * @example
 * formatYear(2024) // '2024'
 * formatYear(null) // ''
 */
export function formatYear(year: number | null | undefined): string {
  if (!year) return '';
  return year.toString();
}

/**
 * Get relative time string (e.g., "2 months ago", "3 years ago")
 * 
 * @param date - Date string or Date object
 * @param locale - Locale for formatting
 * @returns Relative time string
 * 
 * @example
 * getRelativeTime('2024-01-15') // '2 months ago' (if current date is March 2024)
 */
export function getRelativeTime(
  date: string | Date | null | undefined,
  locale: string = 'en-US'
): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
    } else if (diffDays > 0) {
      return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else {
      return 'Just now';
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
}

/**
 * Check if a date is in the past
 * 
 * @param date - Date string or Date object
 * @returns True if date is in the past
 */
export function isPast(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 * 
 * @param date - Date string or Date object
 * @returns True if date is in the future
 */
export function isFuture(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
}

/**
 * Sort array of items by date field
 * 
 * @param items - Array of items with date field
 * @param dateField - Name of the date field
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array
 * 
 * @example
 * sortByDate(projects, 'completedDate', 'desc')
 */
export function sortByDate<T extends Record<string, any>>(
  items: T[],
  dateField: keyof T,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField] as string).getTime();
    const dateB = new Date(b[dateField] as string).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}
