#!/usr/bin/env tsx

import { promises as fs } from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import type { Browser } from 'puppeteer'
import {
  loadAllOneSheetProjectData,
  loadOneSheetProjectData,
  type OneSheetProjectData,
} from './one-sheet-data'
import { generateOneSheetTemplate } from './one-sheet-template'

const OUTPUT_DIR = path.join(process.cwd(), 'output', 'one-sheets')
const PUBLIC_DIR = path.join(process.cwd(), 'public')

interface CliOptions {
  mode: 'single' | 'all'
  slug?: string
}

interface GenerationStats {
  generated: number
  failed: number
}

function parseCliArgs(args: string[]): CliOptions {
  const runAll = args.includes('--all')
  const slugIndex = args.indexOf('--slug')
  const slug = slugIndex >= 0 ? args[slugIndex + 1]?.trim() : undefined

  if (runAll && slugIndex >= 0) {
    throw new Error('Use either --all or --slug <slug>, not both.')
  }

  if (runAll) {
    return { mode: 'all' }
  }

  if (slugIndex >= 0) {
    if (!slug || slug.startsWith('--')) {
      throw new Error('Missing value for --slug. Example: --slug my-project-slug')
    }

    return { mode: 'single', slug }
  }

  throw new Error('No mode provided. Use --slug <slug> or --all.')
}

async function ensureOutputDirectory(): Promise<void> {
  await fs.mkdir(OUTPUT_DIR, { recursive: true })
}

function getAssetBaseUrl(): string {
  return pathToFileURL(PUBLIC_DIR).toString().replace(/\/$/, '')
}

function getOutputPath(slug: string): string {
  return path.join(OUTPUT_DIR, `${slug}.pdf`)
}

async function renderProjectPdf(browser: Browser, project: OneSheetProjectData): Promise<string> {
  const outputPath = getOutputPath(project.slug)
  const page = await browser.newPage()

  try {
    const html = generateOneSheetTemplate(project, {
      assetBaseUrl: getAssetBaseUrl(),
    })

    await page.setContent(html, { waitUntil: 'networkidle0' })
    await page.emulateMediaType('print')
    await page.pdf({
      path: outputPath,
      format: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
    })

    return outputPath
  } finally {
    await page.close()
  }
}

async function loadProjects(options: CliOptions): Promise<OneSheetProjectData[]> {
  if (options.mode === 'single' && options.slug) {
    const project = await loadOneSheetProjectData(options.slug)
    return [project]
  }

  return loadAllOneSheetProjectData()
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  try {
    const options = parseCliArgs(args)
    await ensureOutputDirectory()

    const projects = await loadProjects(options)
    if (projects.length === 0) {
      console.warn('⚠️  No projects found to generate.')
      return
    }

    const modeSummary = options.mode === 'all' ? 'all projects' : `slug "${options.slug}"`
    console.log('📄 One-Sheet PDF Generator')
    console.log(`   Mode: ${modeSummary}`)
    console.log(`   Output directory: ${OUTPUT_DIR}`)
    console.log(`   Projects queued: ${projects.length}\n`)

    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    const stats: GenerationStats = { generated: 0, failed: 0 }

    try {
      for (const project of projects) {
        try {
          const outputPath = await renderProjectPdf(browser, project)
          console.log(`✅ Generated ${project.slug} → ${outputPath}`)
          stats.generated++
        } catch (error) {
          stats.failed++
          console.error(`❌ Failed ${project.slug}:`, error)
        }
      }
    } finally {
      await browser.close()
    }

    console.log('\n📊 Summary')
    console.log(`   Generated: ${stats.generated}`)
    console.log(`   Failed: ${stats.failed}`)

    if (stats.failed > 0) {
      process.exit(1)
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(`\n💥 One-sheet generation failed: ${error.message}`)
    } else {
      console.error('\n💥 One-sheet generation failed:', error)
    }
    process.exit(1)
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}

export { main as generateOneSheetPdf }
