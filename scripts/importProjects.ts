/**
 * This is an example of a standalone script that loads in the Payload config
 * and uses the Payload Local API to query the database.
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

async function run() {
  try {
    const payload = await getPayload({ config })

    // Build category mapping from the seeded categories.
    const categoryMapping = await getCategoryMapping(payload)
    console.log('Category Mapping:', categoryMapping)

    const seedProjects = async () => {
      for (const project of projects) {
        const mappedProject = {
          title: project.title,
          slug: project.slug,
          description: project.description,
          image: project.image
            ? ({
                ...project.image,
                id: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Media)
            : null,
          // Use the correct property "categories" as declared in the collection config.
          categories:
            project.category && categoryMapping[project.category]
              ? [Number(categoryMapping[project.category])]
              : undefined,
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
          additionalImages: project.additionalImages
            ? project.additionalImages.map((img: any) => ({
                image: {
                  ...img,
                  id: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as Media,
              }))
            : [],
          video: project.video,
        }

        try {
          await payload.create({
            collection: 'projects',
            data: mappedProject,
          })
          console.log(`Imported project: ${project.title}`)
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
