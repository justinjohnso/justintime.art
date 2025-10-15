import type { Collection } from 'tinacms'
import matter from 'gray-matter'
import fs from 'fs'
import path from 'path'

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
      type: 'object',
      name: 'featuredProjects',
      label: 'Featured Projects',
      description: 'Drag to reorder featured projects for the homepage',
      list: true,
      ui: {
        itemProps: (item) => {
          // Read the project file to get its title using gray-matter
          if (item?.project) {
            try {
              const projectPath = path.join(process.cwd(), item.project)
              const fileContents = fs.readFileSync(projectPath, 'utf8')
              const { data } = matter(fileContents)
              return { label: data.title || 'Untitled Project' }
            } catch (error) {
              console.error(`Error reading project file: ${item.project}`, error)
              return { label: item.project.split('/').pop()?.replace('.mdx', '') || 'Select a project' }
            }
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
      type: 'rich-text',
      name: 'body',
      label: 'Page Content',
      isBody: true,
    },
  ],
}
