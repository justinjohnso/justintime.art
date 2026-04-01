/**
 * Data Transformation Utilities
 *
 * Transform Notion API responses to portfolio data structures.
 * Output matches TinaCMS frontmatter format exactly.
 */

import type {
  NotionProjectPage,
  NotionBlogPost,
  NotionRichText,
  PortfolioBlogPost,
} from '../types/notion'

/**
 * Category name mapping from Notion multi_select names to category file slugs.
 * Keys are lowercased for case-insensitive matching.
 */
const CATEGORY_NAME_TO_SLUG: Record<string, string> = {
  // Slug-format values (current Notion multi-select names)
  'theatre': 'theatre',
  'web-development': 'web-development',
  'audio-installations': 'audio-installations',
  'intro-to-fabrication': 'intro-to-fabrication',
  'music': 'music',
  'physical-computing': 'physical-computing',
  // Human-readable fallbacks
  'sound design': 'theatre',
  'sound design for theatre': 'theatre',
  'theater': 'theatre',
  'web development': 'web-development',
  'web': 'web-development',
  'audio installations': 'audio-installations',
  'audio': 'audio-installations',
  'fabrication': 'intro-to-fabrication',
  'intro to fabrication': 'intro-to-fabrication',
  'music & podcasts': 'music',
}

/**
 * Map a Notion category name to a TinaCMS category reference path
 */
export function mapCategoryToReference(notionCategoryName: string): string | null {
  const normalized = notionCategoryName.toLowerCase().trim()
  const slug = CATEGORY_NAME_TO_SLUG[normalized]

  if (!slug) {
    console.warn(`[Transform] Unknown category: "${notionCategoryName}" — skipping`)
    return null
  }

  return `src/content/categories/${slug}.mdx`
}

/**
 * Result of transforming a Notion project page
 */
export interface TransformedProject {
  slug: string
  title: string
  frontmatter: Record<string, any>
  bodyText: string
  heroImageUrl?: string
  additionalImageUrls: string[]
}

/**
 * Extract plain text from Notion rich text array
 */
export function extractPlainText(richText: NotionRichText[]): string {
  return richText.map((rt) => rt.plain_text).join('')
}

/**
 * Convert Notion rich text array to Markdown with formatting
 */
function richTextToMarkdown(richText: NotionRichText[]): string {
  return richText
    .map((rt) => {
      let text = rt.plain_text
      if (rt.annotations?.code) text = `\`${text}\``
      if (rt.annotations?.bold) text = `**${text}**`
      if (rt.annotations?.italic) text = `*${text}*`
      if (rt.annotations?.strikethrough) text = `~~${text}~~`
      if (rt.href) text = `[${text}](${rt.href})`
      return text
    })
    .join('')
}

/**
 * Transform Notion project to TinaCMS-compatible frontmatter.
 * Output format matches what TinaCMS writes to MDX files.
 */
export function transformNotionProject(notionPage: NotionProjectPage): TransformedProject {
  const props = notionPage.properties

  const title = extractPlainText(props.Title.title)
  const slug = props.Slug?.rich_text
    ? extractPlainText(props.Slug.rich_text)
    : generateSlug(title)

  // Map categories to TinaCMS reference format: [{ category: 'src/content/categories/<slug>.mdx' }]
  const categories = (props.Categories?.multi_select || [])
    .map((cat: any) => {
      const ref = mapCategoryToReference(cat.name)
      return ref ? { category: ref } : null
    })
    .filter(Boolean)

  // Extract dateCompleted from Date field (user renamed "Year" → "Date Completed", changed to date type)
  const dateCompleted = props['Date Completed']?.date?.start
    || (props.Year?.number ? `${props.Year.number}-01-01` : undefined)

  // Extract media embed URL (user changed from rich_text to URL type)
  const mediaEmbed = props['Media Embed']?.url
    || props['Media Embed']?.rich_text?.[0]?.plain_text
    || undefined

  // Parse links from rich text
  const links = props['Links (Rich Text)']?.rich_text
    ? parseLinksFromRichText(props['Links (Rich Text)'].rich_text)
    : []

  // Extract featured status (checkbox in Notion)
  const featured = props.Featured?.checkbox === true

  // Extract body text from rich text property
  const bodyText = props['Body Text']?.rich_text
    ? richTextToMarkdown(props['Body Text'].rich_text)
    : ''

  // Extract hero image URL for download
  const heroImageUrl = props['Hero Image File']?.files?.[0]?.file?.url || undefined

  // Extract additional image URLs for download
  const additionalImageUrls = (props['Additional Image Files']?.files || [])
    .map((f: any) => f.file?.url)
    .filter(Boolean) as string[]

  // Build frontmatter matching TinaCMS format (no slug — filename is the slug)
  const frontmatter: Record<string, any> = { title }

  const description = props.Description?.rich_text
    ? extractPlainText(props.Description.rich_text)
    : ''
  if (description) frontmatter.description = description
  if (featured) frontmatter.featured = true
  if (dateCompleted) frontmatter.dateCompleted = dateCompleted
  if (categories.length > 0) frontmatter.categories = categories
  if (mediaEmbed) frontmatter.mediaEmbed = mediaEmbed
  if (links.length > 0) frontmatter.links = links

  return { slug, title, frontmatter, bodyText, heroImageUrl, additionalImageUrls }
}

