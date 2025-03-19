import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Project } from '@/payload-types'

interface NavigationProject {
  title: string
  slug: string
  image?: {
    url: string
    alt?: string
  }
}

interface ProjectNavigationProps {
  prevProject?: NavigationProject | null
  nextProject?: NavigationProject | null
}

const ProjectNavigation: React.FC<ProjectNavigationProps> = ({ prevProject, nextProject }) => {
  // If no navigation projects, don't render anything
  if (!prevProject && !nextProject) return null

  return (
    <div className="border-t border-gray-200 mt-16 pt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Previous Project */}
        {prevProject && (
          <Link
            href={`/work/${prevProject.slug}`}
            className="group relative overflow-hidden bg-gray-50 rounded-lg transition-all duration-500 hover:shadow-xl"
          >
            <div className="aspect-[16/9] relative overflow-hidden">
              {prevProject.image?.url ? (
                <Image
                  src={prevProject.image.url}
                  alt={prevProject.image.alt || prevProject.title}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200"></div>
              )}

              {/* Previous project overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:opacity-90 transition-opacity duration-500"></div>

              <div className="absolute bottom-0 left-0 p-6 text-white">
                <span className="text-sm uppercase tracking-wider mb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous Project
                </span>
                <h3 className="text-xl md:text-2xl font-light group-hover:translate-x-1 transition-transform duration-300">
                  {prevProject.title}
                </h3>
              </div>
            </div>
          </Link>
        )}

        {/* Next Project */}
        {nextProject && (
          <Link
            href={`/work/${nextProject.slug}`}
            className="group relative overflow-hidden bg-gray-50 rounded-lg transition-all duration-500 hover:shadow-xl"
          >
            <div className="aspect-[16/9] relative overflow-hidden">
              {nextProject.image?.url ? (
                <Image
                  src={nextProject.image.url}
                  alt={nextProject.image.alt || nextProject.title}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 transition-all duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gray-200"></div>
              )}

              {/* Next project overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:opacity-90 transition-opacity duration-500"></div>

              <div className="absolute bottom-0 right-0 p-6 text-white text-right">
                <span className="text-sm uppercase tracking-wider mb-2 flex items-center justify-end">
                  Next Project
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <h3 className="text-xl md:text-2xl font-light group-hover:translate-x-1 transition-transform duration-300">
                  {nextProject.title}
                </h3>
              </div>
            </div>
          </Link>
        )}
      </div>
    </div>
  )
}

export default ProjectNavigation
