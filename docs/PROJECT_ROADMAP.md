
# Project Roadmap

## TL;DR: Key Decisions & Priorities

### Architecture & Approach
- **Framework**: Astro 4.16+ with static site generation (SSG preferred over SSR)
- **CMS**: TinaCMS for local editing, Notion as single source of truth for content
- **Content Strategy**: Bi-directional sync between Notion and portfolio (projects, blog, resume)
- **Security**: Environment variables only; webhook authentication for all external triggers

### Hosting & Infrastructure
- **Hosting**: Digital Ocean App Platform ($5/month, 40 months free via GitHub Student Pack)
- **Domain**: jjohnson.art (already owned)
- **Analytics**: Self-hosted Umami (Docker on DO)
- **Media Storage**: DO Spaces or Cloudinary
- **Decision Rationale**: See [planning/HOSTING_ANALYSIS.md](./planning/HOSTING_ANALYSIS.md) for full comparison

### Features & Integrations
- **PDF Generation**: Puppeteer (HTML → PDF) for project one-sheets and resumes
- **Icons**: Lucide React (tree-shakeable SVGs)
- **Video Embeds**: Custom Astro components for YouTube/Vimeo with aspect ratio handling
- **Blog**: Weekly ITP posts via Notion sync workflow

### Development Priorities
1. Content & Layout Updates (video embeds, single-image projects, about page)
2. Hosting Setup (Digital Ocean App Platform deployment)
3. Notion Sync (projects first, establish webhook workflow)
4. Blog Integration (extend Notion sync to blog posts)
5. PDF One-Sheet Generator (automated project documentation)
6. Dynamic Resume System (composable, context-specific resumes)

---

This document tracks the remaining work needed to complete the portfolio site and achieve full feature parity with the existing site at https://jjohnson.art/.

## Status: Planning Phase

**Last Updated**: October 15, 2025

---

## Priority 1: Content & Layout Parity

**Goal**: Match or exceed the quality and functionality of the existing jjohnson.art site.

### Tasks

- [ ] **Video Embeds**
  - **Decision**: Videos go in dedicated section under hero (not shared with other content)
  - Videos are locked to specific aspect ratios
  - Add support for video content in project pages
  - Implement responsive video player component
  - Support YouTube, Vimeo embeds

- [ ] **Project Page Layout Improvements**
  - **Single-image projects**: Give images more screen real estate
    - Text/links only in hero section for single-image projects
    - Move single image down the page (below hero)
  - **Whitespace balance**: Better define what content goes in hero vs. body
    - Hero section: Title, date, brief description, links
    - Body content section: Needs good padding for readability
  - Improve visual hierarchy and consistency

- [ ] **About Page Enhancements**
  - Add personal photo
  - **Decision**: Simple SVG icons for social media links
  - Design and implement clean social links section

- [ ] **Content Finalization**
  - Review and finalize all copy across the site
  - Ensure consistent tone and messaging
  - Proofread for typos and clarity

### Technical Considerations

- Video component should be its own section with aspect ratio handling
- Consider lazy loading for media-heavy pages
- Social links: Use simple SVG icons (Heroicons, Lucide, or similar)
- Single-image detection logic for layout switching---

## Priority 2: Hosting & Deployment

**Goal**: Deploy the site to a production environment with good infrastructure control and low cost.

### Hosting Options Analysis

#### Vercel (Free Tier - NOT RECOMMENDED)
- **Bandwidth**: 100GB/month
- **Serverless Functions**: 100GB-hours compute
- **❌ Function Timeout**: 10 seconds (too short for PDF generation)
- **Function Invocations**: 12,000/day
- **Issue**: Timeout limits problematic for Puppeteer PDF generation and potentially Notion sync
- **Verdict**: Too restrictive for this project's needs

