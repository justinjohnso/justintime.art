import type {
  ResumeBasics,
  ResumeConfiguration,
  ResumeEducation,
  ResumeRole,
  ResumeSkill,
  ResumeVariant,
} from '../../types/resume'

interface NotionSelectOption {
  name?: string
}

interface NotionDateValue {
  start?: string | null
  end?: string | null
}

interface NotionRichTextValue {
  plain_text?: string
  href?: string | null
}

type NotionProperty =
  | { type: 'title'; title?: NotionRichTextValue[] }
  | { type: 'rich_text'; rich_text?: NotionRichTextValue[] }
  | { type: 'select'; select?: NotionSelectOption | null }
  | { type: 'multi_select'; multi_select?: NotionSelectOption[] }
  | { type: 'date'; date?: NotionDateValue | null }
  | { type: 'url'; url?: string | null }
  | { type: 'email'; email?: string | null }
  | { type: 'phone_number'; phone_number?: string | null }
  | { type: 'checkbox'; checkbox?: boolean }
  | { type: 'number'; number?: number | null }
  | { type: string; [key: string]: unknown }

export interface NotionResumePage {
  id: string
  properties: Record<string, NotionProperty>
}

export interface TransformNotionResumeInput {
  variant: ResumeVariant
  label: string
  summary: string
  rolePages: NotionResumePage[]
  educationPages: NotionResumePage[]
  skillPages: NotionResumePage[]
  basicsPage?: NotionResumePage | null
}

const VARIANT_FIELD_NAMES = ['Variant', 'Variants', 'Resume Variant', 'Resume Variants']

function getProperty(page: NotionResumePage, fieldNames: string[]): NotionProperty | undefined {
  for (const fieldName of fieldNames) {
    const property = page.properties[fieldName]
    if (property) return property
  }
  return undefined
}

function extractPlainText(value?: NotionProperty): string {
  if (!value) return ''

  if (value.type === 'title') {
    return (value.title || []).map((part) => part.plain_text || '').join('').trim()
  }

  if (value.type === 'rich_text') {
    return (value.rich_text || []).map((part) => part.plain_text || '').join('').trim()
  }

  if (value.type === 'select') {
    return value.select?.name?.trim() || ''
  }

  if (value.type === 'url') {
    return value.url?.trim() || ''
  }

  if (value.type === 'email') {
    return value.email?.trim() || ''
  }

  if (value.type === 'phone_number') {
    return value.phone_number?.trim() || ''
  }

  if (value.type === 'number') {
    return value.number === undefined || value.number === null ? '' : String(value.number)
  }

  return ''
}

