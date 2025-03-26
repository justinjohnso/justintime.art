/**
 * This script imports projects and their associated media in a single process
 * to ensure proper relationships between projects and their images.
 */

import 'dotenv/config'
import { getPayload } from 'payload'
import config from '@payload-config'
import { projects } from '../../webflow/Projects_PayloadCMS_Formatted.json'
import { parse } from 'node-html-parser'

// Define Media type for image objects
interface Media {
  url: string
  alt: string
  fileName: string
}

// Define Project data structures
interface ProjectImage {
  url: string
  alt: string
  fileName: string
}

// Track imported media to avoid duplicates
const importedMedia = new Map<string, number>()

// Add interfaces for Lexical node types
interface LexicalNode {
  type: string
  version: number
  [key: string]: any
}

interface LexicalTextNode extends LexicalNode {
  type: 'text'
  text: string
  format?: string
}

interface LexicalParagraphNode extends LexicalNode {
  type: 'paragraph'
  format: string
  indent: number
  children: (LexicalTextNode | LexicalLinkNode)[]
}

interface LexicalLinkNode extends LexicalNode {
  type: 'link'
  url: string
  rel: string[]
  target: string
  newTab: boolean
  children: LexicalTextNode[]
}

interface LexicalRootNode extends LexicalNode {
  type: 'root'
  format: '' | 'left' | 'start' | 'center' | 'right' | 'end' | 'justify'
  indent: number
  direction: 'ltr' | 'rtl' | null
  children: LexicalParagraphNode[]
}

