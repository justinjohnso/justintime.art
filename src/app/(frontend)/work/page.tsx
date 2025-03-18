import { MotionWrapper } from '@/components/MotionWrapper'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Project as BaseProject, Category } from '@/payload-types'
import ClientWrapper from '@/components/ClientWrapper'

// Extend the Project type to include the missing fields
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
}

// Define categories
const projectCategories = ['All', 'Web', 'Design', 'Development', 'Fabrication']

// Animation configurations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export default async function WorkPage() {
  // Fetch projects
  const payload = await getPayload({ config: configPromise })
  const projectsResponse = await payload.find({
    collection: 'projects',
  })

  // Use custom Project interface to access missing fields
  const projects = projectsResponse.docs as Project[]

  return (
    <div className="container mx-auto p-4">
      <MotionWrapper>
        <h1 className="text-3xl font-bold mb-6">My Work</h1>
        <p className="mb-4">Explore my projects and creative works.</p>
      </MotionWrapper>

      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Category filters */}
          <MotionWrapper>
            <div className="overflow-x-auto mb-12">
              <div className="flex space-x-4 min-w-max py-2">
                {projectCategories.map((category: string) => (
                  <button
                    key={category}
                    className="px-4 py-2 text-sm rounded-full border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </MotionWrapper>

          {/* Projects grid - use client component wrapper */}
          <ClientWrapper>
            {projects.map((project, index) => (
              <div key={project.id || index} className="group">
                <Link href={`/work/${project.slug}`} className="block">
                  <div className="overflow-hidden rounded-lg relative aspect-[4/3] mb-4">
                    {/* Safely handle media with type guard */}
                    <Image
                      src={project.media?.url || '/placeholder.jpg'}
                      alt={project.title || 'Project'}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {/* Type guard for category */}
                    {project.category && typeof project.category !== 'number' && (
                      <span className="text-xs text-gray-600">{project.category.title}</span>
                    )}
                  </div>
                  {/* Type guard for metadata */}
                  {project.metadata?.year && (
                    <p className="text-sm text-gray-500">{project.metadata.year}</p>
                  )}
                </Link>
              </div>
            ))}
          </ClientWrapper>
        </div>
      </div>
    </div>
  )
}
