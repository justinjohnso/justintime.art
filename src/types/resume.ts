/**
 * TypeScript Types for Dynamic Resume Data
 */

export type ResumeVariant = 'tech' | 'theatre'

/**
 * Local Resume Domain Model
 */
export interface ResumeProfile {
  network: string
  username?: string
  url?: string
}

export interface ResumeLocation {
  city?: string
  region?: string
  countryCode?: string
}

export interface ResumeBasics {
  name: string
  label?: string
  email?: string
  phone?: string
  url?: string
  summary?: string
  location?: ResumeLocation
  profiles?: ResumeProfile[]
}

export interface ResumeRole {
  position: string
  company: string
  location?: string
  startDate: string
  endDate?: string
  description?: string
  highlights: string[]
}

export interface ResumeEducation {
  institution: string
  degree?: string
  field?: string
  startDate?: string
  endDate?: string
  notes?: string
}

export interface ResumeSkill {
  name: string
  level?: string
  keywords: string[]
}

export interface ResumeConfiguration {
  variant: ResumeVariant
  label: string
  summary: string
  basics?: ResumeBasics
  roles: ResumeRole[]
  education: ResumeEducation[]
  skills: ResumeSkill[]
}

/**
 * JSON Resume Schema-Aligned Types
 * Reference: https://jsonresume.org/schema/
 */
export interface JsonResumeLocation {
  address?: string
  postalCode?: string
  city?: string
  countryCode?: string
  region?: string
}

export interface JsonResumeProfile {
  network: string
  username?: string
  url?: string
}

export interface JsonResumeBasics {
  name: string
  label?: string
  image?: string
  email?: string
  phone?: string
  url?: string
  summary?: string
  location?: JsonResumeLocation
  profiles?: JsonResumeProfile[]
}

export interface JsonResumeWork {
  name: string
  location?: string
  description?: string
  position?: string
  url?: string
  startDate?: string
  endDate?: string
  summary?: string
  highlights?: string[]
}

export interface JsonResumeEducation {
  institution?: string
  url?: string
  area?: string
  studyType?: string
  startDate?: string
  endDate?: string
  score?: string
  courses?: string[]
}

export interface JsonResumeSkill {
  name?: string
  level?: string
  keywords?: string[]
}

export interface JsonResumeDocument {
  $schema?: string
  basics?: JsonResumeBasics
  work?: JsonResumeWork[]
  education?: JsonResumeEducation[]
  skills?: JsonResumeSkill[]
}
