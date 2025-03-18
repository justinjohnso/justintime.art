import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notFound } from 'next/navigation'
import { Project as BaseProject, Category } from '@/payload-types'
// Import RichText correctly
import RichText from '@/components/RichText'
import Image from 'next/image'

// Extended Project interface with more accurate typing
interface Project extends BaseProject {
  media?: {
    url: string
    alt?: string
  }
  category: number | (Category & { title: string })
  metadata?: {
    year?: string
    description?: string
  }
  content?: any // The rich text content from Payload
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const projects = await payload.find({
    collection: 'projects',
  })

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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">{project.title}</h1>

      {project.media?.url && (
        <div className="mb-8 relative aspect-video">
          <Image
            src={project.media.url}
            alt={project.title || ''}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-8 mb-12">
        <div>
          {project.description && (
            <div className="prose max-w-none mb-6">
              <p className="text-lg">{project.description}</p>
            </div>
          )}

          {project.content && (
            <div className="prose max-w-none">
              {/* Fix: Use data prop instead of content prop */}
              <RichText data={project.content} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          {project.metadata?.year && (
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-500">Year</h3>
              <p>{project.metadata.year}</p>
            </div>
          )}

          {project.category && typeof project.category !== 'number' && (
            <div>
              <h3 className="text-sm font-semibold uppercase text-gray-500">Category</h3>
              <p>{project.category.title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