#### Netlify (Free Tier - NOT RECOMMENDED)
- **Bandwidth**: 100GB/month
- **❌ Build Minutes**: 300/month (limiting with weekly blog updates)
- **Serverless Functions**: 125k requests/month, 100 hours runtime
- **Function Timeout**: 10s background, 26s synchronous
- **❌ Concurrent Builds**: 1 (causes queuing)
- **Issue**: Build minutes will run out quickly; ~2-5 minutes per build × weekly updates = 40-80 minutes/month minimum
- **Verdict**: Build limits too restrictive

#### Digital Ocean App Platform (RECOMMENDED ⭐)
- **Cost**: $5/month (~40 months with $200 GitHub Student Pack credit)
- **No timeout limits** for webhook endpoints
- **No build minute restrictions**
- **Supports long-running processes** (PDF generation with Puppeteer)
- **Full control** over infrastructure
- **Node.js/Astro support** built-in
- **Background jobs** possible for Notion sync
- **Verdict**: Best fit for requirements, especially with Student Pack credit

#### Digital Ocean Droplet (STRONG ALTERNATIVE ⭐)
- **Cost**: $6/month for 1GB RAM, 25GB SSD (33+ months with Student Pack)
- **Everything in one place**:
  - Host the static site (Nginx)
  - API endpoints for webhooks (Node.js/Express)
  - Media storage (filesystem, no S3 needed)
  - PDF storage (filesystem)
  - Umami analytics (Docker container)
  - PostgreSQL (for Umami)
- **Pros**:
  - Single server = simpler architecture
  - No per-service costs
  - Complete control
  - No object storage fees
  - More cost-effective long-term
  - Can SSH in for debugging
- **Cons**:
  - More DevOps work (Nginx, SSL, PM2, security)
  - Manual server management
  - Need to handle backups
  - Single point of failure (mitigated with backups)
- **Verdict**: Excellent choice for all-in-one setup, especially with low traffic

#### Cloudflare Pages + Workers
- **Pages**: Unlimited bandwidth, 500 builds/month
- **❌ Workers Free**: 10ms CPU time (too limited)
- **Workers Paid**: $5/month for 10M requests
- **Complexity**: Split between Pages (static) and Workers (API)
- **Verdict**: Possible but more complex setup than DO

### Tasks

- [ ] **Digital Ocean Setup**
  - Create App Platform app
  - Connect GitHub repository
  - Configure build settings (Astro build command)
  - Set up environment variables (Notion, TinaCMS)
  - Apply GitHub Student Pack credit

- [ ] **Domain Configuration**
  - Point jjohnson.art to Digital Ocean
  - Configure SSL certificate (automatic with DO)
  - Test domain propagation

- [ ] **Webhook Endpoint Setup**
  - Create API endpoint for Notion webhooks
  - Implement authentication/security
  - Test webhook triggers rebuild

- [ ] **Go Live**
  - Deploy production build
  - Test all functionality
  - Monitor performance and costs

### Technical Considerations

- **Build Command**: `pnpm build` (Astro static build)
- **Output Directory**: `dist/`
- **Node Version**: 18+ (specify in DO settings)
- **Environment Variables**: Copy from `.env` to DO dashboard
- **Webhook Security**: Use secret token to verify Notion requests
- **SSL**: Automatic with Digital Ocean### Decisions Made

1. **Domain**: Already have jjohnson.art - will deploy there
2. **Update frequency**:
   - Projects: ~Once per month
   - Blog: ~Once per week (after implementation)
   - Combined: ~4-8 deploys/month
3. **CDN/Edge**: Nice to have but not required (traffic volume low)
4. **Hosting choice**: **Digital Ocean Droplet or App Platform** (DECISION PENDING)
   - **Droplet** ($6/month = 33+ months on Student Pack):
     - ✅ Everything in one place (site, API, storage, analytics)
     - ✅ No per-service costs
     - ✅ More cost-effective
     - ❌ More DevOps work
   - **App Platform** ($5/month = 40 months on Student Pack):
     - ✅ Easier deployment
     - ✅ Automatic scaling
     - ❌ Need separate object storage ($5/month extra)
     - ❌ Need separate Umami hosting
   - **Recommendation**: Droplet for simplicity and cost (single $6/month bill vs. $5 + $5 + ?)
