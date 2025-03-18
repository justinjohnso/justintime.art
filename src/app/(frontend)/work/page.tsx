'use client'
import { MotionWrapper } from '../../../components/MotionWrapper'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
// Temporary data structure until we implement Payload CMS
const categories = [
  'All',
  'Sound Design',
  'Web Development',
  'Installations',
  'Fabrication',
  'Theatre',
  'Music',
]
const projects = [
  {
    title: 'The Tempest arcade controller',
    categories: ['Fabrication'],
    image: '/image-post1.webp',
    year: '2025',
    featured: true,
    slug: 'the-tempest-arcade-controller',
  },
  {
    title: 'Look/Listen',
    categories: ['Sound Design', 'Theatre'],
    image: '/image-post2.webp',
    year: '2015',
    featured: true,
    slug: 'look-listen',
  },
  {
    title: 'Finding Home',
    categories: ['Sound Design', 'Installations'],
    image: '/image-post3.webp',
    year: '2015',
    featured: true,
    slug: 'finding-home',
  },
  // More projects will be added when we implement the CMS
]
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
export default function WorkPage() {
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
                {categories.map((category) => (
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

          {/* Projects grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {projects.map((project, index) => (
              <motion.div key={index} variants={item} className="group">
                <Link href={`/work/${project.slug}`} className="block">
                  <div className="overflow-hidden rounded-lg relative aspect-[4/3] mb-4">
                    <Image src={project.image} alt={project.title} fill className="object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {project.categories.map((category) => (
                      <span key={category} className="text-xs text-gray-600">
                        {category}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{project.year}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
