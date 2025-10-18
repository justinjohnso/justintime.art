import type { Collection } from 'tinacms'

export const CategoriesCollection: Collection = {
  name: 'categories',
  label: 'Categories',
  path: 'src/content/categories',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      // Get the categorySlug from the document data
      const categorySlug =
        (document as any).categorySlug || document._sys.filename.replace(/\.mdx?$/, '')
      return `/projects/category/${categorySlug}`
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
