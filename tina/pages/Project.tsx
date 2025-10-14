import React from 'react'
import { tinaField, useTina } from 'tinacms/dist/react'
import type { ProjectsQuery, ProjectsQueryVariables } from '../__generated__/types'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import { tinaMarkdownComponents } from '../components/TinaMarkdownComponents'

type Props = {
  variables: ProjectsQueryVariables
  data: ProjectsQuery
  query: string
}

export default function Project(props: Props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const project = data.projects

  // Helper function to get embed info (placeholder - actual logic in Astro component)
  const hasMediaEmbed = project.mediaEmbed && project.mediaEmbed.trim() !== ''

  return (
    <article className="p-4 md:p-6 lg:p-8 pb-12">
      {/* Hero Section */}
      {project.image && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 items-start">
          {/* Hero Text */}
          <div className="md:col-span-1 relative flex flex-col min-h-[350px]">
            <div className="flex-1 flex flex-col">
              <h1
                data-tina-field={tinaField(project, 'title')}
                className="text-2xl md:text-3xl lg:text-4xl font-medium text-black mb-2"
              >
                {project.title}
              </h1>

              {project.yearCompleted && (
                <p
                  data-tina-field={tinaField(project, 'yearCompleted')}
                  className="text-base text-gray-600 mb-1"
                >
                  {project.yearCompleted}
                </p>
              )}

              {project.categories && project.categories.length > 0 && (
                <p
                  data-tina-field={tinaField(project, 'categories')}
                  className="text-base text-gray-600 mb-3"
                >
                  {project.categories.join(', ')}
                </p>
              )}

              {project.description && (
                <p
                  data-tina-field={tinaField(project, 'description')}
                  className="text-base text-gray-600 mb-3"
                >
                  {project.description}
                </p>
              )}

              {project.links && project.links.length > 0 && (
                <div data-tina-field={tinaField(project, 'links')} className="flex flex-wrap gap-3">
                  {project.links.map((link, index) => (
                    <a
                      key={index}
                      href={link?.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-black transition-colors text-sm"
                    >
                      {link?.title}
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        ></path>
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hero Image */}
          <div
            data-tina-field={tinaField(project, 'image')}
            className="md:col-span-1 block group relative overflow-hidden h-full min-h-[350px]"
          >
            <img
              src={project.image || ''}
              alt={project.title || ''}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            />
          </div>
        </section>
      )}

      {/* Body content - using TinaMarkdown for rich text */}
      {project.body && (
        <div
          data-tina-field={tinaField(project, 'body')}
          className="prose prose-base max-w-none text-gray-700 mt-4"
        >
          <TinaMarkdown content={project.body} components={tinaMarkdownComponents} />
        </div>
      )}

      {/* Media Embed field indicator */}
      {hasMediaEmbed && (
        <div
          data-tina-field={tinaField(project, 'mediaEmbed')}
          className="mt-4 p-4 border border-gray-300 rounded"
        >
          <p className="text-sm text-gray-600">Media Embed: {project.mediaEmbed}</p>
        </div>
      )}

      {/* Additional Images */}
      {project.additionalImages && project.additionalImages.length > 0 && (
        <div
          data-tina-field={tinaField(project, 'additionalImages')}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-4"
        >
          {project.additionalImages.map((image, index) => (
            <img
              key={index}
              src={image || ''}
              alt={`${project.title} image ${index + 1}`}
              className="w-full h-auto object-cover rounded"
            />
          ))}
        </div>
      )}
    </article>
  )
}
