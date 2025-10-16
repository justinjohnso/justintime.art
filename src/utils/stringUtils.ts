/**
 * String manipulation utilities
 */

/**
 * Convert string to title case
 * 
 * @param str - String to convert
 * @returns Title cased string
 * 
 * @example
 * toTitleCase('hello world') // 'Hello World'
 * toTitleCase('HELLO WORLD') // 'Hello World'
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert kebab-case to Title Case
 * 
 * @param str - Kebab-case string
 * @returns Title cased string
 * 
 * @example
 * kebabToTitle('hello-world') // 'Hello World'
 * kebabToTitle('my-project-name') // 'My Project Name'
 */
export function kebabToTitle(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Convert Title Case to kebab-case
 * 
 * @param str - Title case string
 * @returns Kebab-case string
 * 
 * @example
 * titleToKebab('Hello World') // 'hello-world'
 * titleToKebab('My Project Name') // 'my-project-name'
 */
export function titleToKebab(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/**
 * Truncate string to specified length with ellipsis
 * 
 * @param str - String to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add (default: '...')
 * @returns Truncated string
 * 
 * @example
 * truncate('This is a long string', 10) // 'This is a...'
 * truncate('Short', 10) // 'Short'
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length - suffix.length) + suffix;
}

/**
 * Strip HTML tags from string
 * 
 * @param str - String with HTML
 * @returns String without HTML tags
 * 
 * @example
 * stripHtml('<p>Hello <strong>world</strong></p>') // 'Hello world'
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Create slug from string
 * 
 * @param str - String to slugify
 * @returns URL-safe slug
 * 
 * @example
 * slugify('Hello World!') // 'hello-world'
 * slugify('My Project (2024)') // 'my-project-2024'
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract excerpt from content
 * 
 * @param content - Full content string
 * @param length - Maximum length
 * @param stripTags - Whether to strip HTML tags
 * @returns Excerpt
 * 
 * @example
 * excerpt('This is a long article...', 50) // 'This is a long article...'
 */
export function excerpt(
  content: string,
  length: number = 150,
  stripTags: boolean = true
): string {
  let text = stripTags ? stripHtml(content) : content;
  text = text.trim();
  
  if (text.length <= length) return text;
  
  // Try to break at a word boundary
  const truncated = text.slice(0, length);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > length * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

/**
 * Count words in string
 * 
 * @param str - String to count
 * @returns Word count
 * 
 * @example
 * wordCount('Hello world') // 2
 * wordCount('The quick brown fox') // 4
 */
export function wordCount(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * Calculate reading time in minutes
 * 
 * @param text - Text content
 * @param wordsPerMinute - Reading speed (default: 200)
 * @returns Reading time in minutes
 * 
 * @example
 * readingTime('...long article...') // 5
 */
export function readingTime(text: string, wordsPerMinute: number = 200): number {
  const words = wordCount(text);
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Capitalize first letter of string
 * 
 * @param str - String to capitalize
 * @returns Capitalized string
 * 
 * @example
 * capitalize('hello') // 'Hello'
 * capitalize('HELLO') // 'HELLO' (only first letter affected)
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate random string
 * 
 * @param length - Length of string
 * @param chars - Characters to use
 * @returns Random string
 * 
 * @example
 * randomString(8) // 'a3f9k2m1'
 */
export function randomString(
  length: number = 8,
  chars: string = 'abcdefghijklmnopqrstuvwxyz0123456789'
): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
