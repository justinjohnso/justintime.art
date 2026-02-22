# PDF One-Sheet Generator

Automated generation of project one-sheets in PDF format using Puppeteer.

## Architecture

```
Notion Webhook → API Endpoint → PDF Generator → Storage → Return URL
```

## Setup

### 1. Install Dependencies

```bash
pnpm add puppeteer
pnpm add -D @types/node
```

### 2. Environment Variables

Add to `.env`:

```env
# PDF Generation
PDF_STORAGE_PATH=/path/to/storage  # Local: public/pdfs | Production: DO Spaces
PDF_BASE_URL=https://justintime.art  # Base URL for PDF access
```

### 3. Storage Options

#### Local Development (Filesystem)
- Store PDFs in `public/pdfs/`
- Access via `http://localhost:4321/pdfs/project-name.pdf`

#### Production (Digital Ocean Spaces)
- Upload to DO Spaces bucket
- Return CDN URL
- See: [DO Spaces Documentation](https://docs.digitalocean.com/products/spaces/)

## Usage

### Basic Generation

```typescript
import { generateOneSheet } from '@/lib/pdf/generator';

const pdfBuffer = await generateOneSheet({
  title: 'Interactive Sound Installation',
  tagline: 'Motion-Controlled Synthesis',
  year: 2024,
  location: 'Brooklyn, NY',
  projectType: 'Interactive Installation',
  description: 'An interactive sound installation that responds to visitor movement...',
  technicalDetails: [
    'ESP32 microcontroller with WiFi',
    'VL53L0X time-of-flight sensors',
    'Pure Data for audio synthesis',
    'WebSocket communication'
  ],
  heroImage: '/path/to/hero-image.jpg',
  categories: ['Physical Computing', 'Sound Design'],
  links: [
    { title: 'Documentation', url: 'https://example.com/docs' },
    { title: 'GitHub', url: 'https://github.com/...' }
  ]
}, {
  layout: 'vertical',
  template: 'default'
});

// Save or upload buffer
```

### API Endpoint (To Be Implemented)

```typescript
// src/pages/api/generate-onesheet.ts
import type { APIRoute } from 'astro';
import { generateOneSheet } from '@/lib/pdf/generator';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();

  // Validate request
  // Generate PDF
  // Store/upload PDF
  // Return URL

  return new Response(JSON.stringify({ url: pdfUrl }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
```

## Templates

### Default Template
- Clean, professional layout
- Two-column grid for content and images
- Supports both vertical and horizontal orientations

### Layout Options

#### Vertical (Portrait)
- Standard US Letter (8.5" × 11")
- Best for text-heavy projects
- Description spans full width
- Images stack vertically

#### Horizontal (Landscape)
- US Letter rotated (11" × 8.5")
- Best for image-heavy projects
- Side-by-side content and images
- More compact layout

## Notion Integration

### Webhook Trigger

When a "Generate One-Sheet" button is clicked in Notion:

1. Notion sends webhook to `/api/generate-onesheet`
2. API fetches project data from Notion
3. Transforms Notion blocks to one-sheet data structure
4. Generates PDF using Puppeteer
5. Stores PDF (filesystem or DO Spaces)
6. Returns PDF URL to Notion (or updates page property)

### Notion Database Fields

Required fields:
- Title
- Description
- Year (optional)
- Hero Image
- Categories

Optional fields:
- Tagline
- Location
- Project Type
- Duration
- Technical Details
- Diagram Image
- Links

## Implementation Phases

### Phase 1: Core Generator ✅
- [x] Create PDF generator utility
- [x] Implement HTML template rendering
- [x] Support multiple layouts
- [ ] Install Puppeteer dependency
- [ ] Test with sample data

### Phase 2: API Endpoint
- [ ] Create `/api/generate-onesheet` endpoint
- [ ] Add request validation
- [ ] Implement error handling
- [ ] Add authentication (webhook secret)
- [ ] Test with curl/Postman

### Phase 3: Storage Integration
- [ ] Local filesystem storage (dev)
- [ ] DO Spaces integration (production)
- [ ] Generate unique filenames
- [ ] Handle file cleanup/versioning

### Phase 4: Notion Integration
- [ ] Create webhook endpoint
- [ ] Map Notion data to OneSheetData
- [ ] Download images from Notion
- [ ] Update Notion with PDF URL
- [ ] Test end-to-end workflow

### Phase 5: Template Refinement
- [ ] Match provided screenshot design
- [ ] Add template variations
- [ ] Optimize for different project types
- [ ] Add custom branding options

## Technical Considerations

### Puppeteer Performance
- **Cold start**: ~1-3 seconds to launch browser
- **PDF generation**: ~500ms-2s depending on complexity
- **Memory**: ~50-100MB per browser instance
- **Optimization**: Reuse browser instance in production

### Image Handling
- Notion images are temporary URLs (expire after ~1 hour)
- Must download and re-host images for PDF generation
- Consider image optimization (resize, compress)

### Error Scenarios
- Missing required fields → 400 Bad Request
- Image download failure → Use placeholder or skip
- PDF generation timeout → 504 Gateway Timeout
- Storage failure → 500 Internal Server Error

## Testing

### Local Testing

```bash
# Test PDF generation
pnpm tsx scripts/test-pdf-generation.ts

# Test API endpoint (after implementation)
curl -X POST http://localhost:4321/api/generate-onesheet \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Project", "description": "Test description"}'
```

### Sample Test Script

Create `scripts/test-pdf-generation.ts`:

```typescript
import { generateOneSheet } from '../src/lib/pdf/generator';
import { writeFile } from 'fs/promises';

const testData = {
  title: 'Test Project',
  tagline: 'A test one-sheet',
  year: 2024,
  description: 'This is a test description for the PDF generator.',
  technicalDetails: ['Test tech 1', 'Test tech 2'],
  categories: ['Physical Computing', 'Sound Design']
};

const pdf = await generateOneSheet(testData);
await writeFile('test-onesheet.pdf', pdf);
console.log('PDF generated: test-onesheet.pdf');
```

## Next Steps

1. **Install Puppeteer**: `pnpm add puppeteer`
2. **Test generator**: Create test script and verify PDF output
3. **Implement API endpoint**: Create Astro API route
4. **Add storage**: Implement local or cloud storage
5. **Integrate with Notion**: Set up webhook and mapping logic

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Digital Ocean Spaces](https://docs.digitalocean.com/products/spaces/)
- [Notion API](https://developers.notion.com/)
- [Astro API Routes](https://docs.astro.build/en/core-concepts/endpoints/)