function extractTextLines(value?: NotionProperty): string[] {
  const text = extractPlainText(value)
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function extractDate(property?: NotionProperty): { startDate?: string; endDate?: string } {
  if (!property || property.type !== 'date' || !property.date) {
    return {}
  }

  return {
    startDate: property.date.start || undefined,
    endDate: property.date.end || undefined,
  }
}

function extractMultiSelect(property?: NotionProperty): string[] {
  if (!property || property.type !== 'multi_select') return []
  return (property.multi_select || []).map((item) => item.name || '').filter(Boolean)
}

function matchesVariant(page: NotionResumePage, variant: ResumeVariant): boolean {
  const variantProperty = getProperty(page, VARIANT_FIELD_NAMES)
  if (!variantProperty) {
    return true
  }

  if (variantProperty.type === 'select') {
    const selected = variantProperty.select?.name?.toLowerCase().trim()
    return !selected || selected === variant
  }

  if (variantProperty.type === 'multi_select') {
    const values = (variantProperty.multi_select || [])
      .map((option) => option.name?.toLowerCase().trim())
      .filter(Boolean)

    if (values.length === 0) return true
    return values.includes(variant)
  }

  const textValue = extractPlainText(variantProperty).toLowerCase()
  if (!textValue) return true

  return textValue
    .split(/[,\n/|]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .includes(variant)
}

export function transformNotionRole(page: NotionResumePage): ResumeRole {
  const title = extractPlainText(getProperty(page, ['Position', 'Role', 'Title', 'Name'])) || 'Untitled Role'
  const company = extractPlainText(
    getProperty(page, ['Company', 'Organization', 'Employer', 'Production']),
  ) || 'Unknown Organization'
  const location = extractPlainText(getProperty(page, ['Location']))
  const dateRange = extractDate(getProperty(page, ['Dates', 'Date Range', 'Date']))
  const startDate = dateRange.startDate || extractPlainText(getProperty(page, ['Start Date', 'Start']))
  const endDate = dateRange.endDate || extractPlainText(getProperty(page, ['End Date', 'End']))
  const description = extractPlainText(getProperty(page, ['Description', 'Summary']))

  const highlightsFromList = extractMultiSelect(getProperty(page, ['Highlights', 'Bullet Points']))
  const highlightsFromText = extractTextLines(getProperty(page, ['Highlights', 'Bullet Points', 'Details']))
  const highlights = highlightsFromList.length > 0 ? highlightsFromList : highlightsFromText

  return {
    position: title,
    company,
    location: location || undefined,
    startDate: startDate || '',
    endDate: endDate || undefined,
    description: description || undefined,
    highlights,
  }
}

export function transformNotionEducation(page: NotionResumePage): ResumeEducation {
  const institution = extractPlainText(
    getProperty(page, ['Institution', 'School', 'Organization', 'Name']),
  ) || 'Unknown Institution'
  const degree = extractPlainText(getProperty(page, ['Degree', 'Study Type']))
  const field = extractPlainText(getProperty(page, ['Field', 'Area', 'Major']))
  const dateRange = extractDate(getProperty(page, ['Dates', 'Date Range', 'Date']))
  const startDate = dateRange.startDate || extractPlainText(getProperty(page, ['Start Date', 'Start']))
  const endDate = dateRange.endDate || extractPlainText(getProperty(page, ['End Date', 'End']))
  const notes = extractPlainText(getProperty(page, ['Notes', 'Description']))

  return {
    institution,
    degree: degree || undefined,
    field: field || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    notes: notes || undefined,
  }
}

export function transformNotionSkill(page: NotionResumePage): ResumeSkill {
  const name = extractPlainText(getProperty(page, ['Name', 'Skill', 'Category'])) || 'General'
  const level = extractPlainText(getProperty(page, ['Level']))
  const keywordsFromMulti = extractMultiSelect(getProperty(page, ['Keywords', 'Items']))
  const keywordsFromText = extractTextLines(getProperty(page, ['Keywords', 'Items', 'Description']))
  const keywords = keywordsFromMulti.length > 0 ? keywordsFromMulti : keywordsFromText

  return {
    name,
    level: level || undefined,
    keywords,
  }
}

export function transformNotionBasics(page: NotionResumePage): ResumeBasics {
  const name = extractPlainText(getProperty(page, ['Name', 'Full Name'])) || ''
  const label = extractPlainText(getProperty(page, ['Label', 'Headline', 'Title']))
  const email = extractPlainText(getProperty(page, ['Email']))
  const phone = extractPlainText(getProperty(page, ['Phone', 'Phone Number']))
  const url = extractPlainText(getProperty(page, ['URL', 'Website']))
  const summary = extractPlainText(getProperty(page, ['Summary', 'About']))
  const city = extractPlainText(getProperty(page, ['City']))
  const region = extractPlainText(getProperty(page, ['Region', 'State']))
  const countryCode = extractPlainText(getProperty(page, ['Country Code', 'Country']))

  return {
    name,
    label: label || undefined,
    email: email || undefined,
    phone: phone || undefined,
    url: url || undefined,
    summary: summary || undefined,
    location:
      city || region || countryCode
        ? {
            city: city || undefined,
            region: region || undefined,
            countryCode: countryCode || undefined,
          }
        : undefined,
  }
}

export function transformNotionResume(input: TransformNotionResumeInput): ResumeConfiguration {
  const roles = input.rolePages.filter((page) => matchesVariant(page, input.variant)).map(transformNotionRole)
  const education = input.educationPages
    .filter((page) => matchesVariant(page, input.variant))
    .map(transformNotionEducation)
  const skills = input.skillPages
    .filter((page) => matchesVariant(page, input.variant))
    .map(transformNotionSkill)

  return {
    variant: input.variant,
    label: input.label,
    summary: input.summary,
    basics: input.basicsPage ? transformNotionBasics(input.basicsPage) : undefined,
    roles,
    education,
    skills,
  }
}
