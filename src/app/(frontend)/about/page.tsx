'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <div className="container mx-auto p-4 py-12 md:py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Image with playful animation */}
          <div className="relative">
            <motion.div
              className="rounded-lg overflow-hidden relative aspect-[4/5]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            >
              <Image
                src="/media/67ca9ad2afe5fd0603e6c667_PXL_20250307_013405714.PORTRAIT.jpg"
                alt="Justin Johnson portrait"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Decorative elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 border border-gray-300 rounded-full"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            />

            <motion.div
              className="absolute -bottom-6 -left-6 w-24 h-24 border border-gray-300"
              initial={{ scale: 0, opacity: 0, rotate: 45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            />
          </div>

          {/* Content area */}
          <div className="self-center">
            <motion.h1
              className="text-3xl md:text-4xl font-light mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              About Me
            </motion.h1>

            <div className="space-y-6">
              <motion.p
                className="text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                I&apos;m a multidisciplinary artist and creative technologist with a background in
                theatre and a passion for building interactive experiences.
              </motion.p>

              <motion.p
                className="text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                When I&apos;m not talking to computers, I spend my time building interactive
                auditory worlds, both through theatre and technology.
              </motion.p>

              <motion.p
                className="text-lg leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                My work explores the relationships between sound, space, and human interaction,
                often using technology to create immersive experiences that engage multiple senses.
              </motion.p>

              <motion.div
                className="pt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <h2 className="text-xl font-normal mb-4">Let&apos;s Connect</h2>
                <div className="flex gap-6">
                  <a
                    href="https://twitter.com/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg border-b border-black pb-1 hover:border-gray-400 transition-colors"
                  >
                    Twitter
                  </a>
                  <a
                    href="https://github.com/yourusername"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg border-b border-black pb-1 hover:border-gray-400 transition-colors"
                  >
                    GitHub
                  </a>
                  <a
                    href="mailto:hello@jjohnson.art"
                    className="text-lg border-b border-black pb-1 hover:border-gray-400 transition-colors"
                  >
                    Email
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Skills and interests section */}
        <motion.div
          className="mt-24 md:mt-32 max-w-4xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <h2 className="text-2xl md:text-3xl font-light mb-8 pb-2 border-b border-gray-200">
            What I Do
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-normal mb-3">Creative Technology</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Interactive Installations</li>
                <li>Physical Computing</li>
                <li>Spatial Computing</li>
                <li>Web & App Development</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-normal mb-3">Sound Design</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Theatrical Sound Design</li>
                <li>Immersive Audio</li>
                <li>Audio Programming</li>
                <li>3D Spatial Audio</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-normal mb-3">Fabrication</h3>
              <ul className="space-y-2 text-gray-600">
                <li>3D Printing</li>
                <li>Digital Fabrication</li>
                <li>Sculpture & Installation</li>
                <li>Circuit Design</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
