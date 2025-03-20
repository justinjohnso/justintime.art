/**
 * This script imports projects and their associated media in a single process
 * to ensure proper relationships between projects and their images.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { projects } from '../../webflow/Projects_PayloadCMS_Formatted.json'

interface MediaData {
  url: string
  alt: string
  fileName: string
}

// Track imported media to avoid duplicates
const importedMedia = new Map<string, number>()

// Transform a string into a rich text format
const transformToRichText = (text: string) => {
  // Explicitly type the format to match the expected union type
  const format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify' = ''

  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ text: text || '' }],
          direction: null,
          format,
          indent: 0,
          version: 1,
        },
      ],
      direction: null,
      format,
      indent: 0,
      version: 1,
    },
  }
}

async function importMediaFromURL(payload: any, mediaData: MediaData): Promise<number | null> {
  if (!mediaData || !mediaData.url) return null

  if (importedMedia.has(mediaData.fileName)) {
    return importedMedia.get(mediaData.fileName) as number
  }

  try {
    console.log(`Fetching image from ${mediaData.url}`)
    const response = await fetch(mediaData.url)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    const createdMedia = await payload.create({
      collection: 'media',
      data: {
        alt: mediaData.alt || mediaData.fileName || 'Image',
      },
      file: {
        data: buffer,
        size: buffer.length,
        mimetype: contentType,
        name: mediaData.fileName || `image-${Date.now()}`,
      },
    })

    importedMedia.set(mediaData.fileName, createdMedia.id)
    return createdMedia.id
  } catch (error) {
    console.error(`Error importing media ${mediaData.fileName}:`, error)
    return null
  }
}

async function run() {
  try {
    const payload = await getPayload({ config })
    console.log('Payload initialized')

    const categoriesResponse = await payload.find({ collection: 'categories' })
    const categoryMapping: Record<string, number> = {}
    categoriesResponse.docs.forEach((cat: any) => {
      categoryMapping[cat.slug] = cat.id
    })

    for (const project of projects) {
      try {
        // Import main image
        let mainImageId = null
        if (project.image && project.image.url) {
          mainImageId = await importMediaFromURL(payload, project.image)
        }

        // Import additional images
        const additionalImagesIds = []
        if (project.additionalImages && project.additionalImages.length > 0) {
          for (const additionalImage of project.additionalImages) {
            const additionalImageId = await importMediaFromURL(payload, additionalImage)
            if (additionalImageId) {
              additionalImagesIds.push({ image: additionalImageId })
            }
          }
        }

        // Create project
        const mappedProject = {
          title: project.title,
          description: project.description,
          image: mainImageId,
          // Default to false if featured is undefined
          featured: false,
          // Transform links string to rich text format
          links: transformToRichText(project.links || ''),
          // Use metadata.year as yearCompleted if present
          yearCompleted: project.metadata?.year,
          // Use content as body
          body: transformToRichText(project.content || ''),
          additionalImages: additionalImagesIds,
        }

        const createdProject = await payload.create({
          collection: 'projects',
          data: mappedProject,
        })

        // Update categories relationship
        if (project.category && categoryMapping[project.category]) {
          const categoryId = categoryMapping[project.category]
          await payload.update({
            collection: 'projects',
            id: createdProject.id,
            data: {
              categories: [categoryId],
            },
          })
        }

        console.log(`Successfully imported project: ${project.title}`)
      } catch (error) {
        console.error(`Error importing project ${project.title}:`, error)
      }
    }

    console.log('Import process completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Import error:', JSON.stringify(error, null, 2))
    process.exit(1)
  }
}

await run()
