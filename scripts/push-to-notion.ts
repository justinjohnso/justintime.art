#!/usr/bin/env tsx
/**
 * Push to Notion Script
 *
 * Pushes local MDX project data to Notion database, overwriting Notion properties
 * with the local (TinaCMS-curated) data. Does NOT push images or page body content.
 *
 * Assumes Notion database has been updated with:
 *   - Categories multi-select values matching file slugs (e.g., "theatre")
 *   - "Date Completed" date field (renamed from "Year" number)
 *   - "Media Embed" as URL type (changed from rich text)
 *
 * Usage:
 *   pnpm push:notion [--dry-run]
 *
 * Options:
 *   --dry-run   Preview changes without writing to Notion
 */

import { Client } from '@notionhq/client'
import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getNotionConfig, validateNotionEnv } from '../src/lib/env'
import { extractCategorySlug } from '../src/utils/categoryUtils'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

const PROJECTS_DIR = path.join(process.cwd(), 'src', 'content', 'projects')

/**
 * Convert markdown text to Notion rich text segments with annotations.
 * Handles **bold**, *italic*, [links](url), and plain text.
 * Truncates to 2000 chars (Notion rich text property limit).
 */
function markdownToNotionRichText(markdown: string): any[] {
  const segments: any[] = []
  // Match **bold**, *italic*, [text](url) — bold must come before italic in alternation
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|\[(.+?)\]\((.+?)\)/g
  let lastIndex = 0
  let totalChars = 0
  let match

  while ((match = pattern.exec(markdown)) !== null) {
    // Plain text before this match
    if (match.index > lastIndex) {
      const plain = markdown.slice(lastIndex, match.index)
      if (plain && totalChars < 2000) {
        const text = plain.slice(0, 2000 - totalChars)
        segments.push({ text: { content: text } })
        totalChars += text.length
      }
    }

    if (totalChars >= 2000) break

    if (match[1] !== undefined) {
      // **bold**
      const text = match[1].slice(0, 2000 - totalChars)
      segments.push({ text: { content: text }, annotations: { bold: true } })
      totalChars += text.length
    } else if (match[2] !== undefined) {
      // *italic*
      const text = match[2].slice(0, 2000 - totalChars)
      segments.push({ text: { content: text }, annotations: { italic: true } })
      totalChars += text.length
    } else if (match[3] !== undefined && match[4] !== undefined) {
      // [text](url)
      const text = match[3].slice(0, 2000 - totalChars)
      segments.push({ text: { content: text, link: { url: match[4] } } })
      totalChars += text.length
    }

    lastIndex = match.index + match[0].length
  }

  // Remaining plain text
  if (lastIndex < markdown.length && totalChars < 2000) {
    const text = markdown.slice(lastIndex, lastIndex + (2000 - totalChars))
    segments.push({ text: { content: text } })
  }

  return segments.length > 0 ? segments : [{ text: { content: '' } }]
}

interface LocalProject {
  slug: string
  title: string
  description?: string
  bodyText: string
  dateCompleted?: string
  categories: string[]
  mediaEmbed?: string
  links: Array<{ title: string; url: string; type?: string }>
}

/**
 * Parse a local MDX file into structured project data
 */
function parseProjectFile(slug: string, content: string): LocalProject {
  const { data } = matter(content)

  // Extract category slugs from TinaCMS reference format
  const categories: string[] = []
  if (Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      const catSlug = extractCategorySlug(cat)
      if (catSlug) categories.push(catSlug)
    }
  }

  // Normalize dateCompleted — could be Date object, ISO string, or "YYYY-01-01"
  let dateCompleted: string | undefined
  if (data.dateCompleted) {
    const d = data.dateCompleted instanceof Date ? data.dateCompleted : new Date(data.dateCompleted)
    if (!isNaN(d.getTime())) {
      dateCompleted = d.toISOString().split('T')[0]
    }
  }

  // Parse links
  const links: Array<{ title: string; url: string; type?: string }> = []
  if (Array.isArray(data.links)) {
    for (const link of data.links) {
      if (link?.title && link?.url) {
        links.push({ title: link.title, url: link.url, type: link.type })
      }
    }
  }

  // Extract body text (everything after frontmatter)
  const { content: rawBody } = matter(content)
  const bodyText = rawBody.trim()

  return {
    slug,
    title: data.title || slug,
    description: data.description || undefined,
    bodyText,
    dateCompleted,
    categories,
    mediaEmbed: data.mediaEmbed || undefined,
    links,
  }
}

/**
 * Build Notion page properties from local project data
 */
