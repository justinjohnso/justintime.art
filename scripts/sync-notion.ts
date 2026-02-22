#!/usr/bin/env tsx
/**
 * Notion Sync Script
 *
 * Syncs projects and blog posts from Notion databases to local MDX files.
 * Handles image downloads, content conversion, and incremental updates.
 *
 * By default, only creates NEW files that don't already exist locally.
 * Existing TinaCMS-curated content is preserved unless --force is used.
 *
 * Usage:
 *   pnpm sync:notion [--projects] [--blog] [--force]
 *
 * Options:
 *   --projects  Sync only projects (default: sync both)
 *   --blog      Sync only blog posts (default: sync both)
 *   --force     Force overwrite all content (including existing files)
 */

import { Client } from '@notionhq/client'
import { promises as fs } from 'fs'
import path from 'path'
import { blocksToMDX, extractImageUrls, replaceImageUrls } from '../src/lib/notion/blocks-to-mdx'
import { transformNotionProject, generateFrontmatter } from '../src/lib/notion/transform'
import {
  downloadAndSaveImage,
  generateImageFilename,
  saveImage,
  downloadImage,
} from '../src/lib/storage/media'
import { getNotionConfig, validateNotionEnv } from '../src/lib/env'
import type { NotionProjectPage, NotionBlock } from '../src/types/notion'

// Parse command line arguments
const args = process.argv.slice(2)
const shouldSyncProjects = args.includes('--projects') || !args.includes('--blog')
const shouldSyncBlog = args.includes('--blog') || !args.includes('--projects')
const forceSync = args.includes('--force')

// Directories
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects')
const BLOG_DIR = path.join(CONTENT_DIR, 'posts')
const CATEGORIES_DIR = path.join(CONTENT_DIR, 'categories')

interface SyncStats {
  created: number
  updated: number
  skipped: number
  errors: number
}

/**
 * Initialize Notion client
 */
function initNotionClient(): Client {
  validateNotionEnv()
  const { apiKey } = getNotionConfig()
  return new Client({ auth: apiKey })
}

/**
 * Ensure content directories exist
 */
async function ensureDirectories(): Promise<void> {
  await fs.mkdir(PROJECTS_DIR, { recursive: true })
  await fs.mkdir(BLOG_DIR, { recursive: true })
  await fs.mkdir(CATEGORIES_DIR, { recursive: true })
}

/**
 * Fetch all pages from a Notion database
 */
async function fetchDatabasePages(
  notion: Client,
  databaseId: string,
  filter?: any,
): Promise<any[]> {
  const pages: any[] = []
  let cursor: string | undefined

  do {
    const response: any = await notion.databases.query({
      database_id: databaseId,
      filter,
      start_cursor: cursor,
    })

    pages.push(...response.results)
    cursor = response.next_cursor || undefined
  } while (cursor)

  return pages
}

/**
 * Fetch all blocks for a page
 */
async function fetchPageBlocks(notion: Client, pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = []
  let cursor: string | undefined

  do {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    })

    blocks.push(...(response.results as NotionBlock[]))
    cursor = response.next_cursor || undefined
  } while (cursor)

  return blocks
}

/**
 * Check if a file already exists on disk
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.stat(filePath)
    return true
  } catch {
    return false
  }
}

/**
 * Download and process images in MDX content
 */
async function processImages(
  mdx: string,
  slug: string,
  type: 'project' | 'post' = 'project',
): Promise<string> {
  const imageUrls = extractImageUrls(mdx)

  if (imageUrls.length === 0) {
    return mdx
  }

  const replacements = new Map<string, string>()

  for (const url of imageUrls) {
    try {
      if (url.startsWith('/') || url.startsWith('./')) {
        continue
      }

      const localPath = await downloadAndSaveImage(url, slug, type)
      replacements.set(url, localPath)

      console.log(`  ✓ Downloaded image: ${localPath}`)
    } catch (error) {
      console.error(`  ✗ Failed to download image ${url}:`, error)
    }
  }

  return replaceImageUrls(mdx, replacements)
}

/**
 * Download hero and additional images from Notion file fields
 */
async function downloadProjectImages(
  slug: string,
  heroImageUrl?: string,
  additionalImageUrls: string[] = [],
): Promise<{ image?: string; additionalImages: Array<{ image: string }> }> {
  let image: string | undefined
  const additionalImages: Array<{ image: string }> = []

  if (heroImageUrl) {
    try {
      const buffer = await downloadImage(heroImageUrl)
      const filename = generateImageFilename(slug, 'hero', undefined, heroImageUrl)
      image = await saveImage(buffer, `projects/${slug}`, filename)
      console.log(`  ✓ Downloaded hero image: ${image}`)
    } catch (error) {
      console.error(`  ✗ Failed to download hero image:`, error)
    }
  }

  for (let i = 0; i < additionalImageUrls.length; i++) {
    try {
      const buffer = await downloadImage(additionalImageUrls[i])
      const filename = generateImageFilename(slug, 'additional', i, additionalImageUrls[i])
      const localPath = await saveImage(buffer, `projects/${slug}`, filename)
      additionalImages.push({ image: localPath })
      console.log(`  ✓ Downloaded additional image: ${localPath}`)
    } catch (error) {
      console.error(`  ✗ Failed to download additional image ${i}:`, error)
    }
  }

  return { image, additionalImages }
}

/**
 * Sync a single project from Notion
 */
