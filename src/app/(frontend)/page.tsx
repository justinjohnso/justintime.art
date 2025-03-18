'use client'
import { MotionWrapper } from '@/components/MotionWrapper'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
// Temporary data until we implement Payload CMS
const featuredProjects = [
  {
    title: 'The Tempest arcade controller',
    category: 'Fabrication',
    image: '/image-post1.webp',
    href: '/work/the-tempest-arcade-controller',
  },
  {
    title: 'Look/Listen',
    category: 'Sound Design & Theatre',
    image: '/image-post2.webp',
    href: '/work/look-listen',
  },
  {
    title: 'Finding Home',
    category: 'Sound Design & Installation',
    image: '/image-post3.webp',
    href: '/work/finding-home',
  },
]
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero section with background pattern */}
      <section className="h-[90vh] flex items-center justify-center px-4 relative grid-background">
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-transparent to-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative">
          <MotionWrapper>
            <h1 className="text-4xl md:text-7xl font-light leading-tight mb-4">
              Creative Technologist
              <br />& Sound Designer
            </h1>
          </MotionWrapper>

          <MotionWrapper delay={0.2}>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Exploring the intersection of technology, sound, and interactive experiences
            </p>
          </MotionWrapper>

          <MotionWrapper delay={0.4}>
            <Link
              href="/work"
              className="inline-block mt-8 px-8 py-3 border border-black hover:bg-black hover:text-white transition-colors"
            >
              View Projects
            </Link>
          </MotionWrapper>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute right-[10%] top-[20%] w-16 h-16 rounded-full border border-black/20"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        />

        <motion.div
          className="absolute left-[15%] bottom-[25%] w-24 h-24 border border-black/20"
          initial={{ scale: 0, opacity: 0, rotate: 45 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 1 }}
        />
      </section>
      {/* Featured work grid */}
      <section className="max-w-7xl mx-auto px-4 py-24">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-3xl font-light mb-16 relative inline-block"
            variants={staggerItem}
          >
            Featured Work
            <span className="absolute -bottom-2 left-0 w-full h-px bg-black/30"></span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {featuredProjects.map((project, index) => (
              <motion.div
                key={index}
                className={`project-card ${index === 0 ? 'md:col-span-8' : 'md:col-span-6'}`}
                variants={staggerItem}
              >
                <Link href={project.href} className="group block">
                  <div className="overflow-hidden rounded-md relative aspect-[4/3]">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                      <span className="text-white text-sm uppercase tracking-wider">
                        View Project
                      </span>
                    </div>
                  </div>
                  <h3 className="text-xl font-normal mt-4 mb-1">{project.title}</h3>
                  <p className="text-gray-600 text-sm">{project.category}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <motion.div className="mt-16 text-center" variants={staggerItem}>
            <Link href="/work" className="interactive-link inline-block px-8 py-3 text-lg">
              View All Work
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* About brief section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <MotionWrapper>
            <h2 className="text-3xl font-light mb-8">About Me</h2>
            <p className="text-lg mb-8">
              I&apos;m a multidisciplinary artist and creative technologist with a focus on
              interactive experiences, sound design, and digital fabrication. My work explores the
              relationships between technology, sound, and human interaction.
            </p>
            <Link href="/about" className="interactive-link inline-block text-lg">
              Read More
            </Link>
          </MotionWrapper>
        </div>
      </section>
    </div>
  )
}
