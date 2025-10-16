/**
 * PDF Generator for Project One-Sheets
 * 
 * Uses Puppeteer to render HTML templates to PDF
 * Supports multiple layout orientations and templates
 */

import type { Browser } from 'puppeteer';

export interface OneSheetData {
  title: string;
  tagline?: string;
  year?: number;
  location?: string;
  projectType?: string;
  duration?: string;
  description: string;
  technicalDetails?: string[];
  heroImage?: string;
  diagramImage?: string;
  categories?: string[];
  links?: Array<{ title: string; url: string }>;
}

export interface PDFOptions {
  layout?: 'vertical' | 'horizontal';
  template?: 'default' | 'minimal' | 'detailed';
}

/**
 * Generate a PDF one-sheet from project data
 * 
 * @param data - Project data to render
 * @param options - PDF generation options
 * @returns PDF buffer
 */
export async function generateOneSheet(
  data: OneSheetData,
  options: PDFOptions = {}
): Promise<Buffer> {
  const { layout = 'vertical', template = 'default' } = options;
  
  // Dynamic import to avoid loading Puppeteer during build
  const puppeteer = await import('puppeteer');
  
  let browser: Browser | null = null;
  
  try {
    // Launch browser
    browser = await puppeteer.default.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    const page = await browser.newPage();
    
    // Set page size based on layout
    const pageFormat = layout === 'horizontal' ? 'Letter' : 'Letter';
    const isLandscape = layout === 'horizontal';
    
    // Generate HTML from template
    const html = generateHTML(data, template, layout);
    
    // Set content and wait for images to load
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    // Generate PDF
    const pdf = await page.pdf({
      format: pageFormat,
      landscape: isLandscape,
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in',
      },
    });
    
    return Buffer.from(pdf);
    
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate HTML from template
 */
function generateHTML(
  data: OneSheetData,
  template: string,
  layout: string
): string {
  const styles = getTemplateStyles(template, layout);
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.title} - One Sheet</title>
  <style>${styles}</style>
</head>
<body>
  <div class="container">
    <!-- Header Section -->
    <header class="header">
      <h1 class="title">${data.title}</h1>
      ${data.tagline ? `<p class="tagline">${data.tagline}</p>` : ''}
      <div class="meta">
        ${data.year ? `<span class="meta-item">${data.year}</span>` : ''}
        ${data.location ? `<span class="meta-item">${data.location}</span>` : ''}
        ${data.projectType ? `<span class="meta-item">${data.projectType}</span>` : ''}
        ${data.duration ? `<span class="meta-item">${data.duration}</span>` : ''}
      </div>
    </header>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- Description Section -->
      <section class="description">
        <h2>Overview</h2>
        <p>${data.description}</p>
        
        ${data.technicalDetails && data.technicalDetails.length > 0 ? `
          <h3>Technical Details</h3>
          <ul class="tech-list">
            ${data.technicalDetails.map(detail => `<li>${detail}</li>`).join('')}
          </ul>
        ` : ''}
        
        ${data.categories && data.categories.length > 0 ? `
          <div class="categories">
            ${data.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
          </div>
        ` : ''}
      </section>

      <!-- Hero Image -->
      ${data.heroImage ? `
        <div class="image-container hero-image">
          <img src="${data.heroImage}" alt="${data.title}">
        </div>
      ` : ''}

      <!-- Diagram/Technical Image -->
      ${data.diagramImage ? `
        <div class="image-container diagram-image">
          <img src="${data.diagramImage}" alt="${data.title} - Technical Diagram">
        </div>
      ` : ''}
    </div>

    <!-- Footer with Links -->
    ${data.links && data.links.length > 0 ? `
      <footer class="footer">
        <div class="links">
          ${data.links.map(link => `
            <a href="${link.url}" class="link-item">${link.title}</a>
          `).join('')}
        </div>
      </footer>
    ` : ''}

    <!-- Branding -->
    <div class="branding">
      Justin Johnson • jjohnson.art
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Get CSS styles for the template
 */
function getTemplateStyles(template: string, layout: string): string {
  const baseStyles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      color: #111;
      background: white;
      line-height: 1.6;
    }

    .container {
      padding: 1rem;
      max-width: 100%;
    }

    .header {
      margin-bottom: 1.5rem;
      border-bottom: 2px solid #111;
      padding-bottom: 1rem;
    }

    .title {
      font-size: 2.5rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .tagline {
      font-size: 1.25rem;
      color: #555;
      margin-bottom: 0.75rem;
    }

    .meta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.95rem;
      color: #666;
    }

    .meta-item {
      padding: 0.25rem 0.75rem;
      background: #f5f5f5;
      border-radius: 0.25rem;
    }

    .content-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .description {
      grid-column: span 2;
    }

    .description h2 {
      font-size: 1.5rem;
      margin-bottom: 0.75rem;
      font-weight: 600;
    }

    .description h3 {
      font-size: 1.25rem;
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .description p {
      margin-bottom: 1rem;
      font-size: 1rem;
      line-height: 1.7;
    }

    .tech-list {
      list-style: disc;
      padding-left: 1.5rem;
      margin-bottom: 1rem;
    }

    .tech-list li {
      margin-bottom: 0.5rem;
    }

    .categories {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: 1rem;
    }

    .category-tag {
      padding: 0.25rem 0.75rem;
      background: #e5e5e5;
      border-radius: 0.25rem;
      font-size: 0.875rem;
    }

    .image-container {
      width: 100%;
      overflow: hidden;
    }

    .image-container img {
      width: 100%;
      height: auto;
      display: block;
      object-fit: contain;
    }

    .hero-image {
      grid-column: span 1;
    }

    .diagram-image {
      grid-column: span 1;
    }

    .footer {
      padding: 1rem 0;
      border-top: 1px solid #ddd;
      margin-bottom: 1rem;
    }

    .links {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .link-item {
      text-decoration: none;
      color: #2563eb;
      font-size: 0.95rem;
      padding: 0.5rem 1rem;
      border: 1px solid #2563eb;
      border-radius: 0.25rem;
      transition: all 0.2s;
    }

    .branding {
      text-align: center;
      font-size: 0.875rem;
      color: #999;
      padding-top: 1rem;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  `;

  // Layout-specific adjustments
  const layoutStyles = layout === 'horizontal' ? `
    .content-grid {
      grid-template-columns: 2fr 1fr;
    }

    .description {
      grid-column: span 1;
    }

    .hero-image {
      grid-column: span 1;
      grid-row: 1 / 3;
    }
  ` : '';

  return baseStyles + layoutStyles;
}

export default generateOneSheet;
