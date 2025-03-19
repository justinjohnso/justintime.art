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

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 pb-16 pt-12">
      {/* HERO SECTION – Text on left, hero image on right */}
      {project.image?.url && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-0 items-stretch">
          {/* Text Column – occupies 1/2 */}
          <div className="md:col-span-1 relative flex flex-col justify-center mt-6 mr-6 mb-6 ml-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-black mb-2">
              {project.title}
            </h1>
            {(project.description || project.links) && (
              <div className="payload-richtext m-0 p-0">
                {project.description && (
                  <p className="mb-0 text-base text-gray-600">{project.description}</p>
                )}
                {project.links && <RichText data={project.links} enableGutter={false} />}
              </div>
            )}
            <div className="mt-2 flex space-x-4">
              {project.year && (
                <span className="text-sm uppercase tracking-wider">Year: {project.year}</span>
              )}
            </div>
            {project.category && typeof project.category !== 'number' && (
              <div className="mt-auto text-xs uppercase tracking-wider text-gray-600">
                {project.category.title}
              </div>
            )}
          </div>
          {/* Hero Image Column – occupies 1/2 */}
          <a
            href={project.image.url}
            data-lightbox="gallery"
            className="md:col-span-1 block group p-0 m-0"
          >
            <div className="relative min-h-[350px] h-full">
              <Image
                src={project.image.url}
                alt={project.image.alt || project.title || ''}
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

      {/* SECOND ROW – Three additional images side-by-side with no gaps; slightly shorter vertical height */}
      {threeImages.length === 3 && (
        <section className="grid grid-cols-1 md:grid-cols-3 gap-0 mb-0 items-stretch">
          {threeImages.map((img, index) => (
            <a
              key={index}
              href={img.image.url || '#'}
              data-lightbox="gallery"
              className="block group p-0 m-0"
            >
              <div className="relative min-h-[350px] h-full">
                <Image
                  src={img.image.url || ''}
                  alt={img.image.alt || `${project.title} image ${index + 1}`}
                  fill
                  className="object-cover h-full transition-all duration-300 group-hover:opacity-90"
                />
              </div>
            </a>
          ))}
        </section>
      )}

      {/* THIRD ROW – Image on left, text (body) on right */}
      {project.body && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-0 items-stretch mb-0">
          {thirdRowImage && (
            <a
              href={thirdRowImage.image.url || '#'}
              data-lightbox="gallery"
              className="order-1 block group p-0 m-0 relative h-full min-h-[350px]"
            >
              <Image
                src={thirdRowImage.image.url || ''}
                alt={thirdRowImage.image.alt || `${project.title} secondary image`}
                fill
                className="object-cover transition-all duration-300 group-hover:opacity-90"
              />
            </a>
          )}
          <div className="order-2">
            <div className="prose prose-base max-w-none text-gray-700 mt-6 mb-6 ml-6 mr-0">
              <RichText data={project.body} />
            </div>
          </div>
        </section>
      )}

      {/* FOURTH ROW – Collage grid of any remaining additional images */}
      {remainingImages.length > 0 && (
        <section className="mb-0">
          <ImageGrid
            images={remainingImages.map((img) => ({
              image: {
                url: img.image.url || '',
                alt: img.image.alt || '',
              },
            }))}
            title={project.title}
          />
        </section>
      )}

      {/* Project Navigation */}
      <ProjectNavigation
        prevProject={mapNavProject(prevProject as Project | null)}
        nextProject={mapNavProject(nextProject as Project | null)}
      />

      {/* Back to projects link */}
      <div className="border-t border-gray-200 pt-8 mt-8">
        <Link
          href="/work"
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
