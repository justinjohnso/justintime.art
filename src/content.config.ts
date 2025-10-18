import { defineCollection, z } from 'astro:content'
import client from '../tina/__generated__/client'

// Projects collection using TinaCMS client
export const projects = defineCollection({
  loader: async () => {
    const projectsResponse = await client.queries.projectsConnection()

    return (
      projectsResponse.data.projectsConnection.edges
        ?.filter((project) => !!project)
        .map((project) => {
          const node = project?.node

          // Handle categories - they can be either simple strings or TinaCMS reference objects
          const categories = Array.isArray(node?.categories)
            ? node.categories
                .map((catItem: any) => {
                  // If it's already a string (simple format), use it directly
                  if (typeof catItem === 'string') {
                    return catItem
                  }

                  // If it's an object (TinaCMS reference format), extract the slug
                  if (catItem && typeof catItem === 'object') {
                    const categoryData = catItem.category

                    if (!categoryData) return null

                    // Try to get categorySlug field (best option)
                    if (
                      categoryData.categorySlug &&
                      typeof categoryData.categorySlug === 'string'
                    ) {
                      return categoryData.categorySlug
                    }

                    // Fallback: extract from _sys.relativePath
                    if (categoryData._sys?.relativePath) {
                      const match = categoryData._sys.relativePath.match(/([^/]+)\.mdx?$/)
                      if (match && match[1]) return match[1]
                    }
                  }

                  return null
                })
                .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0)
            : []

          return {
            ...node,
            id: node?._sys.relativePath.replace(/\.mdx?$/, ''),
            tinaInfo: node?._sys,
            categories,
          }
        }) || []
    )
  },
  schema: z.object({
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    mediaEmbed: z.string().optional(),
    categories: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    dateCompleted: z.string().optional(),
    yearCompleted: z.number().optional(),
    links: z
      .array(
        z.object({
          title: z.string().optional(),
          url: z.string().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
    additionalImages: z.array(z.string()).optional(),
    body: z.any().optional(),
  }),
})

// Categories collection using TinaCMS client
export const categories = defineCollection({
  loader: async () => {
    const categoriesResponse = await client.queries.categoriesConnection()

    return (
      categoriesResponse.data.categoriesConnection.edges
        ?.filter((category) => !!category)
        .map((category) => {
          const node = category?.node

          return {
            ...node,
            id: node?._sys.relativePath.replace(/\.mdx?$/, ''),
            tinaInfo: node?._sys,
          }
        }) || []
    )
  },
  schema: z.object({
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
    title: z.string(),
    categorySlug: z.string(),
    description: z.string().optional(),
  }),
})

// Posts collection using TinaCMS client
export const posts = defineCollection({
  loader: async () => {
    const postsResponse = await client.queries.postsConnection()

    return (
      postsResponse.data.postsConnection.edges
        ?.filter((post) => !!post)
        .map((post) => {
          const node = post?.node

          return {
            ...node,
            id: node?._sys.relativePath.replace(/\.mdx?$/, ''),
            tinaInfo: node?._sys,
          }
        }) || []
    )
  },
  schema: z.object({
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
    title: z.string(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    publishedAt: z.string().optional(),
    categories: z.array(z.string()).optional(),
    relatedPosts: z.array(z.string()).optional(),
    body: z.any().optional(),
  }),
})

// Pages collection using TinaCMS client
export const pages = defineCollection({
  loader: async () => {
    const pagesResponse = await client.queries.pagesConnection()

    return (
      pagesResponse.data.pagesConnection.edges
        ?.filter((page) => !!page)
        .map((page) => {
          const node = page?.node

          return {
            ...node,
            id: node?._sys.relativePath.replace(/\.mdx?$/, ''),
            tinaInfo: node?._sys,
          }
        }) || []
    )
  },
  schema: z.object({
    tinaInfo: z.object({
      filename: z.string(),
      basename: z.string(),
      path: z.string(),
      relativePath: z.string(),
    }),
    title: z.string(),
    description: z.string(),
    featuredProjects: z.array(z.string()).optional(),
    body: z.any().optional(),
  }),
})

export const collections = { projects, categories, posts, pages }
