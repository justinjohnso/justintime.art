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
      type: 'string',
      name: 'featuredProjects',
      label: 'Featured Projects',
      description: 'Select projects to feature on the homepage (only visible on home page)',
      list: true,
      ui: {
        component: 'list',
      },
    },
    {
      type: 'rich-text',
      name: 'body',
      label: 'Page Content',
      isBody: true,
    },
  ],
}
