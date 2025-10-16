/* eslint-disable no-console */
const fs = require('fs')
const path = require('path')

// Read the JSON file
const jsonPath = path.join(__dirname, '../migration-backup/webflow-import.json')
const outputDir = path.join(__dirname, '../src/content/projects')
const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'))

// Helper function to convert HTML to Markdown
function htmlToMarkdown(html) {
  if (!html) return ''

  return (
    html
      // Remove empty id attributes
      .replace(/ id=""/g, '')
      // Convert <p> tags
      .replace(/<p[^>]*>/g, '\n')
      .replace(/<\/p>/g, '\n')
      // Convert <em> tags
      .replace(/<em[^>]*>/g, '*')
      .replace(/<\/em>/g, '*')
      // Convert <strong> tags
      .replace(/<strong[^>]*>/g, '**')
      .replace(/<\/strong>/g, '**')
      // Convert <br> tags
      .replace(/<br\s*\/?>/g, '\n')
      // Convert <a> tags
      .replace(/<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g, '[$2]($1)')
      // Remove remaining HTML tags
      .replace(/<[^>]+>/g, '')
      // Clean up excessive newlines
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  )
}

// Helper function to extract links from HTML
function extractLinks(linksHtml) {
  if (!linksHtml) return []

  const linkRegex = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g
  const links = []
  let match

  while ((match = linkRegex.exec(linksHtml)) !== null) {
    links.push({
      title: match[2],
      url: match[1],
      type: 'other',
    })
  }

  return links
}

// Process each project
jsonData.projects.forEach((project) => {
  const {
    title,
    slug,
    description,
    links,
    metadata,
    category,
    image,
    additionalImages,
    content,
    video,
  } = project

  // Build frontmatter
  const frontmatter = {
    title: title,
    description: description || '',
    yearCompleted: metadata?.year || new Date().getFullYear(),
    categories: category ? [category] : [],
    image: image ? `/media/${image.fileName}` : '',
    additionalImages: (additionalImages || []).map((img) => `/media/${img.fileName}`),
    links: extractLinks(links),
  }

  // Escape quotes in strings
  const escapeYaml = (str) => str.replace(/"/g, '\\"')

  // Build MDX content
  const mdxContent = `---
title: "${escapeYaml(frontmatter.title)}"
description: "${escapeYaml(frontmatter.description)}"
yearCompleted: ${frontmatter.yearCompleted}
categories:
${frontmatter.categories.map((cat) => `  - "${cat}"`).join('\n')}
image: "${frontmatter.image}"
${frontmatter.additionalImages.length > 0 ? `additionalImages:\n${frontmatter.additionalImages.map((img) => `  - "${img}"`).join('\n')}` : ''}
${frontmatter.links.length > 0 ? `links:\n${frontmatter.links.map((link) => `  - title: "${escapeYaml(link.title)}"\n    url: "${link.url}"\n    type: "${link.type}"`).join('\n')}` : ''}
---

${htmlToMarkdown(content)}
${video ? `\n\n[Watch video](${video})` : ''}
`.trim()

  // Write to file
  const filename = `${slug}.mdx`
  const filepath = path.join(outputDir, filename)

  fs.writeFileSync(filepath, mdxContent + '\n', 'utf8')
  console.log(`✓ Created ${filename}`)
})

console.log(`\n✅ Converted ${jsonData.projects.length} projects to MDX`)
