import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tinaDirective from './astro-tina-directive/register.js'

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind({
      applyBaseStyles: false, // We'll handle base styles ourselves
    }),
    react(), // For interactive components
    mdx(), // For MDX content support
    sitemap(), // Generate sitemap.xml
    tinaDirective(), // TinaCMS visual editor directive
  ],
  output: 'static',
  site: 'https://jjohnson.art', // Update with your actual domain
  build: {
    assets: 'assets',
  },
  vite: {
    define: {
      __DATE__: `'${new Date().toISOString()}'`,
    },
  },
})
