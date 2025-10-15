import type { Collection } from 'tinacms'

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
  },
  fields: [
    {
      type: 'string',
      name: 'title',
      label: 'Title',
      isTitle: true,
      required: true,
    },
    {
      type: 'string',
      name: 'description',
      label: 'Description',
      required: true,
      ui: {
        component: 'textarea',
      },
    },
    {
      type: 'reference',
      name: 'featuredProjects',
      label: 'Featured Projects',
      description: 'Drag to reorder featured projects for the homepage',
      collections: ['projects'],
      list: true,
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Page Content',
      isBody: true,
    },
  ],
}
