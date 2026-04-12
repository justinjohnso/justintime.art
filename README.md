# justintime.art

Personal portfolio for Justin Johnson — creative technologist and sound designer.

Built with **Astro** + **TinaCMS** + **Tailwind CSS** + **TypeScript**. Content syncs from Notion via GitHub Actions.

## Getting started

```bash
pnpm install
cp .env.example .env       # Add required env vars (and Notion DB IDs for sync)
pnpm dev                   # Dev server at localhost:4321
pnpm tina:dev              # Dev server + TinaCMS visual editor at /admin
```

## Commands

```bash
pnpm build                 # Production build (tinacms build + astro build)
pnpm lint                  # ESLint
pnpm sync:notion           # Sync projects + blog from Notion (default)
pnpm sync:notion --skip-blog      # Explicitly opt out of blog sync
pnpm sync:notion --skip-projects  # Sync blog only
pnpm sync:notion:resume            # Sync projects + blog + resume in one run
pnpm sync:resume                   # Sync resume artifacts only
pnpm generate:one-sheet -- --slug <project-slug>  # Generate one PDF
pnpm generate:one-sheets                          # Generate all project PDFs
pnpm compress:images       # Optimize images via sharp
```

## How content works

**Notion** is the source of truth. Projects and blog posts are edited in Notion, then synced to MDX files in `src/content/` via `scripts/sync-notion.ts`. Sync runs with blog enabled by default (local and GitHub Actions). Use `--skip-blog` to explicitly opt out. When blog sync is enabled, `NOTION_BLOG_DB_ID` is required.

**Resume sync** writes local JSON artifacts to `src/content/resume/tech.json` and `src/content/resume/theatre.json`. Resume DB env vars are optional (`NOTION_RESUME_ROLES_DB_ID`, `NOTION_RESUME_EDUCATION_DB_ID`, `NOTION_RESUME_SKILLS_DB_ID`): if missing, resume sync is skipped with a warning so project/blog sync can still run.

**TinaCMS** provides a local visual editor at `/admin` for quick edits. Schema definitions live in `tina/collections/`.

**Featured projects** are controlled by the `featured: true` field in each project's frontmatter.

**One-sheet PDFs** generate from project MDX content into `output/one-sheets/`. These PDFs are build artifacts and stay uncommitted by default (`output/one-sheets/*.pdf` is gitignored). Narrative and reflection content derives from the MDX body when one-sheet overrides are not set (`oneSheetNarrativeOverride`, `oneSheetReflectionOverride`).

## RSS feed

The blog RSS feed is available at `/rss.xml`. It publishes posts from `src/content/posts/` for feed readers and syndication.

## Resume routes

- Human-readable page: `/resume` (defaults to tech; optional `?variant=theatre`)
- JSON Resume outputs:
  - `/resume/tech.json`
  - `/resume/theatre.json`

## Deployment

Hosted on a **Digital Ocean Droplet** with Nginx. Deploys automatically via GitHub Actions on push to `main`.

## Analytics (optional)

Self-hosted Umami analytics is supported via public env vars:

- `PUBLIC_UMAMI_SRC`
- `PUBLIC_UMAMI_WEBSITE_ID`

The tracking script is injected only when **both** values are set and non-blank. Leave either unset/blank to disable analytics entirely.

## Project structure

```
src/
  components/     Astro + React components
  content/        MDX content (projects, posts, categories, pages)
  layouts/        Layout.astro, MainContent.astro
  pages/          File-based routing
  lib/            Notion sync, PDF, storage, webhook utilities
  utils/          Shared helpers (constants, categoryUtils, embedUtils)
tina/             TinaCMS schema and config
scripts/          Build and sync scripts
public/media/     Images and video assets
```

## AI agent context

This repo uses multiple AI tools. Instruction files:

- **AGENTS.md** — Comprehensive project instructions (tracked)
- **Global Gemini setup** — Managed outside the repo via `~/.config/ai/AGENTS.md`, `~/.gemini/settings.json`, and `~/.config/ai/scripts/setup-gemini-global.sh`
- **.claude/rules/** — Path-scoped rules that auto-load per file type
- **.github/copilot-instructions.md** — GitHub Copilot instructions (tracked)

## License

MIT
