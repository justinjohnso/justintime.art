import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { extractCategorySlug } from '../src/utils/categoryUtils'

const PROJECTS_DIR = path.join(process.cwd(), 'src', 'content', 'projects')
const CATEGORIES_DIR = path.join(process.cwd(), 'src', 'content', 'categories')

interface FrontmatterLink {
  title?: string
  url?: string
  type?: string
}

interface OneSheetLink {
  title: string
  url: string
  type?: string
}

interface OneSheetCategory {
  slug: string
  title: string
}

export interface OneSheetProjectData {
  slug: string
  title: string
  date?: string
  year?: string
  location?: string
  mediumTypeLabel?: string
  duration?: string
  image?: string
  categorySlugs: string[]
  categories: OneSheetCategory[]
  links: OneSheetLink[]
  narrative?: string
  reflection?: string
}

function toTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeDateAndYear(
  dateCompleted: unknown,
  yearCompleted: unknown,
): { date?: string; year?: string } {
  let date: string | undefined
  let year: string | undefined

  if (dateCompleted instanceof Date && !isNaN(dateCompleted.getTime())) {
    date = dateCompleted.toISOString().split('T')[0]
    year = String(dateCompleted.getUTCFullYear())
  } else if (typeof dateCompleted === 'string') {
    const trimmed = dateCompleted.trim()
    if (/^\d{4}$/.test(trimmed)) {
      year = trimmed
      date = `${trimmed}-01-01`
    } else {
      const parsed = new Date(trimmed)
      if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split('T')[0]
        year = String(parsed.getUTCFullYear())
      }
    }
  }

  if (!year && typeof yearCompleted === 'number' && Number.isFinite(yearCompleted)) {
    year = String(Math.trunc(yearCompleted))
  }

  return { date, year }
}

function normalizeParagraph(paragraph: string): string {
  return paragraph
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`~#>-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractBodyParagraphs(body: string): string[] {
  return body
    .split(/\n\s*\n+/)
    .map(normalizeParagraph)
    .filter((paragraph) => paragraph.length > 0)
}

function deriveNarrativeAndReflection(
  body: string,
  narrativeOverride?: string,
  reflectionOverride?: string,
): { narrative?: string; reflection?: string } {
  const paragraphs = extractBodyParagraphs(body)
  const narrativeFromBody = paragraphs.slice(0, 2).join('\n\n') || undefined
  const reflectionFromBody =
    paragraphs.length > 2 ? paragraphs[paragraphs.length - 1] : undefined

  return {
    narrative: narrativeOverride || narrativeFromBody,
    reflection: reflectionOverride || reflectionFromBody,
  }
}

async function loadCategoryTitleMap(): Promise<Map<string, string>> {
  const files = await fs.readdir(CATEGORIES_DIR)
  const mdxFiles = files.filter((file) => file.endsWith('.mdx'))
  const categoryTitleMap = new Map<string, string>()

  for (const file of mdxFiles) {
    const slug = file.replace(/\.mdx$/, '')
    const fullPath = path.join(CATEGORIES_DIR, file)
    const raw = await fs.readFile(fullPath, 'utf-8')
    const { data } = matter(raw)
    const title = toTrimmedString(data.title) || slug
    categoryTitleMap.set(slug, title)
  }

  return categoryTitleMap
}

function parseCategorySlugs(frontmatterData: Record<string, unknown>): string[] {
  const candidates = Array.isArray(frontmatterData.categories)
    ? frontmatterData.categories
    : Array.isArray(frontmatterData.category)
      ? frontmatterData.category
      : []

  const categorySlugs: string[] = []
  for (const category of candidates) {
    const slug = extractCategorySlug(category)
    if (slug) categorySlugs.push(slug)
  }

  return categorySlugs
}

function parseLinks(frontmatterData: Record<string, unknown>): OneSheetLink[] {
  if (!Array.isArray(frontmatterData.links)) return []

  const links: OneSheetLink[] = []
  for (const rawLink of frontmatterData.links as FrontmatterLink[]) {
    const url = toTrimmedString(rawLink?.url)
    if (!url) continue

    links.push({
      title: toTrimmedString(rawLink?.title) || url,
      url,
      type: toTrimmedString(rawLink?.type),
    })
  }

  return links
}

function parseProjectContent(
  slug: string,
  fileContent: string,
  categoryTitleMap: Map<string, string>,
): OneSheetProjectData {
  const parsed = matter(fileContent)
  const frontmatterData = parsed.data as Record<string, unknown>
  const categorySlugs = parseCategorySlugs(frontmatterData)
  const categories = categorySlugs.map((categorySlug) => ({
    slug: categorySlug,
    title: categoryTitleMap.get(categorySlug) || categorySlug,
  }))
  const links = parseLinks(frontmatterData)
  const { date, year } = normalizeDateAndYear(
    frontmatterData.dateCompleted,
    frontmatterData.yearCompleted,
  )

  const narrativeOverride = toTrimmedString(frontmatterData.oneSheetNarrativeOverride)
  const reflectionOverride = toTrimmedString(frontmatterData.oneSheetReflectionOverride)
  const { narrative, reflection } = deriveNarrativeAndReflection(
    parsed.content.trim(),
    narrativeOverride,
    reflectionOverride,
  )

  return {
    slug,
    title: toTrimmedString(frontmatterData.title) || slug,
    date,
    year,
    location: toTrimmedString(frontmatterData.location),
    mediumTypeLabel: toTrimmedString(frontmatterData.mediumTypeLabel),
    duration: toTrimmedString(frontmatterData.duration),
    image: toTrimmedString(frontmatterData.image),
    categorySlugs,
    categories,
    links,
    narrative,
    reflection,
  }
}

export async function listProjectSlugs(): Promise<string[]> {
  const files = await fs.readdir(PROJECTS_DIR)
  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''))
    .sort((a, b) => a.localeCompare(b))
}

export async function loadOneSheetProjectData(slug: string): Promise<OneSheetProjectData> {
  const categoryTitleMap = await loadCategoryTitleMap()
  const projectPath = path.join(PROJECTS_DIR, `${slug}.mdx`)
  const fileContent = await fs.readFile(projectPath, 'utf-8')
  return parseProjectContent(slug, fileContent, categoryTitleMap)
}

export async function loadAllOneSheetProjectData(): Promise<OneSheetProjectData[]> {
  const categoryTitleMap = await loadCategoryTitleMap()
  const slugs = await listProjectSlugs()
  const projects: OneSheetProjectData[] = []

  for (const slug of slugs) {
    const projectPath = path.join(PROJECTS_DIR, `${slug}.mdx`)
    const fileContent = await fs.readFile(projectPath, 'utf-8')
    projects.push(parseProjectContent(slug, fileContent, categoryTitleMap))
  }

  return projects
}
