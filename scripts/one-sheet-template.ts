import type { OneSheetProjectData } from './one-sheet-data'

export interface OneSheetTemplateOptions {
  assetBaseUrl?: string
  documentTitleSuffix?: string
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildDocumentTitle(
  project: OneSheetProjectData,
  options: OneSheetTemplateOptions,
): string {
  const suffix = options.documentTitleSuffix?.trim() || 'One Sheet'
  return `${project.title} — ${suffix}`
}

function resolveAssetUrl(image: string, options: OneSheetTemplateOptions): string {
  if (/^(https?:|data:|file:)/i.test(image)) return image

  const base = options.assetBaseUrl?.trim()
  if (!base) return image

  const normalizedBase = base.replace(/\/+$/, '')
  if (image.startsWith('/')) {
    return `${normalizedBase}${image}`
  }

  return `${normalizedBase}/${image}`
}

function renderMetaRow(label: string, value?: string): string {
  if (!value) return ''

  return `
    <div class="meta-row">
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `
}

function renderNarrative(narrative?: string): string {
  if (!narrative) return ''

  const paragraphs = narrative
    .split(/\n\s*\n+/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 0)

  if (paragraphs.length === 0) return ''

  return `
    <section>
      <h2>Narrative</h2>
      ${paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n')}
    </section>
  `
}

function renderReflection(reflection?: string): string {
  if (!reflection) return ''

  return `
    <section>
      <h2>Reflection</h2>
      <p class="reflection-note">${escapeHtml(reflection)}</p>
    </section>
  `
}

function renderCategories(project: OneSheetProjectData): string {
  if (project.categories.length === 0) return ''

  return `
    <section>
      <h2>Categories</h2>
      <p>${project.categories.map((category) => escapeHtml(category.title)).join(' · ')}</p>
    </section>
  `
}

function renderLinks(project: OneSheetProjectData): string {
  if (project.links.length === 0) return ''

  return `
    <section>
      <h2>Key Links</h2>
      <ul>
        ${project.links
          .map((link) => {
            const typeSuffix = link.type ? ` (${escapeHtml(link.type)})` : ''
            return `<li><a href="${escapeHtml(link.url)}">${escapeHtml(link.title)}</a>${typeSuffix}</li>`
          })
          .join('\n')}
      </ul>
    </section>
  `
}

export function generateOneSheetTemplate(
  project: OneSheetProjectData,
  options: OneSheetTemplateOptions = {},
): string {
  const title = escapeHtml(project.title)
  const documentTitle = escapeHtml(buildDocumentTitle(project, options))
  const heroImage = project.image ? resolveAssetUrl(project.image, options) : undefined
  const mediumLabel = project.mediumTypeLabel || undefined

  return `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${documentTitle}</title>
    <style>
      @page {
        size: Letter;
        margin: 0.5in;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #111111;
        line-height: 1.45;
        font-size: 11pt;
      }

      .sheet {
        width: 100%;
      }

      header {
        margin-bottom: 0.2in;
        border-bottom: 1px solid #d4d4d4;
        padding-bottom: 0.15in;
      }

      h1 {
        margin: 0;
        font-size: 24pt;
        font-weight: 500;
        letter-spacing: -0.01em;
      }

      h2 {
        margin: 0 0 0.08in 0;
        font-size: 10pt;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #4b5563;
      }

      p {
        margin: 0 0 0.1in 0;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
        gap: 0.25in;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: 0.18in;
      }

      dl {
        margin: 0;
      }

      .meta-row {
        display: grid;
        grid-template-columns: 1.1in 1fr;
        gap: 0.12in;
        margin-bottom: 0.05in;
      }

      dt {
        margin: 0;
        font-size: 9pt;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #4b5563;
      }

      dd {
        margin: 0;
      }

      .hero {
        margin: 0;
      }

      .hero img {
        width: 100%;
        max-height: 3.4in;
        object-fit: cover;
        border: 1px solid #e5e7eb;
      }

      ul {
        margin: 0;
        padding-left: 1.1em;
      }

      li {
        margin-bottom: 0.06in;
      }

      a {
        color: #111111;
        text-decoration: underline;
      }

      .reflection-note {
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <main class="sheet">
      <header>
        <h1>${title}</h1>
      </header>

      <div class="layout">
        <section class="content">
          <section>
            <h2>Project Details</h2>
            <dl>
              ${renderMetaRow('Year', project.year)}
              ${renderMetaRow('Date', project.date)}
              ${renderMetaRow('Location', project.location)}
              ${renderMetaRow('Medium', mediumLabel)}
              ${renderMetaRow('Duration', project.duration)}
            </dl>
          </section>

          ${renderNarrative(project.narrative)}
          ${renderReflection(project.reflection)}
          ${renderCategories(project)}
          ${renderLinks(project)}
        </section>

        ${heroImage ? `<figure class="hero"><img src="${escapeHtml(heroImage)}" alt="${title}" /></figure>` : ''}
      </div>
    </main>
  </body>
</html>
  `.trim()
}
