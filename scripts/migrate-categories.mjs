import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectsDir = path.join(__dirname, '../src/content/projects')

// Read all MDX files in the projects directory
const files = fs.readdirSync(projectsDir).filter((file) => file.endsWith('.mdx'))

console.log(`Found ${files.length} project files to migrate`)

files.forEach((file) => {
  const filePath = path.join(projectsDir, file)
  let content = fs.readFileSync(filePath, 'utf-8')

  // Match the frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  if (!frontmatterMatch) {
    console.log(`⚠️  Skipping ${file} - no frontmatter found`)
    return
  }

  const frontmatter = frontmatterMatch[1]

  // Check if categories exist and are in the old format (simple strings)
  const categoriesMatch = frontmatter.match(/categories:\n((?:  - ".*"\n)+)/)

  if (categoriesMatch) {
    const categoriesSection = categoriesMatch[0]
    const categoryLines = categoriesMatch[1].trim().split('\n')

    // Extract category slugs
    const categories = categoryLines
      .map((line) => {
        const match = line.match(/- "(.*)"/)
        return match ? match[1] : null
      })
      .filter(Boolean)

    // Convert to new format
    const newCategoriesSection =
      'categories:\n' +
      categories.map((cat) => `  - category: src/content/categories/${cat}.mdx`).join('\n') +
      '\n'

    // Replace in content
    const newContent = content.replace(categoriesSection, newCategoriesSection)

    // Write back
    fs.writeFileSync(filePath, newContent, 'utf-8')
    console.log(`✅ Migrated ${file} - converted ${categories.length} categories`)
  } else {
    console.log(`ℹ️  ${file} - no categories or already migrated`)
  }
})

console.log('\n✨ Migration complete!')
