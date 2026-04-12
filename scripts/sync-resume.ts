#!/usr/bin/env tsx
/**
 * Resume Sync Script
 *
 * Syncs resume source data from Notion and writes local JSON artifacts
 * for each resume variant.
 *
 * Usage:
 *   tsx --env-file=.env scripts/sync-resume.ts
 */

import { Client } from '@notionhq/client'
import { getRequiredEnv, getResumeNotionConfig } from '../src/lib/env'
import { transformNotionResume, type NotionResumePage } from '../src/lib/resume/transform-notion-resume'
import { writeResumeContent } from '../src/lib/resume/content'
import type { ResumeVariant } from '../src/types/resume'

interface ResumeVariantMetadata {
  variant: ResumeVariant
  label: string
  summary: string
}

const RESUME_VARIANTS: ResumeVariantMetadata[] = [
  {
    variant: 'tech',
    label: 'Web Dev / Software Engineer',
    summary: 'Resume variant focused on software engineering and web development work.',
  },
  {
    variant: 'theatre',
    label: 'Sound Designer / Audio Engineer',
    summary: 'Resume variant focused on theatre sound design and live audio engineering work.',
  },
]

/**
 * Initialize Notion client
 */
function initNotionClient(): Client {
  return new Client({ auth: getRequiredEnv('NOTION_API_KEY') })
}

/**
 * Fetch all pages from a Notion database
 */
async function fetchDatabasePages(notion: Client, databaseId: string): Promise<NotionResumePage[]> {
  const pages: NotionResumePage[] = []
  let cursor: string | undefined

  do {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    })

    for (const result of response.results) {
      if ('properties' in result) {
        pages.push(result as NotionResumePage)
      }
    }

    cursor = response.next_cursor ?? undefined
  } while (cursor)

  return pages
}

/**
 * Main sync function
 */
async function main(): Promise<void> {
  console.log('🚀 Starting Resume Sync...')

  const resumeConfig = getResumeNotionConfig()
  if (!resumeConfig) {
    console.log('ℹ️  Resume sync skipped because optional resume database configuration is incomplete.')
    console.log('✨ Resume sync complete (skipped).\n')
    return
  }

  try {
    const notion = initNotionClient()

    const [rolePages, educationPages, skillPages] = await Promise.all([
      fetchDatabasePages(notion, resumeConfig.rolesDbId),
      fetchDatabasePages(notion, resumeConfig.educationDbId),
      fetchDatabasePages(notion, resumeConfig.skillsDbId),
    ])

    console.log(`   Roles: ${rolePages.length}`)
    console.log(`   Education: ${educationPages.length}`)
    console.log(`   Skills: ${skillPages.length}`)

    for (const variantMetadata of RESUME_VARIANTS) {
      const resume = transformNotionResume({
        variant: variantMetadata.variant,
        label: variantMetadata.label,
        summary: variantMetadata.summary,
        rolePages,
        educationPages,
        skillPages,
      })

      await writeResumeContent(resume)
      console.log(
        `✅ Synced "${variantMetadata.variant}" (${resume.roles.length} roles, ${resume.education.length} education, ${resume.skills.length} skills)`,
      )
    }

    console.log('\n✨ Resume sync complete!\n')
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n💥 Resume sync failed: ${error.message}`)
    } else {
      console.error('\n💥 Resume sync failed:', error)
    }
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as syncResume }
