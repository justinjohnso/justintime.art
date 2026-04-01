/**
 * Media Storage Utilities
 *
 * Handle downloading and storing media files to local filesystem
 * Files stored in public/media/ for both dev and production (Droplet)
 */

import { mkdir, writeFile } from 'fs/promises'
import { dirname, join } from 'path'
import sharp from 'sharp'

// Compression settings
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1920
const JPEG_QUALITY = 80
const PNG_QUALITY = 80
const MAX_FILE_SIZE_BYTES = 500 * 1024 // 500KB target

/**
 * Get media storage path
 */
export function getMediaPath(): string {
  return import.meta.env?.MEDIA_PATH || process.env.MEDIA_PATH || 'media'
}

/**
 * Download image from URL
 *
 * @param url - Image URL (Notion temporary URL or external)
 * @returns Buffer containing image data
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * Save image to local filesystem (with optional compression)
 *
 * @param buffer - Image data
 * @param subdir - Subdirectory within media (e.g., "projects/my-project")
 * @param filename - Filename (e.g., "hero.jpg")
 * @param compress - Whether to compress the image (default: true)
 * @returns Public URL for the image
 */
export async function saveImage(
  buffer: Buffer,
  subdir: string,
  filename: string,
  compress: boolean = true,
): Promise<string> {
  const mediaPath = getMediaPath()
  const publicDir = join(process.cwd(), 'public', mediaPath, subdir)

  let finalBuffer = buffer
  let finalFilename = filename

  // Compress image if enabled
  if (compress) {
    const ext = filename.split('.').pop() || 'jpg'
    const { buffer: optimizedBuffer, ext: newExt } = await optimizeImage(buffer, ext)
    finalBuffer = optimizedBuffer

    // Update filename if extension changed (e.g., PNG → JPG)
    if (newExt !== ext) {
      finalFilename = filename.replace(/\.[^.]+$/, `.${newExt}`)
    }
  }

  const filePath = join(publicDir, finalFilename)

  // Ensure directory exists
  await mkdir(dirname(filePath), { recursive: true })

  // Write file
  await writeFile(filePath, finalBuffer)

  // Return public URL
  return `/${mediaPath}/${subdir}/${finalFilename}`
}

/**
 * Download and save image in one step
 *
 * @param url - Source URL
 * @param slug - Content slug (used to determine subfolder)
 * @param type - Content type ('project' | 'post')
 * @returns Public URL for saved image
 */
export async function downloadAndSaveImage(
  url: string,
  slug: string,
  type: 'project' | 'post' = 'project',
): Promise<string> {
  const buffer = await downloadImage(url)
  const subdir = type === 'project' ? `projects/${slug}` : `blog`
  const filename = generateFilenameFromUrl(url, slug)
  return saveImage(buffer, subdir, filename)
}

/**
 * Generate a clean filename from a URL
 */
function generateFilenameFromUrl(url: string, slug: string): string {
  try {
    const pathname = new URL(url).pathname
    const originalName = pathname.split('/').pop()
    if (originalName) return originalName
  } catch {
    // Fall through
  }
  const ext = getExtensionFromUrl(url)
  return `${slug}-${Date.now()}.${ext}`
}

/**
 * Generate filename for project image
 *
 * @param slug - Project slug
 * @param type - Image type ('hero', 'additional', etc.)
 * @param index - Index for additional images
 * @param originalUrl - Original URL to extract extension
 * @returns Generated filename
 */
export function generateImageFilename(
  slug: string,
  type: 'hero' | 'additional' | 'featured',
  index?: number,
  originalUrl?: string,
): string {
  const ext = originalUrl ? getExtensionFromUrl(originalUrl) : 'jpg'
  const suffix = type === 'additional' && index !== undefined ? `-${index + 1}` : ''
  return `${slug}-${type}${suffix}.${ext}`
}

/**
 * Extract file extension from URL
 */
function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const ext = pathname.split('.').pop()?.toLowerCase()

    // Validate extension
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    if (ext && validExts.includes(ext)) {
      return ext
    }
  } catch {
    // Invalid URL
  }

  return 'jpg' // Default
}

/**
 * Optimize image using sharp
 * - Resize to max dimensions (preserving aspect ratio)
 * - Compress with appropriate quality
 * - Convert large PNGs to JPEG if they're photos
 *
 * @param buffer - Original image buffer
 * @param originalExt - Original file extension
 * @returns Object with optimized buffer and new extension
 */
export async function optimizeImage(
  buffer: Buffer,
  originalExt: string = 'jpg',
): Promise<{ buffer: Buffer; ext: string }> {
  const ext = originalExt.toLowerCase()

  try {
    let image = sharp(buffer)
    const metadata = await image.metadata()

    // Skip SVGs and GIFs (animated)
    if (ext === 'svg' || ext === 'gif') {
      return { buffer, ext }
    }

    // Resize if larger than max dimensions
    if (metadata.width && metadata.width > MAX_WIDTH) {
      image = image.resize(MAX_WIDTH, MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Determine output format
    let outputExt = ext
    let outputBuffer: Buffer

    if (ext === 'png') {
      // Check if PNG is photo-like (large, no transparency benefit)
      // Convert to JPEG if it would be significantly smaller
      const pngBuffer = await image.png({ quality: PNG_QUALITY }).toBuffer()

      if (pngBuffer.length > MAX_FILE_SIZE_BYTES) {
        // Try JPEG conversion
        const jpegBuffer = await image.jpeg({ quality: JPEG_QUALITY }).toBuffer()
        if (jpegBuffer.length < pngBuffer.length * 0.7) {
          // JPEG is significantly smaller, use it
          outputBuffer = jpegBuffer
          outputExt = 'jpg'
        } else {
          outputBuffer = pngBuffer
        }
      } else {
        outputBuffer = pngBuffer
      }
    } else {
      // JPEG/WebP - just compress
      outputBuffer = await image.jpeg({ quality: JPEG_QUALITY }).toBuffer()
      outputExt = 'jpg'
    }

    const savings = buffer.length - outputBuffer.length
    if (savings > 1024) {
      const pct = Math.round((savings / buffer.length) * 100)
      console.log(
        `    📦 Compressed: ${formatBytes(buffer.length)} → ${formatBytes(outputBuffer.length)} (-${pct}%)`,
      )
    }

    return { buffer: outputBuffer, ext: outputExt }
  } catch (error) {
    console.warn(`    ⚠️  Could not optimize image: ${error}`)
    return { buffer, ext }
  }
}

/**
 * Format bytes as human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}
