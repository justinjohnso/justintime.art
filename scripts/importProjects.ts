/**
 * This script imports projects from the formatted JSON file, ensuring media is
 * properly referenced and categories are set correctly.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { projects } from '../../webflow/Projects_PayloadCMS_Formatted.json'

// Define Media type for image objects
interface Media {
  url: string
  alt: string
  id: number
  createdAt: string
  updatedAt: string
}

// Allowed union type for links.root.format
type AllowedFormat = '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'

const transformLinks = (links: any): any => {
  if (!links || !links.root) return links

  // Check if the incoming format is one of the allowed values;
  // if not, default to an empty string.
  const allowedValues: AllowedFormat[] = ['', 'left', 'start', 'center', 'right', 'end', 'justify']

  return {
    ...links,
    root: {
      ...links.root,
      format: allowedValues.includes(links.root.format) ? links.root.format : '',
    },
  }
}

// Build a mapping between category slug (or title) and Payload document id
async function getCategoryMapping(payload: any): Promise<Record<string, string>> {
  const categoriesResponse = await payload.find({ collection: 'categories' })
  const mapping: Record<string, string> = {}
  // Assuming categories are seeded with a slug, and you want to match on that.
  categoriesResponse.docs.forEach((cat: any) => {
    // Use cat.slug or cat.title as the key, depending on what your projects dataset uses.
    mapping[cat.slug] = cat.id
  })
  return mapping
}

// Build a mapping of filename to media ID
async function getMediaMapping(payload: any): Promise<Record<string, number>> {
  const mediaResponse = await payload.find({
    collection: 'media',
    limit: 1000, // Make sure we get all media
  })

  const mapping: Record<string, number> = {}
  mediaResponse.docs.forEach((media: any) => {
    // Extract filename from the original media filename
    const filename = media.filename?.split('.')[0] || ''
    if (filename) {
      mapping[filename] = media.id
    }
  })

  return mapping
}

async function run() {
  try {
    const payload = await getPayload({ config })

    // Build category mapping from the seeded categories
    const categoryMapping = await getCategoryMapping(payload)
    console.log('Category Mapping:', categoryMapping)

    // Build media mapping
    const mediaMapping = await getMediaMapping(payload)
    console.log('Found', Object.keys(mediaMapping).length, 'media items')

    const seedProjects = async () => {
      for (const project of projects) {
        console.log('Processing project:', project.title, 'with category:', project.category)

        // Skip image references that don't exist
        let imageId = null
        if (project.image && project.image.url) {
          const filenameWithoutExt = project.image.url.split('/').pop()?.split('.')[0]
          imageId = mediaMapping[filenameWithoutExt || ''] || null

          if (!imageId) {
            console.log(`Warning: Could not find media with filename ${filenameWithoutExt}`)
          }
        }

        // Process additional images
        const processedAdditionalImages = []
        if (project.additionalImages && project.additionalImages.length > 0) {
          for (const img of project.additionalImages) {
            if (img.url) {
              const filenameWithoutExt = img.url.split('/').pop()?.split('.')[0]
              const additionalImageId = mediaMapping[filenameWithoutExt || ''] || null

              if (additionalImageId) {
                processedAdditionalImages.push({
                  image: additionalImageId,
                })
              }
            }
          }
        }

        // First create the project without a category or with minimal data
        const mappedProject = {
          title: project.title,
          description: project.description,
          // Only set the image if we have a valid ID
          image: imageId,
          featured: (project as any).featured ?? false,
          links: transformLinks({
            root: {
              type: 'doc',
              children: [
                {
                  type: 'paragraph',
                  children: [{ text: project.links }],
                  direction: null,
                  format: '',
                  indent: 0,
                  version: 1,
                },
              ],
              direction: null,
              format: '',
              indent: 0,
              version: 1,
            },
          }),
          yearCompleted: (project as any).yearCompleted ?? project.metadata?.year,
          body: (project as any).body ?? project.content,
          // Only include additional images that exist
          additionalImages: processedAdditionalImages,
        }

        try {
          // Create the project
          const createdProject = await payload.create({
            collection: 'projects',
            data: mappedProject,
          })

          console.log(`Created project: ${project.title} with ID: ${createdProject.id}`)

          // Now establish the relationship to category if it exists
          if (project.category && categoryMapping[project.category]) {
            const categoryId = categoryMapping[project.category]
            console.log(
              `Adding category relationship: Project ID ${createdProject.id} to Category ID ${categoryId}`,
            )

            // Update the project to add the category relationship
            await payload.update({
              collection: 'projects',
              id: createdProject.id,
              data: {
                categories: [categoryId], // This will handle the relationship through the `projects_rels` table
              },
            })

            console.log(`Category relationship established for project: ${project.title}`)
          }

          console.log(`Successfully imported project: ${project.title}`)
        } catch (error) {
          console.error(`Error importing project ${project.title}:`, error)
        }
      }
    }

    await seedProjects()
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', JSON.stringify(error, null, 2))
    process.exit(1)
  }
}

await run()
