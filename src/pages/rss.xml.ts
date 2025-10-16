---
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = await getCollection('posts');

  // Sort by date, newest first
  const sortedPosts = posts.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'Justin Johnson - Blog',
    description: 'Weekly updates on interactive technology, sound design, and physical computing from NYU ITP',
    site: context.site || 'https://jjohnson.art',
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      description: post.data.description || '',
      pubDate: new Date(post.data.date),
      link: `/blog/${post.id.replace(/\.mdx$/, '')}/`,
      categories: post.data.categories || [],
    })),
    customData: `<language>en-us</language>`,
  });
}
