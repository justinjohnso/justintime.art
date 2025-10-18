import React from 'react'
import type { Collection } from 'tinacms'
import { FieldSeparator } from '../components/FieldSeparator'

export const PagesCollection: Collection = {
  name: 'pages',
  label: 'Pages',
  path: 'src/content/pages',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      const slug = document._sys.filename.replace(/\.mdx$/, '')
      // Map home.mdx to the root path
      if (slug === 'home') {
        return '/'
      }
      return `/${slug}`
    },
    filename: {
      readonly: true,
    },
  },
  fields: [
    {
      type: 'rich-text',
      name: 'body',
      label: 'Page Content',
      isBody: true,
    },
    {
      type: 'object',
      name: 'featuredProjects',
      label: 'Featured Projects',
      description: 'Drag to reorder featured projects for the homepage',
      list: true,
      ui: {
        itemProps: (item) => {
          // Extract a readable label from the project path
          if (item?.project) {
            // Convert "src/content/projects/look-listen.mdx" to "look-listen"
            const slug = item.project.split('/').pop()?.replace('.mdx', '') || ''
            // Convert kebab-case to Title Case for display
            const label = slug
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
            return { label: label || 'Select a project' }
          }
          return { label: 'Select a project' }
        },
      },
      fields: [
        {
          type: 'reference',
          name: 'project',
          label: 'Project',
          collections: ['projects'],
          required: true,
        },
      ],
    },
    {
      type: 'string',
      name: '_metaSeparator',
      label: 'Meta Tags',
      ui: {
        component: FieldSeparator,
      },
    },
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'Used for page title and meta tags only. Does not appear in page content.',
      isTitle: true,
      required: true,
      ui: {
        component: 'text',
      },
    },
    {
      type: 'string',
      name: 'description',
      label: 'Description',
      description: 'Used for meta description tag only. Does not appear in page content.',
      required: true,
      ui: {
        component: 'textarea',
      },
    },
  ],
}
