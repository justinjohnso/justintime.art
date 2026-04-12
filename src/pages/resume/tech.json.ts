import { loadResumeContent } from '../../lib/resume/content'
import { mapToJsonResume } from '../../lib/resume/map-to-json-resume'

export async function GET() {
  const resume = await loadResumeContent('tech')
  const jsonResume = mapToJsonResume(resume)

  return new Response(`${JSON.stringify(jsonResume, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
  })
}