5. **Staging**: Not needed (local dev server sufficient)
6. **Analytics**: Self-hosted Umami (runs on same Droplet)

---

## Priority 3: Notion Integration

**Goal**: Establish Notion as the source of truth with seamless bi-directional sync to the portfolio.

### Architecture Approach

#### Option A: Webhook-Triggered Static Rebuild
- Notion change → Webhook → Rebuild site → Deploy
- **Pros**: Simple, keeps site static, leverages Astro's strengths
- **Cons**: Full rebuild on each change (can be optimized)
- **Best with**: Vercel, Netlify, Cloudflare Pages

#### Option B: Notion API + SSR
- Fetch content from Notion on request
- **Pros**: Real-time updates, no rebuild needed
- **Cons**: Slower page loads, more complex, requires SSR hosting
- **Best with**: Digital Ocean, Vercel (with functions)

#### Option C: Hybrid - Scheduled Sync
- Scheduled job fetches from Notion → Updates git repo → Triggers build
- **Pros**: Balance of static performance and automated updates
- **Cons**: Not real-time, more complex workflow
- **Best with**: GitHub Actions + any static host

### Recommended Approach

**Option A (Webhook + Static Rebuild)** aligns best with your goals:
- Maintains Astro's static site strengths
- Simple, maintainable codebase
- Native Astro functionality
- Works with "publish button" workflow

### Implementation Plan

#### Phase 1: Notion Database Setup
- [ ] Design Notion database schema for projects
- [ ] Create fields matching current frontmatter structure
- [ ] Set up relationships (categories, tags, etc.)
- [ ] Migrate existing projects to Notion (optional)

#### Phase 2: Sync Script Development
- [ ] Create Notion API integration
- [ ] Build sync script (Notion → MDX files)
- [ ] Handle media files (images, videos)
- [ ] Implement incremental updates (sync only changed projects)
- [ ] Add validation and error handling

#### Phase 3: Webhook Integration
- [ ] Set up webhook endpoint (hosting-dependent)
- [ ] Configure Notion to trigger webhook on publish
- [ ] Implement webhook → build pipeline
- [ ] Add authentication/security

#### Phase 4: Publish Workflow
- [ ] Create Notion "publish" button/automation
- [ ] Test end-to-end workflow
- [ ] Document process for future use

### Technical Considerations

- Use Notion's official SDK (`@notionhq/client`)
- Store Notion credentials securely (environment variables)
- Implement rate limiting to respect Notion API limits
- Consider caching for frequently accessed data
- Handle Notion's block structure → MDX conversion

### Notion Database Schema (Proposed)

```
Projects Database
├── Title (Title)
├── Slug (Text) - auto-generated or manual
├── Description (Text)
├── Year Completed (Number)
├── Categories (Multi-select)
├── Featured (Checkbox)
├── Status (Select: Draft, Published)
├── Cover Image (File)
├── Additional Images (Files)
├── Links (Relation to Links database)
├── Content (Rich Text/Blocks)
└── Last Modified (Last Edited Time)

Categories Database
├── Name (Title)
├── Slug (Text)
├── Description (Text)
└── Projects (Relation to Projects)
```

### Decisions Made

