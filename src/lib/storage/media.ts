/**
 * Media Storage Utilities
 *
 * Handle downloading and storing media files to local filesystem
 * Files stored in public/media/ for both dev and production (Droplet)
 */

import { mkdir, writeFile } from 'fs/promises'
import { dirname, join } from 'path'

/**
 * Get media storage path
 */
export function getMediaPath(): string {
  return import.meta.env.MEDIA_PATH || 'media'
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
 * Save image to local filesystem
 *
 * @param buffer - Image data
 * @param subdir - Subdirectory within media (e.g., "projects/my-project")
 * @param filename - Filename (e.g., "hero.jpg")
 * @returns Public URL for the image
 */
export async function saveImage(buffer: Buffer, subdir: string, filename: string): Promise<string> {
  const mediaPath = getMediaPath()
  const publicDir = join(process.cwd(), 'public', mediaPath, subdir)
  const filePath = join(publicDir, filename)

  // Ensure directory exists
  await mkdir(dirname(filePath), { recursive: true })

  // Write file
  await writeFile(filePath, buffer)

  // Return public URL
  return `/${mediaPath}/${subdir}/${filename}`
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
 * Optimize image (optional future enhancement)
 * Could use sharp library for resizing/compression
 *
 * @param buffer - Original image buffer
 * @returns Optimized image buffer
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  // TODO: Install 'sharp' when ready to implement
  // Could resize large images, compress, convert to WebP, etc.
  return buffer
}