async function syncProject(notion: Client, page: any, stats: SyncStats): Promise<void> {
  try {
    const project = transformNotionProject(page as NotionProjectPage)
    const filePath = path.join(PROJECTS_DIR, `${project.slug}.mdx`)

    // Default: skip existing files (TinaCMS is source of truth)
    // Only overwrite with --force
    const exists = await fileExists(filePath)
    if (exists && !forceSync) {
      console.log(`⏭️  Skipping ${project.slug} (file exists, use --force to overwrite)`)
      stats.skipped++
      return
    }

    console.log(`📝 Syncing project: ${project.title}`)

    // Body text comes from the "Body Text" rich text property
    const mdxContent = project.bodyText

    // Download hero and additional images from Notion file fields
    const images = await downloadProjectImages(
      project.slug,
      project.heroImageUrl,
      project.additionalImageUrls,
    )

    // Add downloaded images to frontmatter
    if (images.image) {
      project.frontmatter.image = images.image
    }
    if (images.additionalImages.length > 0) {
      project.frontmatter.additionalImages = images.additionalImages
    }

    // Generate frontmatter and combine with content
    const frontmatter = generateFrontmatter(project.frontmatter)
    const fileContent = `${frontmatter}\n${mdxContent}`

    await fs.writeFile(filePath, fileContent, 'utf-8')

    if (exists) {
      console.log(`✅ Updated: ${project.slug}`)
      stats.updated++
    } else {
      console.log(`✅ Created: ${project.slug}`)
      stats.created++
    }
  } catch (error) {
    console.error(`❌ Error syncing project ${page.id}:`, error)
    stats.errors++
  }
}

/**
 * Sync a single blog post from Notion
 */
async function syncBlogPost(notion: Client, page: any, stats: SyncStats): Promise<void> {
  try {
    const properties = page.properties

    const title = properties.Title?.title?.[0]?.plain_text || 'Untitled'
    const slug =
      properties.Slug?.rich_text?.[0]?.plain_text ||
      title.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const filePath = path.join(BLOG_DIR, `${slug}.mdx`)

    // Default: skip existing files
    const exists = await fileExists(filePath)
    if (exists && !forceSync) {
      console.log(`⏭️  Skipping ${slug} (file exists, use --force to overwrite)`)
      stats.skipped++
      return
    }

    console.log(`📝 Syncing blog post: ${title}`)

    const blocks = await fetchPageBlocks(notion, page.id)
    let mdxContent = await blocksToMDX(blocks)
    mdxContent = await processImages(mdxContent, slug, 'post')

    // Build frontmatter
    const date = properties.Date?.date?.start || new Date().toISOString().split('T')[0]
    const description = properties.Description?.rich_text?.[0]?.plain_text || ''
    const categories = properties.Categories?.multi_select?.map((t: any) => t.name) || []
    const draft = properties.Status?.select?.name !== 'Published'

    const frontmatterData: Record<string, any> = { title, date }
    if (description) frontmatterData.description = description
    if (categories.length > 0) frontmatterData.categories = categories
    if (draft) frontmatterData.draft = draft

    const frontmatter = generateFrontmatter(frontmatterData)
    const fileContent = `${frontmatter}\n${mdxContent}`

    await fs.writeFile(filePath, fileContent, 'utf-8')

    if (exists) {
      console.log(`✅ Updated: ${slug}`)
      stats.updated++
    } else {
      console.log(`✅ Created: ${slug}`)
      stats.created++
    }
  } catch (error) {
    console.error(`❌ Error syncing blog post ${page.id}:`, error)
    stats.errors++
  }
}

/**
 * Sync all projects
 */
async function syncProjects(notion: Client): Promise<SyncStats> {
  console.log('\n🔄 Syncing Projects...\n')

  const { projectsDbId } = getNotionConfig()
  const stats: SyncStats = { created: 0, updated: 0, skipped: 0, errors: 0 }

  const filter = {
    property: 'Status',
    select: {
      equals: 'Published',
    },
  }

  const pages = await fetchDatabasePages(notion, projectsDbId, filter)

  console.log(`Found ${pages.length} published projects\n`)

  for (const page of pages) {
    await syncProject(notion, page, stats)
  }

  return stats
}

/**
 * Sync all blog posts
 */
async function syncBlogPosts(notion: Client): Promise<SyncStats> {
  console.log('\n🔄 Syncing Blog Posts...\n')

  const { blogDbId } = getNotionConfig()
  const stats: SyncStats = { created: 0, updated: 0, skipped: 0, errors: 0 }

  const filter = {
    property: 'Status',
    select: {
      equals: 'Published',
    },
  }

  const pages = await fetchDatabasePages(notion, blogDbId, filter)

  console.log(`Found ${pages.length} published blog posts\n`)

  for (const page of pages) {
    await syncBlogPost(notion, page, stats)
  }

  return stats
}

/**
 * Print sync summary
 */
function printSummary(type: string, stats: SyncStats): void {
  console.log(`\n📊 ${type} Sync Summary:`)
  console.log(`   ✅ Created: ${stats.created}`)
  console.log(`   🔄 Updated: ${stats.updated}`)
  console.log(`   ⏭️  Skipped: ${stats.skipped}`)
  if (stats.errors > 0) {
    console.log(`   ❌ Errors: ${stats.errors}`)
  }
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Notion Sync...')
  console.log(`   Projects: ${shouldSyncProjects ? '✓' : '✗'}`)
  console.log(`   Blog: ${shouldSyncBlog ? '✓' : '✗'}`)
  console.log(`   Force overwrite: ${forceSync ? '✓' : '✗'}`)

  try {
    const notion = initNotionClient()
    await ensureDirectories()

    if (shouldSyncProjects) {
      const projectStats = await syncProjects(notion)
      printSummary('Projects', projectStats)
    }

    if (shouldSyncBlog) {
      const blogStats = await syncBlogPosts(notion)
      printSummary('Blog', blogStats)
    }

    console.log('\n✨ Sync complete!\n')
  } catch (error) {
    console.error('\n💥 Sync failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as syncNotion }
