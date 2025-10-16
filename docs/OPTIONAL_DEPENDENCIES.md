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

## AWS SDK / DO Spaces (Future)

**When to install**: For production media storage

```bash
pnpm add @aws-sdk/client-s3  # Works with DO Spaces (S3-compatible)
```

**Purpose**: Upload generated PDFs and media to Digital Ocean Spaces

## Email Service (Future)

**When to install**: For contact form or notifications

```bash
pnpm add nodemailer
# or
pnpm add @sendgrid/mail
```

**Purpose**: Send emails for contact form or error notifications

## Notes

- Keep core bundle size small
- Only install when actively implementing feature
- Document installation command and purpose here
- Check package size before installing (`pnpm info <package>`)
