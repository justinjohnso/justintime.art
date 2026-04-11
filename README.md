# justintime.art

Personal portfolio for Justin Johnson — creative technologist and sound designer.

Built with **Astro** + **TinaCMS** + **Tailwind CSS** + **TypeScript**. Content syncs from Notion via GitHub Actions.

## Getting started

```bash
pnpm install
cp .env.example .env       # Add NOTION_API_KEY, TINA_CLIENT_ID, TINA_TOKEN
pnpm dev                   # Dev server at localhost:4321
pnpm tina:dev              # Dev server + TinaCMS visual editor at /admin
```

## Commands

```bash
pnpm build                 # Production build (tinacms build + astro build)
pnpm lint                  # ESLint
pnpm sync:notion           # Sync all content from Notion
pnpm sync:projects         # Sync projects only
pnpm sync:blog             # Sync blog only
pnpm compress:images       # Optimize images via sharp
```

## How content works

**Notion** is the source of truth. Projects and blog posts are edited in Notion, then synced to MDX files in `src/content/` via `scripts/sync-notion.ts`. The sync runs automatically through GitHub Actions when triggered.

**TinaCMS** provides a local visual editor at `/admin` for quick edits. Schema definitions live in `tina/collections/`.

**Featured projects** are controlled by the `featured: true` field in each project's frontmatter.

## Deployment

Hosted on a **Digital Ocean Droplet** with Nginx. Deploys automatically via GitHub Actions on push to `main`.

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

- **CLAUDE.md** — Claude Code entry point (tracked)
- **AGENTS.md** — Comprehensive project instructions (gitignored, local only)
- **.claude/rules/** — Path-scoped rules that auto-load per file type
- **.github/copilot-instructions.md** — GitHub Copilot instructions (tracked)

## License

MIT
