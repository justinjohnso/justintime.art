import type { JsonResumeDocument, ResumeConfiguration } from '../../types/resume'

const JSON_RESUME_SCHEMA = 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json'

export function mapToJsonResume(resume: ResumeConfiguration): JsonResumeDocument {
  return {
    $schema: JSON_RESUME_SCHEMA,
    basics: resume.basics
      ? {
          name: resume.basics.name,
          label: resume.basics.label,
          email: resume.basics.email,
          phone: resume.basics.phone,
          url: resume.basics.url,
          summary: resume.basics.summary || resume.summary,
          location: resume.basics.location
            ? {
                city: resume.basics.location.city,
                region: resume.basics.location.region,
                countryCode: resume.basics.location.countryCode,
              }
            : undefined,
          profiles: resume.basics.profiles?.map((profile) => ({
            network: profile.network,
            username: profile.username,
            url: profile.url,
          })),
        }
      : undefined,
    work: resume.roles.map((role) => ({
      name: role.company,
      location: role.location,
      position: role.position,
      startDate: role.startDate,
      endDate: role.endDate,
      summary: role.description,
      highlights: role.highlights,
    })),
    education: resume.education.map((item) => ({
      institution: item.institution,
      studyType: item.degree,
      area: item.field,
      startDate: item.startDate,
      endDate: item.endDate,
      courses: item.notes ? [item.notes] : undefined,
    })),
    skills: resume.skills.map((skill) => ({
      name: skill.name,
      level: skill.level,
      keywords: skill.keywords,
    })),
  }
}
