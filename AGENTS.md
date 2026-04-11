# AGENTS.md — justintime.art

Portfolio website for Justin Johnson — creative technologist and sound designer.

**Stack**: Astro 4.16 (SSG) · TinaCMS (git-based CMS) · Tailwind CSS 3.4 · TypeScript 5.7 · React (islands)
**Content**: MDX in `src/content/`, synced from Notion via GitHub Actions
**Deployment**: Digital Ocean Droplet · Nginx · GitHub Actions CI/CD
**Domain**: justintime.art
**Package manager**: pnpm (never npm/yarn)
**Output**: Static only — do not suggest SSR

---

## Commands

```bash
pnpm dev                   # Astro dev server
pnpm tina:dev              # Dev + TinaCMS visual editor at /admin
pnpm build                 # Production build (tinacms build + astro build)
pnpm lint                  # ESLint
pnpm sync:notion           # Sync all from Notion (projects by default)
pnpm sync:projects         # Projects only
pnpm sync:blog             # Blog only (disabled by default)
pnpm compress:images       # Optimize images via sharp
```

---

## Priorities

**Done**: Video embeds (YouTube/Vimeo/SoundCloud/MP4/Dropbox), Notion sync pipeline, image compression, featured projects, deployment, about page, project page layouts, multiple media embeds

**Next**:
1. Blog enablement — sync works but disabled by default. Enable + add RSS feed.
2. PDF one-sheet generator — Puppeteer HTML→PDF for project documentation
3. Dynamic resume system — composable resumes from Notion, JSON Resume format
4. Self-hosted Umami analytics — Docker on the Droplet

---

## Project-Specific Patterns

### Featured projects
`featured: true` in project frontmatter is the source of truth. Homepage sorts: featured first (in curated order), then non-featured by `dateCompleted` (newest first). Key files: `src/pages/index.astro`, `tina/collections/projects.ts`.

### Notion sync
One-way: Notion → Portfolio. Script: `scripts/sync-notion.ts`. Workflow: `.github/workflows/notion-sync.yml`. Images download to `public/media/` and auto-compress via sharp. Flags: `--skip-blog`, `--skip-projects`, `--force`. Commits as Justin Johnson (not github-actions[bot]). Missing fields skip + warn, never crash.

### Video embeds
Supported: YouTube, Vimeo, SoundCloud, MP4/WebM, Dropbox (`?raw=1`). All 16:9 default. `mediaEmbed` field in frontmatter. Detection logic in `src/utils/embedUtils.ts`. Only frontmatter URLs — no user-generated embed URLs.

### Shared utilities — use these, don't duplicate
- `src/utils/constants.ts` — breakpoints and magic numbers
- `src/utils/categoryUtils.ts` — `extractCategorySlug()` for category logic
- `src/utils/embedUtils.ts` — video/audio embed detection
- `src/layouts/MainContent.astro` — sidebar offset wrapper (never duplicate the margin pattern)

### Environment variables
Stored in `.env` (gitignored). Required: `NOTION_API_KEY`, `TINA_CLIENT_ID`, `TINA_TOKEN`.

---

## Pitfalls

- **SSG, not SSR** — Astro's static approach is intentional. Don't suggest SSR.
- **Constants** — use `src/utils/constants.ts`, not magic numbers
- **Layout margins** — use `MainContent.astro`, don't copy the `ml-0 md:ml-[...] lg:ml-[...]` pattern
- **Category logic** — use `extractCategorySlug()`, don't regex match inline
- **Debug logs** — remove all `console.log()` before committing. Keep only `console.error`/`console.warn` for real error paths.

---

## AI context files

- `AGENTS.md` — this file (tracked)
- `.claude/rules/` — path-scoped rules for Astro, MDX, Notion sync, TinaCMS (auto-load per file type)
- `.github/copilot-instructions.md` — GitHub Copilot instructions (tracked, 564 lines)
- `.agents/skills/` — debugging and verification skills (gitignored)
- Global instructions: `~/.config/agents/AGENTS.md` covers code conventions, git rules, security, and testing

Historical docs were in `docs/` until April 2026 — check `git log --all -- docs/` if needed.

---

*Last updated: April 2026*
