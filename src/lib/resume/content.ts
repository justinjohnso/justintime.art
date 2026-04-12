import { promises as fs } from 'fs'
import path from 'path'

import type { ResumeConfiguration, ResumeVariant } from '../../types/resume'

const RESUME_CONTENT_DIR = path.join(process.cwd(), 'src', 'content', 'resume')
const RESUME_VARIANTS: ResumeVariant[] = ['tech', 'theatre']

function getResumeContentPath(variant: ResumeVariant): string {
  return path.join(RESUME_CONTENT_DIR, `${variant}.json`)
}

function assertResumeConfiguration(
  value: unknown,
  expectedVariant: ResumeVariant,
  filePath: string,
): asserts value is ResumeConfiguration {
  if (!value || typeof value !== 'object') {
    throw new Error(`Invalid resume content at ${filePath}: expected object`)
  }

  const resume = value as ResumeConfiguration

  if (resume.variant !== expectedVariant) {
    throw new Error(
      `Invalid resume content at ${filePath}: expected variant "${expectedVariant}" but received "${resume.variant}"`,
    )
  }
}

export async function resumeContentExists(variant: ResumeVariant): Promise<boolean> {
  try {
    await fs.access(getResumeContentPath(variant))
    return true
  } catch {
    return false
  }
}

export async function loadResumeContent(variant: ResumeVariant): Promise<ResumeConfiguration> {
  const filePath = getResumeContentPath(variant)
  const raw = await fs.readFile(filePath, 'utf-8')
  const parsed: unknown = JSON.parse(raw)
  assertResumeConfiguration(parsed, variant, filePath)
  return parsed
}

export async function loadAllResumeContent(): Promise<ResumeConfiguration[]> {
  const resumes: ResumeConfiguration[] = []

  for (const variant of RESUME_VARIANTS) {
    if (!(await resumeContentExists(variant))) {
      continue
    }
    resumes.push(await loadResumeContent(variant))
  }

  return resumes
}

export async function writeResumeContent(resume: ResumeConfiguration): Promise<void> {
  await fs.mkdir(RESUME_CONTENT_DIR, { recursive: true })
  const filePath = getResumeContentPath(resume.variant)
  const payload = `${JSON.stringify(resume, null, 2)}\n`
  await fs.writeFile(filePath, payload, 'utf-8')
}