// Transform HTML content to a Lexical document structure
const htmlToLexical = (html: string | undefined): { root: LexicalRootNode } => {
  if (!html) {
    return createEmptyLexicalDocument()
  }
  try {
    const root = parse(html)
    const lexicalRoot: LexicalRootNode = {
      type: 'root',
      format: '',
      indent: 0,
      direction: 'ltr',
      version: 1,
      children: [],
    }

    // Helper function to convert HTML node to Lexical node(s)
    function processNode(
      node: any,
      parent: LexicalNode,
    ): Array<LexicalTextNode | LexicalLinkNode | LexicalParagraphNode> {
      const nodes: Array<LexicalTextNode | LexicalLinkNode | LexicalParagraphNode> = []

      // Handle text nodes
      if (node.nodeType === 3) {
        const text = node.text.trim()
        if (text) {
          const textNode: LexicalTextNode = { type: 'text', text, version: 1 }
          return [textNode]
        }
        return []
      }

      // Process block level elements and their children
      if (node.childNodes && node.childNodes.length) {
        if (node.tagName === 'P' || node.tagName === 'DIV') {
          const paragraph: LexicalParagraphNode = {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            children: [],
          }

          for (const child of node.childNodes) {
            const childNodes = processNode(child, paragraph)
            // Filter out paragraph nodes at this level
            const validChildren = childNodes.filter(
              (node) => node.type === 'text' || node.type === 'link',
            ) as Array<LexicalTextNode | LexicalLinkNode>
            paragraph.children.push(...validChildren)
          }

          // Only add paragraph if it has children
          if (paragraph.children.length > 0) {
            nodes.push(paragraph)
          }
        }
        // Process link elements
        else if (node.tagName === 'A') {
          const href = node.getAttribute('href')
          if (!href || !href.trim()) {
            for (const child of node.childNodes) {
              const childNodes = processNode(child, parent)
              nodes.push(...childNodes)
            }
          } else {
            try {
              const url = new URL(href.trim())
              const link: LexicalLinkNode = {
                type: 'link',
                version: 1,
                url: url.toString(),
                rel: ['noopener', 'noreferrer'],
                target: '_blank',
                newTab: true, // Add this property to fix the error
                children: [],
              }

              for (const child of node.childNodes) {
                const childNodes = processNode(child, link)
                // Filter for text nodes only
                const textNodes = childNodes.filter(
                  (node) => node.type === 'text',
                ) as LexicalTextNode[]
                link.children.push(...textNodes)
              }

              if (link.children.length > 0) {
                nodes.push(link)
              }
            } catch (error) {
              try {
                const urlWithProtocol = new URL(`https://${href.trim()}`)
                const link: LexicalLinkNode = {
                  type: 'link',
                  version: 1,
                  url: urlWithProtocol.toString(),
                  rel: ['noopener', 'noreferrer'],
                  target: '_blank',
                  newTab: true, // Add this property to fix the error
                  children: [],
                }

                for (const child of node.childNodes) {
                  const childNodes = processNode(child, link)
                  // Filter for text nodes only
                  const textNodes = childNodes.filter(
                    (node) => node.type === 'text',
                  ) as LexicalTextNode[]
                  link.children.push(...textNodes)
                }

                if (link.children.length > 0) {
                  nodes.push(link)
                }
              } catch (error) {
                for (const child of node.childNodes) {
                  const childNodes = processNode(child, parent)
                  nodes.push(...childNodes)
                }
              }
            }
          }
        }
        // Handle formatting elements
        else if (node.tagName === 'STRONG' || node.tagName === 'B') {
          for (const child of node.childNodes) {
            const childNodes = processNode(child, parent)
            for (const textNode of childNodes) {
              if (textNode.type === 'text') {
                textNode.format = textNode.format ? `${textNode.format} bold` : 'bold'
              }
            }
            nodes.push(...childNodes)
          }
        } else if (node.tagName === 'EM' || node.tagName === 'I') {
          for (const child of node.childNodes) {
            const childNodes = processNode(child, parent)
            for (const textNode of childNodes) {
              if (textNode.type === 'text') {
                textNode.format = textNode.format ? `${textNode.format} italic` : 'italic'
              }
            }
            nodes.push(...childNodes)
          }
        }
        // Handle line breaks by converting them to text nodes with newlines
        else if (node.tagName === 'BR') {
          nodes.push({ type: 'text', text: '\n', version: 1 } as LexicalTextNode)
        }
        // Handle other elements
        else {
          for (const child of node.childNodes) {
            const childNodes = processNode(child, parent)
            nodes.push(...childNodes)
          }
        }
      } else if (node.text) {
        const text = node.text.trim()
        if (text) {
          nodes.push({ type: 'text', text, version: 1 } as LexicalTextNode)
        }
      }

      return nodes
    }

    // Process all top-level nodes
    if (root.childNodes && root.childNodes.length) {
      for (const node of root.childNodes) {
        const childNodes = processNode(node, lexicalRoot)
        // Ensure all top-level nodes are wrapped in paragraphs
        for (const childNode of childNodes) {
          if (childNode.type !== 'paragraph') {
            lexicalRoot.children.push({
              type: 'paragraph',
              format: '',
              indent: 0,
              version: 1,
              children: [childNode],
            } as LexicalParagraphNode)
          } else {
            lexicalRoot.children.push(childNode as LexicalParagraphNode)
          }
        }
      }
    }

    // If no content was processed, add an empty paragraph
    if (lexicalRoot.children.length === 0) {
      lexicalRoot.children.push({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'text', text: '', version: 1 } as LexicalTextNode],
      } as LexicalParagraphNode)
    }

    return { root: lexicalRoot }
  } catch (error) {
    console.error('Error converting HTML to Lexical:', error)
    return createEmptyLexicalDocument()
  }
}

// Create an empty Lexical document
function createEmptyLexicalDocument(): { root: LexicalRootNode } {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      direction: 'ltr',
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'text',
              text: '',
              version: 1,
            } as LexicalTextNode,
          ],
        } as LexicalParagraphNode,
      ],
    } as LexicalRootNode,
  }
}

// Build a mapping between category slug (or title) and Payload document id
async function getCategoryMapping(payload: any): Promise<Record<string, number>> {
  const categoriesResponse = await payload.find({ collection: 'categories' })
  const mapping: Record<string, number> = {}
  // Map categories by slug
  categoriesResponse.docs.forEach((cat: any) => {
    mapping[cat.slug] = cat.id
  })
  return mapping
}

// Import a single media item from a URL
async function importMediaFromURL(payload: any, mediaData: Media): Promise<number | null> {
  // Check if this media has already been imported
  if (importedMedia.has(mediaData.fileName)) {
    return importedMedia.get(mediaData.fileName) as number
  }

  try {
    console.log(`Fetching image from ${mediaData.url}`)
    const response = await fetch(mediaData.url)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }

    // Get the binary data and content type
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Create the media document
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

    console.log(`Imported media: ${mediaData.fileName} with ID: ${createdMedia.id}`)

    // Store the ID to avoid reimporting
    importedMedia.set(mediaData.fileName, createdMedia.id)
    return createdMedia.id
  } catch (error) {
    console.error(`Error importing media ${mediaData.fileName}:`, error)
    return null
  }
}

