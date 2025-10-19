/**
 * Utility functions for working with categories
 */

/**
 * Extract category slug from various formats
 * @param category - Can be a string slug, file path, or category object
 * @returns Extracted slug or null if invalid
 */
export function extractCategorySlug(category: any): string | null {
  if (!category) return null

  // If it's already a simple string slug
  if (typeof category === 'string' && !category.includes('/')) {
    return category
  }

  // If it's a file path (e.g., "src/content/categories/audio-installations.mdx")
  if (typeof category === 'string' && category.includes('/')) {
    const match = category.match(/([^/]+)\.mdx?$/)
    return match ? match[1] : null
  }

  // If it's an object with a 'category' property (TinaCMS format)
  if (typeof category === 'object' && 'category' in category) {
    const categoryPath = category.category as string
    const match = categoryPath?.match(/([^/]+)\.mdx?$/)
    return match ? match[1] : null
  }

  return null
}

/**
 * Extract slugs from an array of categories
 * @param categories - Array of categories in various formats
 * @returns Array of slugs with nulls filtered out
 */
export function extractCategorySlugs(categories: any[]): string[] {
  if (!Array.isArray(categories)) return []

  return categories
    .map(extractCategorySlug)
    .filter((slug): slug is string => slug !== null)
}
