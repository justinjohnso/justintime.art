#!/usr/bin/env tsx
/**
 * Notion Sync Script
 * 
 * Syncs projects and blog posts from Notion databases to local MDX files.
 * Handles image downloads, content conversion, and incremental updates.
 * 
 * Usage:
 *   pnpm sync:notion [--projects] [--blog] [--force]
 *   
 * Options:
 *   --projects  Sync only projects (default: sync both)
 *   --blog      Sync only blog posts (default: sync both)
 *   --force     Force sync all content (ignore last modified checks)
 */

import { Client } from '@notionhq/client';
import { promises as fs } from 'fs';
import path from 'path';
import { blocksToMDX, extractImageUrls, replaceImageUrls } from '../src/lib/notion/blocks-to-mdx';
import { transformNotionProject, generateFrontmatter } from '../src/lib/notion/transform';
import { downloadAndSaveImage } from '../src/lib/storage/media';
import { getNotionConfig, validateNotionEnv } from '../src/lib/env';
import type {
  NotionProjectPage,
  NotionBlogPost,
  NotionBlock,
} from '../src/types/notion';

// Parse command line arguments
const args = process.argv.slice(2);
const shouldSyncProjects = args.includes('--projects') || (!args.includes('--blog'));
const shouldSyncBlog = args.includes('--blog') || (!args.includes('--projects'));
const forceSync = args.includes('--force');

// Directories
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects');
const BLOG_DIR = path.join(CONTENT_DIR, 'posts');
const CATEGORIES_DIR = path.join(CONTENT_DIR, 'categories');

interface SyncStats {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
}

/**
 * Initialize Notion client
 */
function initNotionClient(): Client {
  validateNotionEnv();
  const { apiKey } = getNotionConfig();
  return new Client({ auth: apiKey });
}

/**
 * Ensure content directories exist
 */
async function ensureDirectories(): Promise<void> {
  await fs.mkdir(PROJECTS_DIR, { recursive: true });
  await fs.mkdir(BLOG_DIR, { recursive: true });
  await fs.mkdir(CATEGORIES_DIR, { recursive: true });
}

/**
 * Fetch all pages from a Notion database
 */
async function fetchDatabasePages(
  notion: Client,
  databaseId: string,
  filter?: any
): Promise<any[]> {
  const pages: any[] = [];
  let cursor: string | undefined;

  do {
    const response: any = await notion.databases.query({
      database_id: databaseId,
      filter,
      start_cursor: cursor,
    });

    pages.push(...response.results);
    cursor = response.next_cursor || undefined;
  } while (cursor);

  return pages;
}

/**
 * Fetch all blocks for a page
 */
async function fetchPageBlocks(
  notion: Client,
  pageId: string
): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;

  do {
    const response: any = await notion.blocks.children.list({
      block_id: pageId,
      start_cursor: cursor,
    });

    blocks.push(...(response.results as NotionBlock[]));
    cursor = response.next_cursor || undefined;
  } while (cursor);

  return blocks;
}

/**
 * Check if file needs updating based on last modified time
 */
async function needsUpdate(
  filePath: string,
  notionLastEdited: string
): Promise<boolean> {
  if (forceSync) return true;

  try {
    const stats = await fs.stat(filePath);
    const fileModified = stats.mtime;
    const notionModified = new Date(notionLastEdited);
    
    return notionModified > fileModified;
  } catch (error) {
    // File doesn't exist, needs creation
    return true;
  }
}

/**
 * Download and process images in MDX content
 */
async function processImages(mdx: string, slug: string): Promise<string> {
  const imageUrls = extractImageUrls(mdx);
  
  if (imageUrls.length === 0) {
    return mdx;
  }

  const replacements = new Map<string, string>();

  for (const url of imageUrls) {
    try {
      // Skip if already a local path
      if (url.startsWith('/') || url.startsWith('./')) {
        continue;
      }

      // Download and save image
      const localPath = await downloadAndSaveImage(url, slug);
      replacements.set(url, localPath);
      
      console.log(`  ✓ Downloaded image: ${localPath}`);
    } catch (error) {
      console.error(`  ✗ Failed to download image ${url}:`, error);
      // Continue with other images
    }
  }

  return replaceImageUrls(mdx, replacements);
}

/**
 * Sync a single project from Notion
 */
async function syncProject(
  notion: Client,
  page: any,
  stats: SyncStats
): Promise<void> {
  try {
    // Transform Notion page to portfolio project
    const project = transformNotionProject(page as NotionProjectPage);
    const filePath = path.join(PROJECTS_DIR, `${project.slug}.mdx`);

    // Check if update needed
    if (!await needsUpdate(filePath, page.last_edited_time)) {
      console.log(`⏭️  Skipping ${project.slug} (no changes)`);
      stats.skipped++;
      return;
    }

    console.log(`📝 Syncing project: ${project.title}`);

    // Fetch page content blocks
    const blocks = await fetchPageBlocks(notion, page.id);
    
    // Convert blocks to MDX
    let mdxContent = await blocksToMDX(blocks);
    
    // Download and process images
    mdxContent = await processImages(mdxContent, project.slug);

    // Generate frontmatter
    const frontmatter = generateFrontmatter(project);
    
    // Combine frontmatter and content
    const fileContent = `---\n${frontmatter}\n---\n\n${mdxContent}`;

    // Write file
    await fs.writeFile(filePath, fileContent, 'utf-8');

    const existed = await fs.stat(filePath).catch(() => null);
    if (existed) {
      console.log(`✅ Updated: ${project.slug}`);
      stats.updated++;
    } else {
      console.log(`✅ Created: ${project.slug}`);
      stats.created++;
    }
  } catch (error) {
    console.error(`❌ Error syncing project ${page.id}:`, error);
    stats.errors++;
  }
}

