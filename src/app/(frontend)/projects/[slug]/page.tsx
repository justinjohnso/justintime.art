import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Project as BaseProject, Category, Media } from '@/payload-types'
import RichText from '@/components/RichText'
import Image from 'next/image'
import Link from 'next/link'
import ProjectNavigation from '@/components/ProjectNavigation'
import ImageGrid from '@/components/ImageGrid'

// Omit the inherited fields that conflict and redefine them.
// Here we use the Media type for image so that createdAt/updatedAt are present.
interface Project extends Omit<BaseProject, 'body' | 'links' | 'additionalImages' | 'image'> {
  image?: Media // Uses Media type (with id, url, alt, createdAt, updatedAt, etc.)
  category: number | (Category & { title: string })
  year?: string
  featured?: boolean
  description?: string
  body?: any // Rich text content (we assume it conforms to DefaultTypedEditorState)
  additionalImages?: {
    image: Media
  }[]
  links?: any // Rich text content just like body
}

interface NavigationProject {
  title: string
  slug: string
  image?: {
    url: string
    alt?: string
  }
}

const mapNavProject = (proj: Project | null): NavigationProject | null => {
  if (!proj) return null
  return {
    title: proj.title || '',
    slug: proj.slug || '',
    image:
      proj.image && proj.image.url
        ? { url: proj.image.url ?? '', alt: proj.image.alt || proj.title || '' }
        : undefined,
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({ collection: 'projects' })

  return projects.docs.map((project) => ({
    slug: project.slug || '',
  }))
}

// Add this helper at the top of your file
const safeString = (s: string | null | undefined): string => s ?? ''

// Helper: split an array into chunks of the given size.
const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize))
  }
  return chunks
}

// Decide the aspect ratio class based on the number of images in the row.
const getAspectRatioClass = (count: number): string => {
  if (count === 1) return 'aspect-[16/9]'
  if (count === 2) return 'aspect-[3/2]'
  if (count === 3) return 'aspect-[4/3]'
  return 'aspect-[4/3]'
}

