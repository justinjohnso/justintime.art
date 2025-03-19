import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Project as BaseProject, Category, Media } from '@/payload-types'
import RichText from '@/components/RichText'
import Image from 'next/image'
import Link from 'next/link'

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

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
        {project.category && typeof project.category !== 'number' && (
          <p className="text-gray-600 text-sm">{project.category.title}</p>
        )}
      </div>

      {/* Main Image */}
      {project.image?.url && (
        <div className="mb-12 relative aspect-video rounded-lg overflow-hidden">
          <Image
            src={project.image.url}
            alt={project.image.alt || project.title || ''}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
        {/* Left Sidebar - Project Info */}
        <div className="md:col-span-1 space-y-8">
          {/* Description */}
          {project.description && (
            <div className="project-info-card">
              <h3 className="font-medium text-lg mb-2">Description</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
          )}

          {/* Year */}
          {project.year && (
            <div className="project-info-card">
              <h3 className="font-medium text-lg mb-2">Year</h3>
              <p className="text-gray-600">{project.year}</p>
            </div>
          )}

          {/* Links */}
          {project.links && (
            <div className="project-info-card">
              <h3 className="font-medium text-lg mb-2">Links</h3>
              <div className="text-gray-600">
                <RichText data={project.links} enableGutter={false} />
              </div>
            </div>
          )}

          {/* Category */}
          {project.category && typeof project.category !== 'number' && (
            <div className="project-info-card">
              <h3 className="font-medium text-lg mb-2">Category</h3>
              <p className="text-gray-600">{project.category.title}</p>
            </div>
          )}
        </div>

        {/* Right Content - Main Body and Additional Images */}
        <div className="md:col-span-2">
          {/* Body Content */}
          {project.body && (
            <div className="prose max-w-none mb-12">
              <RichText data={project.body} />
            </div>
          )}

          {/* Additional Images */}
          {project.additionalImages && project.additionalImages.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {project.additionalImages.map(
                (item, index) =>
                  item.image?.url && (
                    <div key={index} className="relative aspect-[4/3] rounded-lg overflow-hidden">
                      <Image
                        src={item.image.url}
                        alt={`${project.title} - Image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ),
              )}
            </div>
          )}
        </div>
      </div>

      {/* Back to projects link */}
      <div className="border-t pt-6">
        <Link href="/work" className="text-blue-600 hover:text-blue-800 font-medium">
          ← Back to all projects
        </Link>
      </div>
    </div>
  )
}
