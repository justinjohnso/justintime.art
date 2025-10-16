/**
 * Data Transformation Utilities
 * 
 * Transform Notion API responses to portfolio data structures
 */

import type {
  NotionProjectPage,
  NotionBlogPost,
  NotionRichText,
  PortfolioProject,
  PortfolioBlogPost,
} from '../types/notion';

/**
 * Extract plain text from Notion rich text array
 */
export function extractPlainText(richText: NotionRichText[]): string {
  return richText.map(rt => rt.plain_text).join('');
}

/**
 * Transform Notion project to portfolio project
 */
export function transformNotionProject(
  notionPage: NotionProjectPage
): Omit<PortfolioProject, 'body'> {
  const props = notionPage.properties;

  return {
    title: extractPlainText(props.Title.title),
    description: extractPlainText(props.Description.rich_text),
    yearCompleted: props.Year.number || undefined,
    mediaEmbed: extractPlainText(props['Media Embed'].rich_text) || undefined,
    categories: props.Categories.multi_select.map(cat => cat.name),
    
    // Image will be populated by download process
    image: undefined,
    additionalImages: [],
    
    // Links need to be parsed from rich text
    links: parseLinksFromRichText(props['Links (Rich Text)'].rich_text),
  };
}

/**
 * Transform Notion blog post to portfolio blog post
 */
export function transformNotionBlogPost(
  notionPage: NotionBlogPost
): Omit<PortfolioBlogPost, 'body'> {
  const props = notionPage.properties;

  return {
    title: extractPlainText(props.Title.title),
    description: extractPlainText(props.Description.rich_text),
    date: props.Date.date?.start || new Date().toISOString(),
    categories: props.Categories.multi_select.map(cat => cat.name),
    featuredImage: undefined, // Will be populated by download process
  };
}

/**
 * Parse links from Notion rich text
 * Expected format: "Title (URL)" or "[Title](URL)" or just URLs
 */
export function parseLinksFromRichText(
  richText: NotionRichText[]
): Array<{ title: string; url: string; type?: string }> {
  const links: Array<{ title: string; url: string; type?: string }> = [];
  const text = extractPlainText(richText);

  // Try to parse links from text
  // Format 1: [Title](URL)
  const markdownLinks = text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g);
  for (const match of markdownLinks) {
    links.push({
      title: match[1],
      url: match[2],
      type: inferLinkType(match[2]),
    });
  }

  // Format 2: Title (URL)
  if (links.length === 0) {
    const parenLinks = text.matchAll(/([^(]+)\(([^)]+)\)/g);
    for (const match of parenLinks) {
      const url = match[2].trim();
      if (url.startsWith('http')) {
        links.push({
          title: match[1].trim(),
          url: url,
          type: inferLinkType(url),
        });
      }
    }
  }

  // Format 3: Just URLs (one per line)
  if (links.length === 0) {
    const urls = text.match(/https?:\/\/[^\s]+/g);
    if (urls) {
      for (const url of urls) {
        links.push({
          title: new URL(url).hostname,
          url: url,
          type: inferLinkType(url),
        });
      }
    }
  }

  // Also check for href in rich text objects
  for (const rt of richText) {
    if (rt.href) {
      const existingLink = links.find(l => l.url === rt.href);
      if (!existingLink) {
        links.push({
          title: rt.plain_text || new URL(rt.href).hostname,
          url: rt.href,
          type: inferLinkType(rt.href),
        });
      }
    }
  }

  return links;
}

/**
 * Infer link type from URL
 */
function inferLinkType(url: string): 'github' | 'live' | 'demo' | 'other' {
  if (url.includes('github.com')) return 'github';
  if (url.includes('vercel.app') || url.includes('netlify.app')) return 'demo';
  // Could add more heuristics here
  return 'other';
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Generate frontmatter for MDX file
 */
export function generateFrontmatter(data: Partial<PortfolioProject | PortfolioBlogPost>): string {
  const lines = ['---'];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      lines.push(`${key}:`);
      for (const item of value) {
        if (typeof item === 'string') {
          lines.push(`  - ${item}`);
        } else if (typeof item === 'object') {
          lines.push(`  - title: ${item.title}`);
          lines.push(`    url: ${item.url}`);
          if (item.type) lines.push(`    type: ${item.type}`);
        }
      }
    } else if (typeof value === 'string') {
      // Escape quotes and handle multiline
      if (value.includes('\n')) {
        lines.push(`${key}: >`);
        const indented = value.split('\n').map(line => `  ${line}`).join('\n');
        lines.push(indented);
      } else {
        const escaped = value.replace(/"/g, '\\"');
        lines.push(`${key}: "${escaped}"`);
      }
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push('---');
  lines.push('');

  return lines.join('\n');
}
