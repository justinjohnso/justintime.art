/**
 * Media Storage Utilities
 * 
 * Handle downloading, optimizing, and storing media files
 * Supports both local filesystem and Digital Ocean Spaces
 */

import { createWriteStream } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { pipeline } from 'stream/promises';

/**
 * Storage configuration
 */
export interface StorageConfig {
  type: 'local' | 'spaces';
  localPath?: string; // For local: path relative to public/
  spacesEndpoint?: string; // For DO Spaces
  spacesRegion?: string;
  spacesBucket?: string;
  spacesKey?: string;
  spacesSecret?: string;
}

/**
 * Get storage configuration from environment
 */
export function getStorageConfig(): StorageConfig {
  const type = import.meta.env.STORAGE_TYPE || 'local';

  if (type === 'local') {
    return {
      type: 'local',
      localPath: import.meta.env.MEDIA_PATH || 'media',
    };
  }

  return {
    type: 'spaces',
    spacesEndpoint: import.meta.env.DO_SPACES_ENDPOINT,
    spacesRegion: import.meta.env.DO_SPACES_REGION || 'nyc3',
    spacesBucket: import.meta.env.DO_SPACES_BUCKET,
    spacesKey: import.meta.env.DO_SPACES_KEY,
    spacesSecret: import.meta.env.DO_SPACES_SECRET,
  };
}

/**
 * Download image from URL
 * 
 * @param url - Image URL (Notion temporary URL or external)
 * @returns Buffer containing image data
 */
export async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Save image locally
 * 
 * @param buffer - Image data
 * @param filename - Filename (e.g., "project-slug-hero.jpg")
 * @param config - Storage configuration
 * @returns Public URL for the image
 */
export async function saveImageLocal(
  buffer: Buffer,
  filename: string,
  config: StorageConfig
): Promise<string> {
  const mediaPath = config.localPath || 'media';
  const publicDir = join(process.cwd(), 'public', mediaPath);
  const filePath = join(publicDir, filename);

  // Ensure directory exists
  await mkdir(dirname(filePath), { recursive: true });

  // Write file
  await writeFile(filePath, buffer);

  // Return public URL
  return `/${mediaPath}/${filename}`;
}

/**
 * Upload image to Digital Ocean Spaces
 * 
 * @param buffer - Image data
 * @param filename - Filename
 * @param config - Storage configuration
 * @returns Public URL for the image
 */
export async function uploadImageToSpaces(
  buffer: Buffer,
  filename: string,
  config: StorageConfig
): Promise<string> {
  // Will be implemented when DO Spaces is set up
  // Requires: @aws-sdk/client-s3 (DO Spaces is S3-compatible)
  
  throw new Error('DO Spaces upload not yet implemented. Install @aws-sdk/client-s3 and implement.');
  
  // Implementation outline:
  // 1. Create S3Client with DO Spaces endpoint
  // 2. Use PutObjectCommand to upload
  // 3. Return CDN URL
  
  /*
  import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
  
  const s3Client = new S3Client({
    endpoint: config.spacesEndpoint,
    region: config.spacesRegion,
    credentials: {
      accessKeyId: config.spacesKey!,
      secretAccessKey: config.spacesSecret!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: config.spacesBucket,
    Key: filename,
    Body: buffer,
    ACL: 'public-read',
    ContentType: getContentType(filename),
  });

  await s3Client.send(command);

  return `https://${config.spacesBucket}.${config.spacesRegion}.digitaloceanspaces.com/${filename}`;
  */
}

/**
 * Save image (abstracts local vs cloud storage)
 * 
 * @param url - Source URL
 * @param filename - Target filename
 * @returns Public URL for saved image
 */
export async function saveImage(url: string, filename: string): Promise<string> {
  const config = getStorageConfig();
  const buffer = await downloadImage(url);

  if (config.type === 'local') {
    return saveImageLocal(buffer, filename, config);
  } else {
    return uploadImageToSpaces(buffer, filename, config);
  }
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
  originalUrl?: string
): string {
  const ext = originalUrl ? getExtensionFromUrl(originalUrl) : 'jpg';
  const suffix = type === 'additional' && index !== undefined ? `-${index + 1}` : '';
  return `${slug}-${type}${suffix}.${ext}`;
}

/**
 * Extract file extension from URL
 */
function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split('.').pop()?.toLowerCase();
    
    // Validate extension
    const validExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    if (ext && validExts.includes(ext)) {
      return ext;
    }
  } catch {
    // Invalid URL
  }
  
  return 'jpg'; // Default
}

/**
 * Get content type from filename
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const contentTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };

  return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Optimize image (optional future enhancement)
 * Could use sharp library for resizing/compression
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  // Placeholder for image optimization
  // Install 'sharp' when ready to implement
  return buffer;
}
