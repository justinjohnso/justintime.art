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

  const categoryDisplayNames =
    project.categories
      ?.map((catItem: any) => {
        // Extract the category title directly from the reference
        const categoryTitle = catItem?.category?.title
        return categoryTitle || ''
      })
      .filter(Boolean) || []

  // Extract year from dateCompleted
  const yearCompleted = project.dateCompleted ? new Date(project.dateCompleted).getFullYear() : null

  // Helper function to get embed info
  const hasMediaEmbed = project.mediaEmbed && project.mediaEmbed.trim() !== ''

  // Process additional images
  const validImages =
    project.additionalImages
      ?.filter((item: any) => item && (typeof item === 'string' || item.image))
      .map((item: any) => (typeof item === 'string' ? item : item.image)) || []
  const n = validImages.length

  // Layout logic matching Astro component
  let row3Image: string | null = null
  let remainingImages: string[] = []

  if (hasMediaEmbed) {
    if (n >= 2) {
      row3Image = validImages[0] ?? null
      remainingImages = validImages.slice(1)
    }
  } else {
    if (n === 1) {
      row3Image = validImages[0] ?? null
    } else if (n >= 2) {
      row3Image = validImages[0] ?? null
      remainingImages = validImages.slice(1)
    }
  }

  // Chunk remaining images into rows of 3
  const chunkArray = <T,>(array: T[], chunkSize: number): T[][] => {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize))
    }
    return chunks
  }
  const rows = chunkArray(remainingImages, 3)

  return (
    <article className="p-4 md:p-6 lg:p-8 pb-12">
      {/* Hero Section */}
      {project.image && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2 items-start">
          {/* Hero Text */}
          <div className="md:col-span-1 relative flex flex-col md:min-h-[350px]">
            <div className="flex-1 flex flex-col pb-6 md:pr-6">
              <h1
                data-tina-field={tinaField(project, 'title')}
                className="text-2xl lg:text-3xl font-light text-black mb-2"
              >
                {project.title}
              </h1>

              {yearCompleted && (
                <p
                  data-tina-field={tinaField(project, 'dateCompleted')}
                  className="text-base text-gray-600 mb-1"
                >
                  {yearCompleted}
                </p>
              )}

              {categoryDisplayNames.length > 0 && (
                <p className="text-base text-gray-600 mb-3">{categoryDisplayNames.join(', ')}</p>
              )}

              {project.description && (
                <p
                  data-tina-field={tinaField(project, 'description')}
                  className="text-base text-gray-600 mb-3 whitespace-pre-line"
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
            className="md:col-span-1 block group relative overflow-hidden h-full min-h-[250px] md:min-h-[350px]"
          >
            <img
              src={project.image || ''}
              alt={project.title || ''}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            />
          </div>
        </section>
      )}

      {/* Row 2: Image with body text (when there are additional images) */}
      {row3Image && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2 items-stretch mb-2">
          <div className="block group p-0 m-0 relative h-full min-h-[350px]">
            <img
              src={row3Image}
              alt={`${project.title} secondary image`}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            />
          </div>
          <div
            data-tina-field={tinaField(project, 'body')}
            className="order-2 prose prose-base max-w-none text-gray-700 mt-1 mb-1 ml-2 -mr-4"
          >
            <TinaMarkdown content={project.body} components={tinaMarkdownComponents} />
          </div>
        </section>
      )}

      {/* Body content when no additional images */}
      {!row3Image && project.body && (
        <div
          data-tina-field={tinaField(project, 'body')}
          className="prose prose-base max-w-none text-gray-700 mt-4 mb-2"
        >
          <TinaMarkdown content={project.body} components={tinaMarkdownComponents} />
        </div>
      )}

      {/* Media Embed placeholder */}
      {hasMediaEmbed && (
        <section
          data-tina-field={tinaField(project, 'mediaEmbed')}
          className="mb-2 relative w-full min-h-[350px] bg-gray-100 flex items-center justify-center"
        >
          <p className="text-gray-600">Media Embed: {project.mediaEmbed}</p>
        </section>
      )}

      {/* Remaining Images (3 per row) */}
      {rows.map((row, rowIndex) => {
        const gridColsClass =
          row.length === 1 ? 'grid-cols-1' : row.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
        return (
          <section key={rowIndex} className="grid gap-2 mb-2">
            <div className={`grid ${gridColsClass} gap-2`}>
              {row.map((image, colIdx) => {
                const aspectClass =
                  row.length === 1
                    ? 'aspect-[16/9]'
                    : row.length === 2
                      ? 'aspect-[3/2]'
                      : 'aspect-[4/3]'
                return (
                  <div key={colIdx} className="block group p-0 m-0">
                    <div className={`relative ${aspectClass}`}>
                      <img
                        src={image}
                        alt={`${project.title} image`}
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </article>
  )
}