function buildNotionProperties(project: LocalProject): Record<string, any> {
  const properties: Record<string, any> = {}

  // Title
  properties.Title = {
    title: [{ text: { content: project.title } }],
  }

  // Slug
  properties.Slug = {
    rich_text: [{ text: { content: project.slug } }],
  }

  // Description
  if (project.description) {
    properties.Description = {
      rich_text: [{ text: { content: project.description } }],
    }
  } else {
    properties.Description = { rich_text: [] }
  }

  // Date Completed (date field — user renamed from "Year")
  if (project.dateCompleted) {
    properties['Date Completed'] = {
      date: { start: project.dateCompleted },
    }
  }

  // Categories (multi-select with slug values)
  if (project.categories.length > 0) {
    properties.Categories = {
      multi_select: project.categories.map((name) => ({ name })),
    }
  } else {
    properties.Categories = { multi_select: [] }
  }

  // Media Embed (URL field — user changed from rich text)
  if (project.mediaEmbed) {
    properties['Media Embed'] = {
      url: project.mediaEmbed,
    }
  } else {
    properties['Media Embed'] = { url: null }
  }

  // Links as rich text with native hyperlinks
  if (project.links.length > 0) {
    properties['Links (Rich Text)'] = {
      rich_text: project.links.flatMap((link, i) => {
        const parts: any[] = []
        // Add separator between links
        if (i > 0) {
          parts.push({ text: { content: '\n' } })
        }
        parts.push({
          text: {
            content: link.title,
            link: { url: link.url },
          },
        })
        return parts
      }),
    }
  } else {
    properties['Links (Rich Text)'] = { rich_text: [] }
  }

  // Body Text — convert markdown formatting to Notion rich text annotations
  if (project.bodyText) {
    properties['Body Text'] = {
      rich_text: markdownToNotionRichText(project.bodyText),
    }
  } else {
    properties['Body Text'] = { rich_text: [] }
  }

  return properties
}

async function main(): Promise<void> {
  console.log('🚀 Push to Notion')
  console.log(`   Mode: ${dryRun ? 'DRY RUN (no writes)' : 'LIVE'}`)
  console.log()

  validateNotionEnv()
  const { apiKey, projectsDbId } = getNotionConfig()
  const notion = new Client({ auth: apiKey })

  // 1. Read all local project files
  const files = await fs.readdir(PROJECTS_DIR)
  const mdxFiles = files.filter((f) => f.endsWith('.mdx'))
  console.log(`📁 Found ${mdxFiles.length} local project files\n`)

  const localProjects = new Map<string, LocalProject>()
  for (const file of mdxFiles) {
    const slug = file.replace(/\.mdx$/, '')
    const content = await fs.readFile(path.join(PROJECTS_DIR, file), 'utf-8')
    localProjects.set(slug, parseProjectFile(slug, content))
  }

  // 2. Fetch all Notion pages and index by slug
  console.log('📡 Fetching Notion database pages...')
  const notionPages = new Map<string, string>() // slug → page ID
  let cursor: string | undefined

  do {
    const response: any = await notion.databases.query({
      database_id: projectsDbId,
      start_cursor: cursor,
    })

    for (const page of response.results) {
      const slugText = page.properties?.Slug?.rich_text?.[0]?.plain_text
      if (slugText) {
        notionPages.set(slugText, page.id)
      }
    }
    cursor = response.next_cursor || undefined
  } while (cursor)

  console.log(`   Found ${notionPages.size} pages in Notion\n`)

  // 3. Update each Notion page with local data
  let updated = 0
  let created = 0
  let skipped = 0
  let errors = 0

  for (const [slug, project] of localProjects) {
    const pageId = notionPages.get(slug)

    if (pageId) {
      // Update existing page
      const properties = buildNotionProperties(project)

      if (dryRun) {
        console.log(`🔍 Would update: ${project.title} (${slug})`)
        console.log(`   Categories: ${project.categories.join(', ') || '(none)'}`)
        console.log(`   Date: ${project.dateCompleted || '(none)'}`)
        console.log(`   Media: ${project.mediaEmbed || '(none)'}`)
        console.log(`   Links: ${project.links.length}`)
      } else {
        try {
          await notion.pages.update({
            page_id: pageId,
            properties,
          })
          console.log(`✅ Updated: ${project.title}`)
          updated++
        } catch (error: any) {
          console.error(`❌ Failed to update ${slug}: ${error.message}`)
          errors++
        }
      }
    } else {
      // Create new page in Notion
      const properties = buildNotionProperties(project)

      if (dryRun) {
        console.log(`🆕 Would create: ${project.title} (${slug})`)
      } else {
        try {
          await notion.pages.create({
            parent: { database_id: projectsDbId },
            properties,
          })
          console.log(`🆕 Created: ${project.title}`)
          created++
        } catch (error: any) {
          console.error(`❌ Failed to create ${slug}: ${error.message}`)
          errors++
        }
      }
    }
  }

  // 4. Report pages in Notion that don't have local files
  for (const [slug] of notionPages) {
    if (!localProjects.has(slug)) {
      console.log(`⚠️  Notion-only (no local file): ${slug}`)
      skipped++
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Updated: ${dryRun ? '(dry run)' : updated}`)
  console.log(`   🆕 Created: ${dryRun ? '(dry run)' : created}`)
  console.log(`   ⚠️  Notion-only: ${skipped}`)
  if (errors > 0) console.log(`   ❌ Errors: ${errors}`)
  console.log()
}

main().catch((error) => {
  console.error('\n💥 Push failed:', error)
  process.exit(1)
})
