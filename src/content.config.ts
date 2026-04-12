import { defineCollection, z } from 'astro:content'

// Projects collection - loads from MDX files in src/content/projects/
export const projects = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    mediaEmbed: z.string().optional(),
    mediaEmbedLabel: z.string().optional(),
    mediaEmbeds: z
      .array(
        z.object({
          url: z.string().optional(),
          label: z.string().optional(),
        }),
      )
      .optional(),
    category: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    dateCompleted: z.string().optional(),
    yearCompleted: z.number().optional(),
    location: z.string().optional(),
    mediumTypeLabel: z.string().optional(),
    duration: z.string().optional(),
    oneSheetNarrativeOverride: z.string().optional(),
    oneSheetReflectionOverride: z.string().optional(),
    links: z
      .array(
        z.object({
          title: z.string().optional(),
          url: z.string().optional(),
          type: z.string().optional(),
        }),
      )
      .optional(),
    additionalImages: z.array(z.object({ image: z.string().optional() })).optional(),
  }),
})

// Categories collection - loads from MDX files in src/content/categories/
export const categories = defineCollection({
  schema: z.object({
    title: z.string(),
    categorySlug: z.string(),
    description: z.string().optional(),
  }),
})

// Posts collection - loads from MDX files in src/content/posts/
export const posts = defineCollection({
  schema: z.object({
    title: z.string(),
    date: z.string(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    categories: z.array(z.string()).optional(),
    relatedPosts: z.array(z.string()).optional(),
  }),
})

// Pages collection - loads from MDX files in src/content/pages/
export const pages = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    featuredProjects: z.array(z.string()).optional(),
  }),
})

export const collections = { projects, categories, posts, pages }