// Add this helper function at the top with your other helper functions
const sanitizeRichText = (content: any) => {
  if (!content) return content

  // Create a deep copy of the content
  const sanitized = JSON.parse(JSON.stringify(content))

  // Helper to recursively process nodes
  const processNodes = (nodes: any[]) => {
    if (!Array.isArray(nodes)) return

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (!node) continue

      // Handle link nodes - ensure they have a newTab property
      if (node.type === 'link') {
        // Set default value for newTab if it doesn't exist
        node.newTab = node.newTab ?? true

        // Ensure fields expected by the link renderer are present
        node.fields = node.fields || {}
        node.fields.newTab = node.fields.newTab ?? node.newTab
        node.fields.url = node.fields?.url || node.url || '#'
        node.url = node.url || node.fields?.url || '#'
      }

      // Process children recursively
      if (node.children) {
        processNodes(node.children)
      }
    }
  }

  // Process the root children
  if (sanitized && sanitized.root && Array.isArray(sanitized.root.children)) {
    processNodes(sanitized.root.children)
  }

  return sanitized
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'projects',
    where: {
      slug: {
        equals: params.slug,
      } as any,
    },
    limit: 1,
  })

  const project = result.docs[0] as Project | undefined

  if (!project) {
    notFound()
  }

  // Get all projects for navigation
  const allProjects = await payload.find({
    collection: 'projects',
    sort: 'createdAt',
  })

  const currentIndex = allProjects.docs.findIndex((p) => p.id === project.id)
  const prevProject = currentIndex > 0 ? allProjects.docs[currentIndex - 1] : null
  const nextProject =
    currentIndex < allProjects.docs.length - 1 ? allProjects.docs[currentIndex + 1] : null

  // Process additional images
  const validImages =
    project.additionalImages?.filter(
      (img) => img.image && typeof img.image.url === 'string' && img.image.url.trim() !== '',
    ) || []
  const threeImages = validImages.slice(0, 3)
  const thirdRowImage = validImages.length > 3 ? validImages[3] : null
  const remainingImages = validImages.slice(4)

  // Partition alternate images, ensuring that if an image is missing we assign null (not undefined)
  const altImages = validImages
  const n = altImages.length
  let row2Images: typeof altImages = []
  let row3Image: (typeof altImages)[0] | null = null
  let remainingAlt: typeof altImages = []

  if (n === 1) {
    row3Image = altImages[0] ?? null
  } else if (n === 2) {
    row3Image = altImages[0] ?? null
    remainingAlt = altImages.slice(1)
  } else if (n === 3) {
    row2Images = altImages.slice(0, 2)
    row3Image = altImages[2] ?? null
  } else if (n >= 4) {
    row2Images = altImages.slice(0, 3)
    row3Image = altImages[3] ?? null
    remainingAlt = altImages.slice(4)
  }

  const rows = chunkArray(remainingAlt, 3)

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-16 pt-12">
      {/* HERO SECTION – Text on left, hero image on right */}
      {project.image?.url && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-0 items-stretch">
          {/* Updated Hero Text Container */}
          <div className="md:col-span-1 relative flex flex-col mt-6 mr-6 mb-6 ml-0">
            {/* Flex container for the main text to be vertically centered */}
            <div className="flex-1 flex flex-col justify-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-black mb-2">
                {project.title}
              </h1>
              {(project.description || project.links) && (
                <div className="payload-richtext m-0 p-0">
                  {project.description && (
                    <p className="mb-0 text-base text-gray-600">{project.description}</p>
                  )}
                  {project.links && (
                    <RichText data={sanitizeRichText(project.links)} enableGutter={false} />
                  )}
                </div>
              )}
              <div className="mt-2 flex space-x-4">
                {project.year && (
                  <span className="text-sm uppercase tracking-wider">Year: {project.year}</span>
                )}
              </div>
            </div>
            {/* The category tag remains at the bottom */}
            {project.category && typeof project.category !== 'number' && (
              <div className="text-xs uppercase tracking-wider text-gray-600">
                {project.category.title}
              </div>
            )}
          </div>
          {/* Hero Image Column – updated alt using nullish coalescing */}
          <a
            href={safeString(project.image?.url)}
            data-lightbox="gallery"
            className="md:col-span-1 block group p-0 m-0"
          >
            <div className="relative min-h-[350px] h-full">
              <Image
                src={safeString(project.image?.url)}
                alt={safeString(project.image?.alt) || safeString(project.title)}
                fill
                priority
                className="object-cover h-full transition-all duration-300"
              />
              {/* Common white overlay on hover */}
              <div className="absolute inset-0 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </a>
        </section>
      )}

      {/* Render Row 2 if defined */}
      {row2Images.length > 0 && (
        <section className="grid gap-0 mb-0">
          <div
            className={
              'grid gap-0 ' +
              (row2Images.length === 1
                ? 'grid-cols-1'
                : row2Images.length === 2
                  ? 'grid-cols-2'
                  : 'grid-cols-3')
            }
          >
            {row2Images.map((img, index) => (
              <a
                key={index}
                href={safeString(img.image.url)}
                data-lightbox="gallery"
                className="block group p-0 m-0"
              >
                <div className={`relative ${getAspectRatioClass(row2Images.length)}`}>
                  <Image
                    src={safeString(img.image.url)}
                    alt={safeString(img.image.alt) || `${project.title} image`}
                    fill
                    className="object-cover transition-all duration-300 group-hover:opacity-90"
                  />
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Render Row 3: Single alternate image with body text */}
      {project.body && row3Image && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch mb-0">
          <a
            href={safeString(row3Image.image.url)}
            data-lightbox="gallery"
            className="block group p-0 m-0 relative h-full min-h-[350px]"
          >
            <Image
              src={safeString(row3Image.image.url)}
              alt={safeString(row3Image.image.alt) || `${project.title} secondary image`}
              fill
              className="object-cover transition-all duration-300 group-hover:opacity-90"
            />
          </a>
          <div className="order-2 prose prose-base max-w-none text-gray-700 mt-1 mb-1 ml-2 -mr-4">
            <RichText data={sanitizeRichText(project.body)} />
          </div>
        </section>
      )}

      {/* Render Remaining Alternating Rows */}
      {rows.map((row, rowIdx) => {
        const gridColsClass =
          row.length === 1 ? 'grid-cols-1' : row.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
        return (
          <section key={rowIdx} className="grid gap-0 mb-0">
            <div className={`grid ${gridColsClass} gap-0`}>
              {row.map((img, colIdx) => (
                <a
                  key={colIdx}
                  href={safeString(img.image.url)}
                  data-lightbox="gallery"
                  className="block group p-0 m-0"
                >
                  <div className={`relative ${getAspectRatioClass(row.length)}`}>
                    <Image
                      src={safeString(img.image.url)}
                      alt={safeString(img.image.alt) || `${project.title} image`}
                      fill
                      className="object-cover transition-all duration-300 group-hover:opacity-90"
                    />
                  </div>
                </a>
              ))}
            </div>
          </section>
        )
      })}

      {/* Project Navigation */}
      <ProjectNavigation
        prevProject={mapNavProject(prevProject as Project | null)}
        nextProject={mapNavProject(nextProject as Project | null)}
      />

      {/* Back to projects link */}
      <div className="border-t border-gray-200 pt-8 mt-8">
        <Link
          href={`/projects/${project.slug}`}
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors p-0 m-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to all projects
        </Link>
      </div>
    </div>
  )
}
