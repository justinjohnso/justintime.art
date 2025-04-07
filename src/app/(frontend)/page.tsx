import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Project as BaseProject, Category } from '@/payload-types'

// Extend the Project type to include the missing fields
interface Project extends BaseProject {
  media?: {
    url: string
    alt?: string
  }
  // Updated category type to an array
  category: (number | (Category & { title: string }))[]
  metadata?: {
    year?: string
    description?: string
  }
  featured?: boolean
}

// Animation configurations
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

export default async function Home() {
  // Fetch projects from Payload CMS
  const payload = await getPayload({ config: configPromise })
  const projectsResponse = await payload.find({
    collection: 'projects',
    depth: 1,
    sort: '-featured',
    limit: 30, // Get more projects to ensure we have enough for each section
  })

  const allProjects = projectsResponse.docs as Project[]

  // Separate projects by category
  const featuredProjects = allProjects.filter((project) => project.featured)
  const personalProjects = allProjects.filter((project) => {
    if (project.category?.[0] && typeof project.category[0] !== 'number') {
      return (project.category[0] as Category & { title: string }).title === 'Personal'
    }
    return false
  })

  const clientProjects = allProjects.filter((project) => {
    if (project.category?.[0] && typeof project.category[0] !== 'number') {
      return (project.category[0] as Category & { title: string }).title === 'Client'
    }
    return false
  })

  return (
    <div className="min-h-screen">
      <section className="py-12 md:py-16 lg:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Intro text */}
          <motion.div initial="hidden" animate="visible" className="mb-24">
            <motion.h1
              className="text-3xl md:text-5xl lg:text-6xl font-light leading-tight mb-8"
              variants={fadeUp}
              custom={0}
            >
              Justin Johnson <br />
              <span className="text-xl md:text-2xl lg:text-3xl text-gray-500 mt-4 block">
                Creative Technologist & Sound Designer
              </span>
            </motion.h1>

            <motion.p className="text-lg max-w-2xl" variants={fadeUp} custom={1}>
              Exploring the intersection of technology, sound, and interactive experiences.
            </motion.p>
          </motion.div>

          {/* Featured Projects section (larger and more prominent) */}
          <motion.div className="mb-32" id="featured-work">
            <motion.h2
              className="text-xl md:text-2xl mb-12 pb-2 border-b border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Featured Work
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              {featuredProjects.slice(0, 4).map((project, index) => (
                <motion.div
                  key={project.id || index}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="overflow-hidden relative aspect-[4/3] mb-4">
                      <Image
                        src={
                          typeof project.image !== 'number' && project.image?.url
                            ? project.image.url
                            : '/placeholder.jpg'
                        }
                        alt={
                          typeof project.image !== 'number' && project.image?.alt
                            ? project.image.alt
                            : project.title
                        }
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-xl font-normal mb-1 group-hover:underline">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {project.category?.[0] && typeof project.category[0] !== 'number' && (
                        <span className="text-sm text-gray-600">
                          {(project.category[0] as Category & { title: string }).title}
                        </span>
                      )}
                      {project.metadata?.year && (
                        <span className="text-sm text-gray-400">• {project.metadata.year}</span>
                      )}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Personal Projects section */}
          <motion.div
            className="mb-32"
            id="personal-projects"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl md:text-2xl mb-12 pb-2 border-b border-gray-200">
              Personal Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {personalProjects.slice(0, 6).map((project, index) => (
                <motion.div
                  key={project.id || index}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.07 }}
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="overflow-hidden relative aspect-[3/2] mb-3">
                      <Image
                        src={
                          typeof project.image !== 'number' && project.image?.url
                            ? project.image.url
                            : '/placeholder.jpg'
                        }
                        alt={
                          typeof project.image !== 'number' && project.image?.alt
                            ? project.image.alt
                            : project.title
                        }
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-lg font-normal mb-1 group-hover:underline">
                      {project.title}
                    </h3>
                    {project.metadata?.year && (
                      <p className="text-sm text-gray-400">{project.metadata.year}</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Client Work section */}
          <motion.div
            className="mb-32"
            id="client-work"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-xl md:text-2xl mb-12 pb-2 border-b border-gray-200">Client Work</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {clientProjects.slice(0, 6).map((project, index) => (
                <motion.div
                  key={project.id || index}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.07 }}
                >
                  <Link href={`/projects/${project.slug}`} className="block">
                    <div className="overflow-hidden relative aspect-[3/2] mb-3">
                      <Image
                        src={
                          typeof project.image !== 'number' && project.image?.url
                            ? project.image.url
                            : '/placeholder.jpg'
                        }
                        alt={
                          typeof project.image !== 'number' && project.image?.alt
                            ? project.image.alt
                            : project.title
                        }
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-105"
                      />
                    </div>
                    <h3 className="text-lg font-normal mb-1 group-hover:underline">
                      {project.title}
                    </h3>
                    {project.metadata?.year && (
                      <p className="text-sm text-gray-400">{project.metadata.year}</p>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* About brief section */}
          <motion.div
            className="py-12 mb-16"
            id="contact"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
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
          </motion.div>
        </div>
      </section>
    </div>
  )
}
