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

## Notion SDK (Priority 3)

**When to install**: Before implementing Notion sync

```bash
pnpm add @notionhq/client
pnpm add notion-to-md  # For rich text conversion
```

**Size**: ~2MB
**Purpose**: Notion API integration for content sync

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
