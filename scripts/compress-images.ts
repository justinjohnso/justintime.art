#!/usr/bin/env tsx
/**
 * One-time Image Compression Script
 *
 * Compresses all existing images in public/media/ that are over the size threshold.
 * Safe to run multiple times - only processes images that need compression.
 *
 * Usage:
 *   pnpm compress:images [--dry-run]
 *
 * Options:
 *   --dry-run  Show what would be compressed without making changes
 */

import { readdir, stat, readFile, writeFile, unlink } from 'fs/promises'
import { join, extname } from 'path'
import sharp from 'sharp'

// Settings
const MEDIA_DIR = join(process.cwd(), 'public', 'media')
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1920
const JPEG_QUALITY = 80
const SIZE_THRESHOLD = 500 * 1024 // Only compress files over 500KB

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')

interface CompressionResult {
  file: string
  originalSize: number
  newSize: number
  saved: number
  skipped?: boolean
  error?: string
}

async function getAllImages(dir: string): Promise<string[]> {
  const images: string[] = []
  const validExts = ['.jpg', '.jpeg', '.png', '.webp']

  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        await walk(fullPath)
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase()
        if (validExts.includes(ext)) {
          images.push(fullPath)
        }
      }
    }
  }

  await walk(dir)
  return images
}

async function compressImage(filePath: string): Promise<CompressionResult> {
  const relativePath = filePath.replace(MEDIA_DIR + '/', '')

  try {
    const fileStats = await stat(filePath)
    const originalSize = fileStats.size

    // Skip small files
    if (originalSize < SIZE_THRESHOLD) {
      return {
        file: relativePath,
        originalSize,
        newSize: originalSize,
        saved: 0,
        skipped: true,
      }
    }

    const buffer = await readFile(filePath)
    const ext = extname(filePath).toLowerCase()

    // Skip GIFs and SVGs
    if (ext === '.gif' || ext === '.svg') {
      return {
        file: relativePath,
        originalSize,
        newSize: originalSize,
        saved: 0,
        skipped: true,
      }
    }

    let image = sharp(buffer)
    const metadata = await image.metadata()

    // Resize if larger than max dimensions
    if (metadata.width && metadata.width > MAX_WIDTH) {
      image = image.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    let outputBuffer: Buffer
    let newFilePath = filePath

    if (ext === '.png') {
      // Try both PNG and JPEG, use smaller one
      const pngBuffer = await image.png({ quality: 80 }).toBuffer()
      const jpegBuffer = await image.jpeg({ quality: JPEG_QUALITY }).toBuffer()

      if (jpegBuffer.length < pngBuffer.length * 0.8) {
        // JPEG is significantly smaller - convert
        outputBuffer = jpegBuffer
        newFilePath = filePath.replace(/\.png$/i, '.jpg')
      } else {
        outputBuffer = pngBuffer
      }
    } else {
      // JPEG - compress
      outputBuffer = await image.jpeg({ quality: JPEG_QUALITY }).toBuffer()
    }

    const newSize = outputBuffer.length
    const saved = originalSize - newSize

    // Only save if we actually reduced the size
    if (saved > 1024 && !dryRun) {
      await writeFile(newFilePath, outputBuffer)

      // If we converted PNG to JPG, delete the original PNG
      if (newFilePath !== filePath) {
        await unlink(filePath)
      }
    }

    return {
      file: relativePath,
      originalSize,
      newSize,
      saved,
    }
  } catch (error) {
    return {
      file: relativePath,
      originalSize: 0,
      newSize: 0,
      saved: 0,
      error: String(error),
    }
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

async function main() {
  console.log('🖼️  Image Compression Script')
  console.log(`   Directory: ${MEDIA_DIR}`)
  console.log(`   Threshold: ${formatBytes(SIZE_THRESHOLD)}`)
  if (dryRun) {
    console.log('   Mode: DRY RUN (no changes will be made)\n')
  } else {
    console.log('')
  }

  const images = await getAllImages(MEDIA_DIR)
  console.log(`Found ${images.length} images\n`)

  const results: CompressionResult[] = []
  let totalOriginal = 0
  let totalNew = 0
  let compressed = 0
  let skipped = 0
  let errors = 0

  for (const imagePath of images) {
    const result = await compressImage(imagePath)
    results.push(result)

    totalOriginal += result.originalSize
    totalNew += result.newSize

    if (result.error) {
      console.log(`❌ ${result.file}: ${result.error}`)
      errors++
    } else if (result.skipped) {
      skipped++
    } else if (result.saved > 1024) {
      const pct = Math.round((result.saved / result.originalSize) * 100)
      console.log(
        `✅ ${result.file}: ${formatBytes(result.originalSize)} → ${formatBytes(result.newSize)} (-${pct}%)`,
      )
      compressed++
    } else {
      skipped++
    }
  }

  const totalSaved = totalOriginal - totalNew
  const totalPct = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary')
  console.log('='.repeat(60))
  console.log(`   Images processed: ${images.length}`)
  console.log(`   Compressed: ${compressed}`)
  console.log(`   Skipped (under threshold): ${skipped}`)
  console.log(`   Errors: ${errors}`)
  console.log('')
  console.log(`   Original total: ${formatBytes(totalOriginal)}`)
  console.log(`   New total: ${formatBytes(totalNew)}`)
  console.log(`   Saved: ${formatBytes(totalSaved)} (${totalPct}%)`)

  if (dryRun) {
    console.log('\n⚠️  This was a dry run. Run without --dry-run to apply changes.')
  }
}

main().catch(console.error)