// Transform HTML content into PayloadCMS richText format for links
const htmlToLinks = (html: string | undefined): { root: LexicalRootNode } => {
  if (!html) {
    return createEmptyLexicalDocument()
  }
  try {
    const root = parse(html)
    const lexicalRoot: LexicalRootNode = {
      type: 'root',
      format: '',
      indent: 0,
      direction: 'ltr',
      version: 1,
      children: [],
    }

    // Process anchor tags
    root.querySelectorAll('a').forEach((anchor) => {
      const href = anchor.getAttribute('href')
      if (href && href.trim()) {
        const paragraph: LexicalParagraphNode = {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              type: 'link',
              version: 1,
              url: href.trim(),
              rel: ['noopener', 'noreferrer'],
              target: '_blank',
              newTab: true, // Add this property to fix the error
              children: [
                {
                  type: 'text',
                  text: anchor.text || href,
                  version: 1,
                },
              ],
            },
          ],
        }
        lexicalRoot.children.push(paragraph)
      }
    })

    // If no links were found, add an empty paragraph
    if (lexicalRoot.children.length === 0) {
      lexicalRoot.children.push({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [{ type: 'text', text: '', version: 1 }],
      })
    }

    return { root: lexicalRoot }
  } catch (error) {
    console.error('Error converting HTML to links:', error)
    return createEmptyLexicalDocument()
  }
}

async function run() {
  try {
    const payload = await getPayload({ config })

    // Build category mapping from the seeded categories.
    const categoryMapping = await getCategoryMapping(payload)
    console.log('Category Mapping:', categoryMapping)

    const seedProjects = async () => {
      for (const project of projects) {
        console.log('Processing project:', project.title, 'with category:', project.category)

        // Import main image if it exists
        let mainImageId = null
        if (project.image && project.image.url) {
          // Create a Media object from the project's image data
          const imageData: Media = {
            url: project.image.url,
            alt: project.image.alt || '',
            fileName: project.image.fileName || '',
          }
          mainImageId = await importMediaFromURL(payload, imageData)
        }

        // Import additional images if they exist
        const additionalImagesIds: any[] = []
        if (project.additionalImages && project.additionalImages.length > 0) {
          for (const additionalImage of project.additionalImages) {
            if (additionalImage && additionalImage.url) {
              // Create a Media object from the additional image data
              const imageData: Media = {
                url: additionalImage.url,
                alt: additionalImage.alt || '',
                fileName: additionalImage.fileName || '',
              }
              const additionalImageId = await importMediaFromURL(payload, imageData)
              if (additionalImageId) {
                additionalImagesIds.push({ image: additionalImageId })
              }
            }
          }
        }

        // Create the project with the imported media references
        const mappedProject = {
          title: project.title,
          description: project.description,
          image: mainImageId,
          featured: (project as any).featured ?? false,
          links: htmlToLinks(project.links as string), // Use the new richText format
          yearCompleted: (project as any).yearCompleted ?? project.metadata?.year,
          body: htmlToLexical((project as any).content || (project as any).body),
          additionalImages: additionalImagesIds,
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
                categories: [Number(categoryId)], // Use "categories" (plural) to match the field in the schema
              },
            })

            console.log(`Category relationship established for project: ${project.title}`)
          }

          console.log(`Successfully imported project: ${project.title}`)
        } catch (error) {
          console.error(`Error importing project ${project.title}:`, error)
          // Print more detailed error information
          if (error instanceof Error) {
            console.error('Error details:', error.message)
            if ('data' in error && typeof (error as any).data === 'object') {
              console.error('Validation errors:', JSON.stringify((error as any).data, null, 2))
            }
          }
        }
      }
    }

    await seedProjects()
    console.log('Import process completed successfully')
    process.exit(0)
  } catch (error) {
    console.error('Import error:', JSON.stringify(error, null, 2))
    process.exit(1)
  }
}

await run()
