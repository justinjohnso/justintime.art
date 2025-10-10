import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false, // We'll handle base styles ourselves
    }),
    react(), // For interactive components
    mdx(), // For MDX content support
  ],
  output: 'static',
  site: 'https://jjohnson.art', // Update with your actual domain
  build: {
    assets: 'assets'
  },
  vite: {
    define: {
      __DATE__: `'${new Date().toISOString()}'`,
    },
  },
});