1. **Notion workspace**: Already set up and populated at https://dusty-pineapple.notion.site
2. **Database structure**: Already exists, use existing schema
3. **Sync scope**: Start with projects only; blog posts to be added later (separate todo)
4. **Bi-directional sync**:
   - Content changes push back to Notion
   - Layout changes are site-specific (don't push back)
5. **Publish workflow**: "Publish" button lives in Notion
6. **Integration credentials**: Already in `.env` file

### Next Steps

1. **Audit existing Notion database** to understand current schema
2. **Map Notion fields** to current frontmatter structure
3. **Build sync script** that handles bi-directional content updates
4. **Set up webhook** from Notion to trigger rebuild
5. **Test publish workflow** end-to-end

---

## Priority 4: Blog Integration

**Goal**: Add ITP work-in-progress blog with same Notion sync workflow as projects.

### Overview

Mirror the project sync architecture for blog posts:
- Separate Notion database for blog content
- Same webhook-triggered sync workflow
- Blog listing page + individual post pages
- RSS feed generation
- Category/tag filtering

### Implementation Plan

- [ ] **Blog Schema Design**
  - Create blog database in Notion
  - Fields: Title, slug, date, excerpt, content, tags, status
  - Featured image support
  - Author metadata (even if just you for now)

- [ ] **Site Structure**
  - Add `/blog` route
  - Blog listing page with pagination
  - Individual post pages (`/blog/[slug]`)
  - RSS feed at `/rss.xml`

- [ ] **Sync Integration**
  - Extend Notion sync script for blog posts
  - Handle blog-specific fields
  - Same webhook trigger as projects

- [ ] **Blog Features**
  - Search functionality (optional)
  - Tag/category filtering
  - "Related posts" suggestions
  - Reading time estimates

### Technical Considerations

- Reuse project sync architecture
- Share webhook endpoint (route by database ID)
- Consider incremental builds (only rebuild changed posts)
- Blog posts use same MDX rendering as projects

---

## Priority 5: PDF One-Sheet Generator

**Goal**: Automated generation of project one-sheets in PDF format with layout options.

### Architecture Approach

#### Option A: Notion-Native Automation
- Use Notion's built-in PDF export
- **Pros**: Simple, lives in Notion
- **Cons**: Limited customization, fixed layout
- **Tooling**: Notion API + PDF library

#### Option B: Custom Generator (Recommended)
- Webhook → Server → Generate PDF → Return/Store
- **Pros**: Full design control, multiple layout options
- **Cons**: More complex, requires hosting
- **Tooling**: Puppeteer, PDFKit, or similar

#### Option C: Cloudflare Worker/Edge Function
- Serverless function generates PDF on demand
- **Pros**: Scalable, no server management
- **Cons**: Execution time limits, cold starts
- **Tooling**: Browser automation in worker

### Implementation Plan

- [ ] **Design Phase**
  - Create one-sheet template designs (vertical & horizontal)
  - Identify required data fields from Notion
  - Determine branding/styling requirements

- [ ] **Development Phase**
  - Set up PDF generation library (Puppeteer recommended)
  - Create HTML/CSS templates for layouts
  - Build API endpoint for generation
  - Implement webhook trigger from Notion

- [ ] **Integration Phase**
  - Connect to Notion database
  - Add "Generate One-Sheet" button in Notion
  - Test with real project data
  - Store/deliver PDFs (cloud storage?)

### Technical Considerations

- **PDF Library Options**:
  - Puppeteer (HTML → PDF, full control)
  - PDFKit (programmatic, more complex)
  - jsPDF (browser-based, lighter weight)

- **Template Design**:
  - Use HTML/CSS for easy styling
  - Support for images, text, links
  - Responsive to data variations

- **Storage**:
  - Store generated PDFs in cloud storage (S3, Cloudinary)
  - Or generate on-demand (may be slower)

### Decisions Made

1. **Design template**: Create based on provided screenshot example
2. **Data source**: Pull from Notion database
3. **Trigger**: Webhook from Notion
4. **Layout options**: Support both vertical and horizontal orientations

### Template Design (Based on Screenshot)

From the provided example, the one-sheet includes:
- Project title and tagline
- Year and location
- Project type/duration
- Main description paragraph
- Technical details section
- Key imagery (hero image + diagram/technical illustration)
- Clean, professional layout with good whitespace

### Implementation Approach

1. Create HTML/CSS template matching screenshot style
2. Use Puppeteer to render HTML → PDF
3. Support layout toggle (vertical/horizontal)
4. Store generated PDFs (consider Cloudinary or similar)
5. Webhook endpoint accepts Notion page ID + layout preference

---

## Priority 6: Dynamic Resume System

**Goal**: Flexible, context-specific resume generation from Notion database with multiple output formats.

### Architecture Overview

This system treats resumes as **composable, context-specific documents** rather than static files:

```
Notion Database → Selection Interface → Resume Builder → Multiple Outputs
    (Source)         (Curator)           (Generator)      (PDF, JSON, Web)
```

### Notion Database Structure

#### Roles Database
```
- Title (Title)
- Company (Text)
- Location (Text)
- Start Date (Date)
- End Date (Date)
- Description (Rich Text)
- Highlights (Multi-line Text / Bulleted List)
- Skills Used (Relation to Skills)
- Type (Select: Web Dev, Sound Design, Other)
- Include in Current Resume (Checkbox)
```

#### Education Database
```
- Institution (Title)
- Degree (Text)
- Field of Study (Text)
- Location (Text)
- Start Date (Date)
- End Date (Date)
- Highlights (Multi-line Text)
- Include in Current Resume (Checkbox)
```

#### Skills Database
```
- Name (Title)
- Category (Select: Languages, Frameworks, Tools, Audio, etc.)
- Proficiency (Select: Expert, Advanced, Intermediate, Familiar)
- Include in Current Resume (Checkbox)
```

#### Resume Configurations Database (New)
```
- Name (Title) - e.g., "Web Developer - Dropbox", "Sound Designer - Theatre"
- Target Role (Text)
- Selected Roles (Relation to Roles)
- Selected Projects (Relation to Projects)
- Selected Skills (Relation to Skills)
- Selected Education (Relation to Education)
- Summary/Objective (Rich Text)
- Layout Style (Select: Web Dev, Sound Design, Combined)
- Last Generated (Date)
- PDF URL (URL)
- Status (Select: Draft, Active, Archived)
```

### Implementation Phases

#### Phase 1: Database Setup
- [ ] Create Roles database in Notion
- [ ] Migrate resume data (web dev + sound design) to database
- [ ] Create Education database
- [ ] Create Skills database
- [ ] Create Resume Configurations database
- [ ] Set up database relations

#### Phase 2: Selection Interface (Notion-side)
- [ ] Build Notion buttons/automations for:
  - "Create New Resume Configuration"
  - "Generate Resume PDF" (triggers webhook)
  - "Sync to Website" (triggers webhook)
- [ ] Create template for new configurations
- [ ] Add validation (must have at least one role, education, etc.)

#### Phase 3: Resume Builder API
- [ ] Create `/api/generate-resume` endpoint
- [ ] Fetch selected data from Notion
- [ ] Build resume data structure
- [ ] Support multiple template styles:
  - **Web Developer** layout (like your current one)
  - **Sound Designer** layout (like your current one)
  - **Combined** layout (hybrid approach)
- [ ] Generate PDF using Puppeteer
- [ ] Store PDF in media storage
- [ ] Return URL

#### Phase 4: JSON Resume Integration
- [ ] Implement [JSON Resume](https://jsonresume.org/) schema
- [ ] Create `/api/resume.json` endpoint
- [ ] Sync "Active" resume configuration to JSON Resume format
- [ ] Display on About page using JSON Resume data
- [ ] Add "Download PDF" button

#### Phase 5: Web Display Component
- [ ] Create Resume component for About page
- [ ] Parse JSON Resume data
- [ ] Responsive layout matching site design
- [ ] Print-friendly CSS (in case someone wants to print from web)
- [ ] Download button that fetches generated PDF

### Resume Generation Workflow

```mermaid
1. User opens "Resume Configurations" in Notion
2. Clicks "Create New Resume Configuration"
3. Names it (e.g., "Web Developer - Google 2025")
4. Selects relevant:
   - Roles (check "Include in Current Resume")
   - Projects (from existing Projects database)
   - Skills (check specific ones)
   - Education (usually all, but customizable)
5. Writes custom summary for target role
6. Chooses layout style
7. Clicks "Generate Resume PDF"
8. Webhook triggers → API generates PDF
9. PDF URL stored back in Notion
10. Optional: Click "Sync to Website" to make this the active resume
11. Website updates About page with new resume data
```

### Technical Considerations

#### JSON Resume Schema
Use standard [JSON Resume](https://jsonresume.org/) format:
```json
{
  "basics": {
    "name": "Justin Johnson",
    "label": "Sound Designer, Multimedia Artist",
    "image": "...",
    "email": "...",
    "phone": "(917) 332-8125",
    "url": "https://jjohnson.art",
    "summary": "...",
    "location": {...},
    "profiles": [...]
  },
  "work": [...],
  "education": [...],
  "skills": [...],
  "projects": [...]
}
```

#### PDF Generation
- **Templates**: HTML/CSS matching your existing resume designs
- **Styles**: Store templates for different layouts
- **Puppeteer**: Render HTML → PDF
- **Page size**: Standard US Letter (8.5" × 11")
- **File naming**: `justin-johnson-resume-[config-name]-[date].pdf`

#### Storage Strategy
- **Generated PDFs**: Store in media storage (DO Spaces)
- **JSON Resume**: Store in `/public/resume.json` (updated on sync)
- **Notion URLs**: Store PDF URLs back in Notion for easy access

#### Multi-Version Support
- Can maintain multiple "active" configurations:
  - One for web dev roles
  - One for sound design roles
  - One for combined/interdisciplinary roles
- About page could have tabs or a selector
- Or just show the most recent "Active" configuration

### UI/UX Considerations

#### On Website (About Page)
```
┌─────────────────────────────────────┐
│  About                              │
│  ├── Bio + Photo                    │
│  ├── Social Links                   │
│  └── Resume Section                 │
│      ├── Interactive display        │
│      │   (from JSON Resume)         │
│      └── Download PDF button        │
│          ↓                           │
│      [Download Resume (PDF)]        │
└─────────────────────────────────────┘
```

#### In Notion
```
Resume Configurations Database View:
┌────────────────────────────────────────────────────┐
│ Name                  | Target Role  | Status | PDF │
├────────────────────────────────────────────────────┤
│ Web Dev - Google 2025 | Web Dev      | Active | 🔗  │
│ Sound Design - SPT    | Sound Design | Draft  | -   │
│ Full Stack - Startup  | Full Stack   | Active | 🔗  │
└────────────────────────────────────────────────────┘

Each row has buttons:
[Generate PDF] [Sync to Website] [Archive]
```

### Benefits of This Approach

1. **Context-Specific**: Easily create tailored resumes for different roles
2. **Single Source of Truth**: All data in Notion, no duplicate maintenance
3. **Version History**: Keep track of different resume versions
4. **Quick Updates**: Change a role description once, regenerate all relevant resumes
5. **Reusable Components**: Mix and match roles, projects, skills
6. **Multiple Outputs**: PDF for applications, JSON for website, could add DOCX
7. **Time-Saving**: Don't rebuild from scratch when job hunting
8. **Consistency**: All resumes use same data, ensuring accuracy

### Future Enhancements

- **Cover Letter Generator**: Similar system for cover letters
- **Skills Matrix**: Auto-generate based on selected roles/projects
- **ATS Optimization**: Ensure PDFs are ATS-friendly (text searchable)
- **Analytics**: Track which resume versions get downloaded most
- **LinkedIn Sync**: Auto-update LinkedIn from Notion data (via unofficial API)
- **Email Templates**: Generate email body for applications

### Integration with Existing Systems

- **Projects Database**: Already exists, just add relation
- **PDF Generator**: Reuse infrastructure from one-sheet system
- **Webhook System**: Same pattern as Notion sync
- **Media Storage**: Same storage as project media

### Comparison to Traditional Resume

#### Traditional Approach ❌
1. Maintain multiple Word/PDF files
2. Manual copy-paste for each application
3. Inconsistent formatting between versions
4. Hard to track what was sent where
5. Stale data (never updated until needed)

#### This Approach ✅
1. Single database, multiple configurations
2. Select + generate for each application
3. Consistent formatting from templates
4. Track configurations in Notion
5. Always up-to-date (projects auto-sync)

---

**Recommendation**: Implement this after the basic Notion sync is working (Priority 3) since it builds on the same infrastructure. It's more complex than a simple static resume but provides significant long-term value.

---

## Technical Stack Summary

### Current
- **Framework**: Astro 4.16.18
- **CMS**: TinaCMS 2.2.7
- **Styling**: Tailwind CSS 3.4.17
- **Language**: TypeScript 5.7.3

### Proposed Additions
- **Hosting**: Digital Ocean App Platform
- **Notion SDK**: `@notionhq/client`
- **PDF Generation**: Puppeteer (for HTML → PDF rendering)
- **Icon Library**: Lucide React (well-documented, actively maintained, tree-shakeable)
- **Webhook Handling**: Express.js API route (on Digital Ocean)
- **Analytics**: Plausible Analytics or Umami (both privacy-focused, lightweight)
- **Media Storage**: Digital Ocean Spaces (S3-compatible) or Cloudinary free tier

### Analytics Options (Free/Cheap, Non-Google)

#### Plausible Analytics (Recommended)
- **Cost**: €9/month (~$10), or self-hosted free
- **Privacy**: GDPR compliant, no cookies
- **Lightweight**: < 1KB script
- **Features**: Pageviews, referrers, top pages, devices
- **Self-hosted**: Open source, can run on DO Droplet free

#### Umami (Free Alternative)
- **Cost**: Free (self-hosted)
- **Privacy**: GDPR compliant, no cookies
- **Lightweight**: Similar to Plausible
- **Setup**: Docker container, can run on DO
- **Features**: Real-time, events, custom properties

#### Simple Analytics
- **Cost**: $19/month (pricier)
- **Privacy**: Similar to Plausible
- **Not recommended**: More expensive

#### Recommendation: Self-hosted Umami
- Free to run on Digital Ocean
- Complete data ownership
- Privacy-focused
- Easy Docker setup

---

## Next Steps

### Immediate (Before Development Begins)

1. ✅ **Clarifying questions answered**
2. ✅ **Technical approaches approved**
3. ✅ **Notion workspace confirmed** (already set up)
4. **Select hosting provider** - Recommend Vercel for free tier + easy setup

### Development Order (Approved)

1. **Content & Layout Updates** (Priority 1)
   - Video section implementation
   - Single-image project layout
   - About page with SVG social icons
   - Whitespace/padding refinements

2. **Hosting Setup** (Priority 2)
   - Set up Vercel (or chosen alternative)
   - Configure jjohnson.art domain
   - Set up environment variables
   - Initial deployment

3. **Notion Integration** (Priority 3)
   - Audit existing Notion database schema
   - Build sync script (Notion ↔ Portfolio)
   - Set up webhook endpoint
   - Implement "publish" button workflow
   - Test bi-directional content sync

4. **Blog Integration** (Priority 4)
   - Create blog section on site
   - Set up separate Notion database for blog
   - Mirror project sync architecture
   - Implement blog-specific features

5. **PDF One-Sheet Generator** (Priority 5)
   - Design template based on screenshot
   - Implement Puppeteer rendering
   - Create webhook endpoint
   - Test with real project data

6. **Resume Integration** (Priority 6)
   - Add to About page
   - Quick win, can be done anytime

---

## Resources & References

- [Astro Documentation](https://docs.astro.build)
- [Notion API Documentation](https://developers.notion.com)
- [TinaCMS Documentation](https://tina.io/docs/)
- [Puppeteer Documentation](https://pptr.dev)
- [GitHub Student Developer Pack](https://education.github.com/pack)

---

## Notes

- All changes should follow the project's coding standards (see `.github/copilot-instructions.md`)
- Security is critical for Notion integration (API keys, webhook authentication)
- Performance should be monitored, especially with Notion sync
- Consider implementing analytics to track usage and performance
