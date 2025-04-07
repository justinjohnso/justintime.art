import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Project as PayloadProject } from '@/payload-types'
import ProjectGrid from '@/components/ProjectGrid'

// Add the safeString utility function
export function safeString(input: any): string {
  return input ? String(input) : ''
}

// Ensure the ProjectWithId type is defined correctly
type ProjectWithId = Omit<
  PayloadProject,
  'id' | 'slug' | 'yearCompleted' | 'featured' | 'image'
> & {
  id: string
  slug: string
  yearCompleted?: number
  featured?: boolean
  image?: number | { url?: string; alt?: string }
}

export default async function Home() {
  // Fetch all projects from Payload CMS
  const payload = await getPayload({ config: configPromise })
  const projectsResponse = await payload.find({
    collection: 'projects',
    depth: 2, // Ensure we get the full category objects
    limit: 1000, // High limit to get all projects
    sort: '-yearCompleted', // Sort by year completed with newest first
  })

  // Update the yearCompleted property to strictly match number | undefined
  const allProjects = projectsResponse.docs.map((project) => {
    const { yearCompleted, ...rest } = project
    return {
      ...rest,
      id: String(project.id),
      yearCompleted:
        yearCompleted === null || yearCompleted === undefined ? undefined : Number(yearCompleted), // Explicitly handle null and ensure number type
    }
  }) as ProjectWithId[]

  console.log(`Found ${allProjects.length} projects`)

  // Sort projects with featured first, then by year
  const orderedProjects = [...allProjects].sort((a, b) => {
    // Featured projects always come first
    if (a.featured && !b.featured) return -1
    if (!a.featured && b.featured) return 1

    // Then sort by year completed (desc)
    const yearA = a.yearCompleted || 0
    const yearB = b.yearCompleted || 0
    return yearB - yearA
  })

  // Count featured projects for logging
  const featuredCount = orderedProjects.filter((p) => p.featured).length
  console.log(`Featured: ${featuredCount}, Regular: ${orderedProjects.length - featuredCount}`)

  return (
    <div className="min-h-screen">
      <section className="py-12 md:py-16 lg:py-20 px-4">
        <div className="max-w-[1400px] mx-auto">
          {/* Intro text */}
          <div className="mb-16 md:mb-24">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight mb-8">
              Justin Johnson <br />
              <span className="text-xl md:text-2xl lg:text-3xl text-gray-500 mt-4 block">
                Creative Technologist & Sound Designer
              </span>
            </h1>
            <p className="text-lg max-w-2xl">
              Exploring the intersection of technology, sound, and interactive experiences.
            </p>
          </div>

          {/* Use the client-side ProjectGrid component for gap-free layout */}
          <div className="mb-16">
            <ProjectGrid projects={orderedProjects} />
          </div>

          {/* About brief section */}
          <div className="pt-8 pb-16 border-t border-gray-200" id="contact">
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl mb-6 pb-2 border-b border-gray-200">About</h2>
              <p className="text-lg mb-8">
                I'm a multidisciplinary artist and creative technologist with a focus on interactive
                experiences, sound design, and digital fabrication. My work explores the
                relationships between technology, sound, and human interaction.
              </p>
              <Link
                href="/about"
                className="text-lg border-b border-black pb-1 hover:border-gray-400 transition-colors"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