/**
 * Transform Notion blog post to portfolio blog post
 */
export function transformNotionBlogPost(
  notionPage: NotionBlogPost,
): Omit<PortfolioBlogPost, 'body'> {
  const props = notionPage.properties

  return {
    title: extractPlainText(props.Title.title),
    description: extractPlainText(props.Description.rich_text),
    date: props.Date.date?.start || new Date().toISOString(),
    categories: props.Categories.multi_select.map((cat) => cat.name),
    featuredImage: undefined, // Will be populated by download process
  }
}

/**
 * Parse links from Notion rich text
 * Handles Notion's native links (href property) first, then falls back to parsing text
 * Expected text formats: "[Title](URL)" or "Title (URL)" or plain URLs
 */
export function parseLinksFromRichText(
  richText: NotionRichText[],
): Array<{ title: string; url: string; type?: string }> {
  const links: Array<{ title: string; url: string; type?: string }> = []

  // First, extract native Notion links (most reliable)
  for (const rt of richText) {
    if (rt.href) {
      links.push({
        title: rt.plain_text || new URL(rt.href).hostname,
        url: rt.href,
        type: inferLinkType(rt.href),
      })
    }
  }

  // If no native links found, try parsing text
  if (links.length === 0) {
    const text = extractPlainText(richText)

    // Try markdown format: [Title](URL)
    const markdownLinks = text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)
    for (const match of markdownLinks) {
      links.push({
        title: match[1],
        url: match[2],
        type: inferLinkType(match[2]),
      })
    }

    // If still none, try: Title (URL)
    if (links.length === 0) {
      const parenLinks = text.matchAll(/([^(]+)\(([^)]+)\)/g)
      for (const match of parenLinks) {
        const url = match[2].trim()
        if (url.startsWith('http')) {
          links.push({
            title: match[1].trim(),
            url: url,
            type: inferLinkType(url),
          })
        }
      }
    }
  }

  return links
}

/**
 * Infer link type from URL
 */
function inferLinkType(url: string): 'github' | 'live' | 'demo' | 'other' {
  if (url.includes('github.com')) return 'github'
  if (url.includes('vercel.app') || url.includes('netlify.app')) return 'demo'
  // Could add more heuristics here
  return 'other'
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Format a scalar value for YAML output
 */
function formatYamlValue(value: string | number | boolean): string {
  if (typeof value === 'string') {
    const escaped = value.replace(/"/g, '\\"')
    return `"${escaped}"`
  }
  return String(value)
}

/**
 * Generate frontmatter for MDX file.
 * Handles TinaCMS format including nested object arrays (categories, links, additionalImages).
 */
export function generateFrontmatter(data: Record<string, any>): string {
  const lines = ['---']

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      if (value.length === 0) continue
      lines.push(`${key}:`)
      for (const item of value) {
        if (typeof item === 'string') {
          lines.push(`  - ${formatYamlValue(item)}`)
        } else if (typeof item === 'object') {
          const entries = Object.entries(item).filter(
            ([, v]) => v !== undefined && v !== null,
          )
          if (entries.length > 0) {
            const [firstKey, firstVal] = entries[0]
            lines.push(`  - ${firstKey}: ${formatYamlValue(firstVal as string | number | boolean)}`)
            for (let i = 1; i < entries.length; i++) {
              const [k, v] = entries[i]
              lines.push(`    ${k}: ${formatYamlValue(v as string | number | boolean)}`)
            }
          }
        }
      }
    } else if (typeof value === 'string') {
      if (value.includes('\n')) {
        lines.push(`${key}: >`)
        const indented = value
          .split('\n')
          .map((line) => `  ${line}`)
          .join('\n')
        lines.push(indented)
      } else {
        lines.push(`${key}: ${formatYamlValue(value)}`)
      }
    } else {
      lines.push(`${key}: ${value}`)
    }
  }

  lines.push('---')
  lines.push('')

  return lines.join('\n')
}
