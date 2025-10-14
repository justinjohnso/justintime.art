import type { Collection } from 'tinacms'

export const CategoriesCollection: Collection = {
  name: 'categories',
  label: 'Categories',
  path: 'src/content/categories',
  format: 'md',
  ui: {
    router: ({ document }) => {
      const slug = document._sys.filename.replace(/\.md$/, '')
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
      name: 'description',
      label: 'Description',
      ui: {
        component: 'textarea',
      },
    },
  ],
}
