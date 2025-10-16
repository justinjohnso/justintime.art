# Optional Dependencies

This document tracks optional dependencies that can be installed when needed for specific features.

## PDF Generation (Priority 5)

**When to install**: Before implementing one-sheet generator

```bash
pnpm add puppeteer
```

**Size**: ~300MB (includes Chromium)
**Purpose**: HTML-to-PDF rendering for project one-sheets
**Alternative**: Could use lighter libraries like `jsPDF` but less control over layout

## Optional Dependencies

This project keeps optional dependencies minimal. Install them only when you need the specific features they enable.

### @notionhq/client

**When to install**: When setting up Notion integration for syncing projects/blog posts.

```bash
pnpm add @notionhq/client
```

**Used by**: 
- `scripts/sync-notion.ts` - Content synchronization
- `src/pages/api/notion-webhook.ts` - Webhook handler

**Required for**: Fetching content from Notion databases

### tsx

**When to install**: When running TypeScript scripts directly (like the Notion sync script).

```bash
pnpm add -D tsx
```

**Used by**:
- `scripts/sync-notion.ts` execution
- Development workflow scripts

**Required for**: Running TypeScript files without pre-compilation

## Image Optimization (Future)

**When to install**: For automatic image optimization

```bash
pnpm add sharp
```

**Purpose**: Resize, compress, and convert images for web optimization

## Notes

- Keep core bundle size small
- Only install when actively implementing feature
- Document installation command and purpose here
- Check package size before installing (`pnpm info <package>`)

## Architecture Decisions

**Media Storage**: Using local filesystem (public/media/) for both development and production.
- Development: Astro dev server serves from public/
- Production (Droplet): Nginx serves static files from public/
- No cloud storage (DO Spaces, S3, Cloudinary) needed - everything in one place
- Simpler deployment, no per-service costs, easier backups
