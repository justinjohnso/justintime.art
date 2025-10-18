import React from 'react'
import type { Collection } from 'tinacms'
import { FieldSeparator } from '../components/FieldSeparator'

export const ProjectsCollection: Collection = {
  name: 'projects',
  label: 'Projects',
  path: 'src/content/projects',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      // Remove .mdx extension from filename for clean URLs
      const slug = document._sys.filename.replace(/\.mdx$/, '')
      return `/projects/${slug}`
    },
  },
  fields: [
    {
      type: 'string',
      name: '_metaSeparator',
      label: 'Project Info & Meta',
      ui: {
        component: FieldSeparator,
      },
    },
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      description: 'Project title. Also used for meta title and OpenGraph tags.',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      name: 'description',
      label: 'Description',
      description: 'Project description. Also used for meta description and OpenGraph tags.',
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'image',
      name: 'image',
      label: 'Featured Image',
      description: 'Main project image. Also used as OpenGraph image for social sharing.',
    },
    {
      type: 'string',
      name: 'mediaEmbed',
      label: 'Media Embed URL',
      description:
        'Full embed URL for Vimeo, YouTube, or SoundCloud (e.g., https://w.soundcloud.com/player/?url=...)',
    },
    {
      type: 'object',
      name: 'categories',
      label: 'Categories',
      description: 'Select categories for this project',
      list: true,
      ui: {
        itemProps: (item) => {
          // Extract a readable label from the category path
          if (item?.category) {
            // Convert "src/content/categories/web-development.mdx" to "web-development"
            const slug = item.category.split('/').pop()?.replace('.mdx', '') || ''
            // Convert kebab-case to Title Case for display
            const label = slug
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
            return { label: label || 'Select a category' }
          }
          return { label: 'Select a category' }
        },
      },
      fields: [
        {
          type: 'reference',
          name: 'category',
          label: 'Category',
          collections: ['categories'],
          required: false,
        },
      ],
    },
    {
      type: 'datetime',
      name: 'dateCompleted',
      label: 'Date Completed',
      ui: {
        dateFormat: 'YYYY-MM-DD',
      },
    },
    {
      type: 'number',
      name: 'yearCompleted',
      label: 'Year Completed',
    },
    {
      type: 'object',
      name: 'links',
      label: 'Project Links',
      list: true,
      fields: [
        {
          type: 'string',
          name: 'title',
          label: 'Link Title',
        },
        {
          type: 'string',
          name: 'url',
          label: 'URL',
        },
        {
          type: 'string',
          name: 'type',
          label: 'Link Type',
          options: ['github', 'live', 'demo', 'other'],
        },
      ],
    },
    {
      type: 'image',
      name: 'additionalImages',
      label: 'Additional Images',
      list: true,
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Content',
      isBody: true,
      templates: [
        {
          name: 'Banner',
          label: 'Banner',
          fields: [
            {
              type: 'string',
              name: 'heading',
              label: 'Heading',
            },
            {
              type: 'string',
              name: 'subheading',
              label: 'Subheading',
            },
          ],
        },
        {
          name: 'MediaBlock',
          label: 'Media Block',
          fields: [
            {
              type: 'image',
              name: 'media',
              label: 'Media',
            },
            {
              type: 'string',
              name: 'caption',
              label: 'Caption',
            },
          ],
        },
        {
          name: 'CodeBlock',
          label: 'Code Block',
          fields: [
            {
              type: 'string',
              name: 'language',
              label: 'Language',
            },
            {
              type: 'string',
              name: 'code',
              label: 'Code',
              ui: {
                component: 'textarea',
              },
            },
          ],
        },
      ],
    },
  ],
}
