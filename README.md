# Portfolio - Astro + TinaCMS

A clean, git-based portfolio built with Astro and TinaCMS. This project was migrated from Next.js + PayloadCMS to provide a simpler, more maintainable architecture.

## 🚀 Features

- **Static Site Generation** with Astro for optimal performance
- **Git-based Content Management** with TinaCMS
- **TypeScript** support throughout
- **Tailwind CSS** for styling
- **Responsive Design** with grid-based project layout
- **MDX Support** for rich content
- **Zero Database** - all content in version control

## 📁 Project Structure

```
/
├── docs/                # Documentation
│   ├── FEATURED_PROJECTS.md    # Featured projects system guide
│   └── VISUAL_EDITOR.md        # TinaCMS visual editor guide
├── migration-backup/    # Archived migration scripts and old code
├── public/              # Static assets
│   ├── admin/           # TinaCMS admin UI
│   └── uploads/         # Media files
├── scripts/             # Development and build scripts
│   ├── dev-with-sync.mjs         # Development with live sync
│   └── notion-sync.mjs           # Notion integration (if used)
├── src/
│   ├── components/      # Astro components
│   │   ├── ProjectGrid.astro     # Intelligent grid layout
│   │   └── SidebarNav.astro      # Navigation sidebar
│   ├── content/         # Content collections (Markdown/MDX)
│   │   ├── categories/  # Project categories
│   │   ├── pages/       # Static pages (including home.mdx)
│   │   ├── posts/       # Blog posts
│   │   └── projects/    # Portfolio projects
│   ├── layouts/         # Page layouts
│   ├── pages/           # Astro pages and routes
│   │   ├── index.astro  # Homepage with featured projects logic
│   │   └── projects/    # Dynamic project pages
│   └── styles/          # Global CSS styles
├── tina/                # TinaCMS configuration and generated files
│   ├── __generated__/   # Auto-generated TinaCMS client code
│   ├── collections/     # TinaCMS schema definitions
│   │   ├── pages.ts     # Pages schema (includes featured projects)
│   │   ├── projects.ts  # Projects schema
│   │   ├── posts.ts     # Posts schema
│   │   └── categories.ts # Categories schema
│   ├── config.ts        # Main TinaCMS configuration
│   └── pages/           # TinaCMS page components
├── astro.config.mjs     # Astro configuration
├── package.json         # Dependencies and scripts
└── tailwind.config.mjs  # Tailwind CSS configuration
```

## 🛠️ Content Management

Content is managed through TinaCMS and stored as Markdown/MDX files in the `src/content/` directory.

### Collections

- **Projects** (`src/content/projects/`): Portfolio projects with rich content
- **Posts** (`src/content/posts/`): Blog posts and articles
- **Categories** (`src/content/categories/`): Project and post categories
- **Pages** (`src/content/pages/`): Static pages including homepage with featured projects

### TinaCMS Admin

Access the CMS at `/admin` when running in development mode. TinaCMS provides a visual editor for all content types.

### Featured Projects System

Featured projects are managed from the **homepage** in TinaCMS, providing centralized control with drag-and-drop ordering:

- **Manage from one place**: All featured project control in homepage frontmatter
- **Drag and drop**: Reorder featured projects visually in TinaCMS
- **Visual priority**: Featured projects automatically get larger grid cells
- **Manual curation**: Featured projects display in your specified order
- **Smart sorting**: Non-featured projects sort by year (newest first)

For detailed information, see [Featured Projects Documentation](./docs/FEATURED_PROJECTS.md).

### Visual Editing

This portfolio supports TinaCMS's **Visual Editor** for contextual editing:

- **Side-by-side Editing**: Edit content while seeing changes in real-time
- **Click-to-Edit**: Click directly on content to edit it
- **Live Preview**: Changes appear instantly as you type
- **Component-level Editing**: Edit specific fields without navigating away

The visual editor only loads when you're editing in TinaCMS (inside the iframe). On your production site, only the static content is served for optimal performance.

For detailed information, see [Visual Editor Documentation](./docs/VISUAL_EDITOR.md).

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your TinaCMS credentials:
```
PUBLIC_TINA_CLIENT_ID=your_client_id
TINA_TOKEN=your_token
```

3. Start development server:
```bash
pnpm dev
```

