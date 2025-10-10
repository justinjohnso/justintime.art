import { defineCollection, z } from 'astro:content';

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    image: z.string().optional(),
    categories: z.array(z.string()).optional(),
    featured: z.boolean().optional(),
    dateCompleted: z.date().optional(),
    yearCompleted: z.number().optional(),
    links: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(['github', 'live', 'demo', 'other']).optional(),
    })).optional(),
    additionalImages: z.array(z.string()).optional(),
  }),
});

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    heroImage: z.string().optional(),
    publishedAt: z.date().optional(),
    categories: z.array(z.string()).optional(),
    relatedPosts: z.array(z.string()).optional(),
  }),
});

const categoriesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = {
  'projects': projectsCollection,
  'posts': postsCollection,
  'categories': categoriesCollection,
  'pages': pagesCollection,
};
