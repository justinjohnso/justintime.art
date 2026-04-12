import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts')).sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
  );

  return rss({
    title: 'Justin Johnson Blog',
    description:
      'Blog posts about interactive technology, sound design, and physical computing by Justin Johnson',
    site: context.site,
    items: posts
      .map((post) => {
        const slug = post.id.replace(/\.mdx$/, '');
        const pubDate = new Date(post.data.date);

        if (Number.isNaN(pubDate.getTime())) {
          return null;
        }

        return {
          title: post.data.title,
          pubDate,
          description: post.data.description ?? post.data.title,
          link: `/blog/${slug}`,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null),
  });
}
