import type { Collection } from 'tinacms'

export const CategoriesCollection: Collection = {
  name: 'categories',
  label: 'Categories',
  path: 'src/content/categories',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      const slug = document._sys.filename.replace(/\.mdx?$/, '')
      return `/categories/${slug}`
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
      name: 'categorySlug',
      label: 'Category Slug',
      description: 'URL-friendly identifier (e.g., web-development, sound-design)',
      required: true,
    },
    {
      type: 'string',
      name: 'description',
      label: 'Description',
      ui: {
        component: 'textarea',
      },
    },
  ],
}
