import type { Collection } from 'tinacms'

export const PostsCollection: Collection = {
  name: 'posts',
  label: 'Posts',
  path: 'src/content/posts',
  format: 'mdx',
  ui: {
    router: ({ document }) => {
      const slug = document._sys.filename.replace(/\.mdx$/, '')
      return `/posts/${slug}`
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
    {
      type: 'image',
      name: 'heroImage',
      label: 'Hero Image',
    },
    {
      type: 'datetime',
      name: 'publishedAt',
      label: 'Published Date',
      ui: {
        dateFormat: 'YYYY-MM-DD',
      },
    },
    {
      type: 'string',
      name: 'categories',
      label: 'Categories',
      list: true,
    },
    {
      type: 'string',
      name: 'relatedPosts',
      label: 'Related Posts',
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