/**
 * Sync a single blog post from Notion
 */
async function syncBlogPost(
  notion: Client,
  page: any,
  stats: SyncStats
): Promise<void> {
  try {
    // Extract blog post data (similar to project transform)
    const properties = page.properties;
    
    const title = properties.Title?.title?.[0]?.plain_text || 'Untitled';
    const slug = properties.Slug?.rich_text?.[0]?.plain_text || 
                 title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

    // Check if update needed
    if (!await needsUpdate(filePath, page.last_edited_time)) {
      console.log(`⏭️  Skipping ${slug} (no changes)`);
      stats.skipped++;
      return;
    }

    console.log(`📝 Syncing blog post: ${title}`);

    // Fetch page content blocks
    const blocks = await fetchPageBlocks(notion, page.id);
    
    // Convert blocks to MDX
    let mdxContent = await blocksToMDX(blocks);
    
    // Download and process images
    mdxContent = await processImages(mdxContent, slug);

    // Build frontmatter
    const date = properties.Date?.date?.start || new Date().toISOString().split('T')[0];
    const excerpt = properties.Excerpt?.rich_text?.[0]?.plain_text || '';
    const tags = properties.Tags?.multi_select?.map((t: any) => t.name) || [];
    const draft = properties.Status?.select?.name !== 'Published';

    const frontmatter = [
      `title: "${title}"`,
      `slug: "${slug}"`,
      `date: ${date}`,
      excerpt ? `excerpt: "${excerpt}"` : null,
      tags.length > 0 ? `tags: [${tags.map((t: string) => `"${t}"`).join(', ')}]` : null,
      `draft: ${draft}`,
    ].filter(Boolean).join('\n');
    
    // Combine frontmatter and content
    const fileContent = `---\n${frontmatter}\n---\n\n${mdxContent}`;

    // Write file
    await fs.writeFile(filePath, fileContent, 'utf-8');

    const existed = await fs.stat(filePath).catch(() => null);
    if (existed) {
      console.log(`✅ Updated: ${slug}`);
      stats.updated++;
    } else {
      console.log(`✅ Created: ${slug}`);
      stats.created++;
    }
  } catch (error) {
    console.error(`❌ Error syncing blog post ${page.id}:`, error);
    stats.errors++;
  }
}

/**
 * Sync all projects
 */
async function syncProjects(notion: Client): Promise<SyncStats> {
  console.log('\n🔄 Syncing Projects...\n');
  
  const { projectsDbId } = getNotionConfig();
  const stats: SyncStats = { created: 0, updated: 0, skipped: 0, errors: 0 };

  // Fetch only published projects
  const filter = {
    property: 'Status',
    select: {
      equals: 'Published',
    },
  };

  const pages = await fetchDatabasePages(notion, projectsDbId, filter);
  
  console.log(`Found ${pages.length} published projects\n`);

  for (const page of pages) {
    await syncProject(notion, page, stats);
  }

  return stats;
}

/**
 * Sync all blog posts
 */
async function syncBlogPosts(notion: Client): Promise<SyncStats> {
  console.log('\n🔄 Syncing Blog Posts...\n');
  
  const { blogDbId } = getNotionConfig();
  const stats: SyncStats = { created: 0, updated: 0, skipped: 0, errors: 0 };

  // Fetch only published posts
  const filter = {
    property: 'Status',
    select: {
      equals: 'Published',
    },
  };

  const pages = await fetchDatabasePages(notion, blogDbId, filter);
  
  console.log(`Found ${pages.length} published blog posts\n`);

  for (const page of pages) {
    await syncBlogPost(notion, page, stats);
  }

  return stats;
}

/**
 * Print sync summary
 */
function printSummary(type: string, stats: SyncStats): void {
  console.log(`\n📊 ${type} Sync Summary:`);
  console.log(`   ✅ Created: ${stats.created}`);
  console.log(`   🔄 Updated: ${stats.updated}`);
  console.log(`   ⏭️  Skipped: ${stats.skipped}`);
  if (stats.errors > 0) {
    console.log(`   ❌ Errors: ${stats.errors}`);
  }
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Notion Sync...');
  console.log(`   Projects: ${shouldSyncProjects ? '✓' : '✗'}`);
  console.log(`   Blog: ${shouldSyncBlog ? '✓' : '✗'}`);
  console.log(`   Force: ${forceSync ? '✓' : '✗'}`);

  try {
    // Initialize
    const notion = initNotionClient();
    await ensureDirectories();

    // Sync projects
    if (shouldSyncProjects) {
      const projectStats = await syncProjects(notion);
      printSummary('Projects', projectStats);
    }

    // Sync blog posts
    if (shouldSyncBlog) {
      const blogStats = await syncBlogPosts(notion);
      printSummary('Blog', blogStats);
    }

    console.log('\n✨ Sync complete!\n');
  } catch (error) {
    console.error('\n💥 Sync failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as syncNotion };