4. Access the site at `http://localhost:4321`
5. Access TinaCMS admin at `http://localhost:4321/admin`

## 📝 Content Creation

### Adding Projects

1. Go to `/admin` in your browser
2. Navigate to "Projects" collection
3. Click "Create New Project"
4. Fill in the project details
5. Write content in the rich text editor
6. Save and commit to git

### Project Frontmatter

```yaml
---
title: "Project Title"
description: "Brief description"
image: "/uploads/project-image.jpg"
categories: ["web", "interactive"]
featured: true
dateCompleted: 2024-01-15
yearCompleted: 2024
links:
  - title: "Live Demo"
    url: "https://example.com"
    type: "live"
  - title: "GitHub"
    url: "https://github.com/example"
    type: "github"
additionalImages:
  - "/uploads/image1.jpg"
  - "/uploads/image2.jpg"
---
```

## 🎨 Styling & Design

The site uses Tailwind CSS for styling with a clean, minimal design focused on showcasing projects.

### Key Design Features

- **Intelligent Grid Layout**: Dynamic grid with 4 cell sizes (large 2×2, wide 2×1, tall 1×2, small 1×1)
- **Smart Sizing**: Automatic distribution (15% large, 23% wide, 25% tall, 37% small)
- **Featured Prioritization**: Featured projects automatically get first pick of larger cells
- **Gap Prevention**: Correction pass downsizes cells in incomplete rows to prevent gaps
- **Responsive Design**: 3/2/1 column layout for desktop/tablet/mobile
- **Smooth Animations**: Subtle hover effects and transitions
- **Typography**: Clean, readable typography with proper hierarchy

### Grid System Architecture

The `ProjectGrid.astro` component implements a 4-pass sizing system:

1. **Size Distribution**: Allocate percentages of each cell size
2. **Shuffle**: Randomize for visual variety
3. **Priority Assignment**: Featured projects get larger cells first
4. **Correction Pass**: Fix incomplete last rows to prevent gaps

See component comments for detailed implementation notes.

### Customization

- Modify styles in `src/styles/global.css`
- Update Tailwind config in `tailwind.config.mjs`
- Customize components in `src/components/`
- Adjust grid size percentages in `ProjectGrid.astro`

## 🚀 Deployment

### Build

```bash
pnpm build
```

This generates a static site in the `dist/` directory.

### Deploy Options

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

#### Netlify
1. Connect repository to Netlify
2. Build command: `pnpm build`
3. Publish directory: `dist`
4. Set environment variables

#### Other Static Hosts
Deploy the `dist/` folder to any static hosting service.

## 🔧 Development

### Available Scripts

- `pnpm dev` - Start development server with TinaCMS
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm astro` - Run Astro CLI commands
- `pnpm dev:sync` - Development server with live sync (if configured)
- `pnpm notion:export` - Export content from Notion (if integrated)

### Adding New Components

Create Astro components in `src/components/`:

```astro
---
// Component.astro
export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<div class="component">
  <h2>{title}</h2>
  <slot />
</div>
```

### Creating New Pages

Add `.astro` files to `src/pages/`:

```astro
---
// src/pages/new-page.astro
import Layout from '../layouts/Layout.astro';
---

<Layout title="New Page">
  <h1>New Page</h1>
</Layout>
```

## 📊 Migration from PayloadCMS

This project was migrated from Next.js + PayloadCMS. Key changes:

### Benefits of New Architecture
- **Simplified Deployment**: No database required
- **Better Performance**: Static site generation
- **Version Control**: Content in git
- **Easier Maintenance**: Fewer dependencies
- **Better DX**: Faster development builds

### Migration Steps
1. Export content from PayloadCMS
2. Convert to Markdown/MDX format
3. Move media files to `public/uploads/`
4. Update internal links and references
5. Test content rendering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use this as a template for your own portfolio.

## 📚 Documentation

- [Featured Projects System](./docs/FEATURED_PROJECTS.md) - Complete guide to managing featured projects
- [Visual Editor Guide](./docs/VISUAL_EDITOR.md) - TinaCMS visual editing features and usage

## 🆘 Support

For questions or issues:
- Check the [Astro documentation](https://docs.astro.build)
- Review [TinaCMS docs](https://tina.io/docs/)
- Review project documentation in the `docs/` folder
- Open an issue in this repository
