# TinaCMS Visual Editor Integration

This document explains the visual editor setup for the Astro + TinaCMS portfolio.

## Overview

The visual editor enables contextual editing in TinaCMS, where you can edit content side-by-side with a live preview. Changes appear instantly as you type, and you can click directly on content to edit it.

## Architecture

### 1. Custom Astro Directive (`client:tina`)

Located in `astro-tina-directive/`:

- **`tina.js`**: Client directive that only hydrates React components when inside TinaCMS iframe
- **`register.js`**: Registers the custom directive with Astro
- **`index.d.ts`**: TypeScript definitions for the directive

This directive ensures visual editor components only load in TinaCMS, not in production.

### 2. Content Config with TinaCMS Client

`src/content.config.ts` uses the TinaCMS client to load content:

```typescript
export const projects = defineCollection({
  loader: async () => {
    const projectsResponse = await client.queries.projectsConnection();
    return projectsResponse.data.projectsConnection.edges?.map(/* ... */);
  },
  // ...
});
```

This approach:
- Fetches data from TinaCMS GraphQL API
- Provides type-safe content access
- Enables real-time updates in visual editor

### 3. React Wrapper Components

`tina/pages/ProjectPage.tsx` wraps project content with the `useTina` hook:

```tsx
export default function ProjectPage(props: Props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  // Render with data-tina-field attributes
  return (
    <article>
      <h1 data-tina-field={tinaField(project, "title")}>
        {project.title}
      </h1>
      {/* ... */}
    </article>
  );
}
```

Key features:
- `useTina` hook enables live updates
- `tinaField` helper marks editable fields
- `data-tina-field` attributes enable click-to-edit

### 4. Page Integration

Project pages in `src/pages/projects/[slug].astro`:

```astro
---
export async function getStaticPaths() {
  const projects = await getCollection('projects');

  return projects.map((project) => ({
    params: { slug: project.id },
    props: {
      project,
      getTinaProps: async () =>
        client.queries.projects({
          relativePath: project.data.tinaInfo.relativePath,
        }),
    },
  }));
}

const { getTinaProps } = Astro.props;
const tinaProps = await getTinaProps();
---

<main>
  <!-- Visual Editor (only in TinaCMS iframe) -->
  <ProjectPage {...tinaProps} client:tina />

  <!-- Static content (for production) -->
  <article>
    <!-- Your existing content -->
  </article>
</main>
```

## How It Works

### In TinaCMS Admin (`/admin`)

1. Navigate to a project in the CMS
2. The page loads in an iframe
3. `client:tina` directive detects iframe context
4. React component hydrates with `useTina` hook
5. Content becomes editable with live updates
6. Click on any field to edit it instantly

### In Production

1. `client:tina` directive detects no iframe
2. React component does not hydrate
3. Only static Astro content is served
4. Optimal performance with zero JavaScript overhead

## Environment Setup

Required environment variables:

```env
# Astro-compatible (PUBLIC_ prefix for client-side access)
PUBLIC_TINA_CLIENT_ID=your_client_id

# Also keep Next.js format for compatibility
NEXT_PUBLIC_TINA_CLIENT_ID=your_client_id

# Server-side token
TINA_TOKEN=your_token
```

## File Structure

```
/
├── astro-tina-directive/       # Custom Astro directive
│   ├── tina.js                 # Directive implementation
│   ├── register.js             # Astro integration
│   └── index.d.ts              # TypeScript definitions
├── src/
│   ├── content.config.ts       # Content collections with TinaCMS client
│   └── pages/
│       └── projects/
│           └── [slug].astro    # Dynamic project pages with visual editor
├── tina/
│   ├── config.ts               # TinaCMS configuration
│   ├── pages/                  # React wrapper components
│   │   └── ProjectPage.tsx     # Project visual editor component
│   └── __generated__/          # Auto-generated types and client
│       ├── client.ts
│       └── types.ts
└── astro.config.mjs            # Astro config with tina directive
```

## Benefits

1. **Contextual Editing**: Edit content in place, see changes live
2. **Better UX**: Click-to-edit is faster than navigating forms
3. **Type Safety**: Full TypeScript support throughout
4. **Performance**: Zero impact on production builds
5. **Flexibility**: Can mix visual and traditional editing

## Development Workflow

1. **Start dev server**:
   ```bash
   pnpm tina:dev
   ```

2. **Access CMS**: Navigate to `/admin`

3. **Edit content**:
   - Use traditional forms, OR
   - Click "Edit" to open visual editor
   - See changes instantly

4. **Save & commit**: Changes save to git automatically

## Extending to Other Collections

To add visual editing to other collections:

1. Create a React wrapper component in `tina/pages/`
2. Use the `useTina` hook with appropriate query
3. Add `data-tina-field` attributes to editable elements
4. Update page to fetch via TinaCMS client
5. Add component with `client:tina` directive

Example for posts:

```tsx
// tina/pages/PostPage.tsx
export default function PostPage(props: Props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const post = data.posts;

  return (
    <article>
      <h1 data-tina-field={tinaField(post, "title")}>
        {post.title}
      </h1>
      <div data-tina-field={tinaField(post, "body")}>
        <TinaMarkdown content={post.body} />
      </div>
    </article>
  );
}
```

## Troubleshooting

### Visual editor not loading
- Ensure you're accessing via `/admin`
- Check browser console for errors
- Verify `client:tina` directive is registered in `astro.config.mjs`

### Changes not reflecting
- Restart the dev server
- Check TinaCMS is running: `http://localhost:4001/graphql`
- Verify environment variables are set

### TypeScript errors
- Run `pnpm tina:build` to regenerate types
- Check `tina/__generated__/types.ts` for latest schema

## Related Documentation

- [Featured Projects Guide](./FEATURED_PROJECTS.md) - Grid system implementation
- [Project Roadmap](../PROJECT_ROADMAP.md) - Development planning and priorities

## External Resources

- [TinaCMS Visual Editing Docs](https://tina.io/docs/contextual-editing/react/)
- [Astro + TinaCMS Starter](https://github.com/tinacms/tina-astro-starter)
- [TinaCMS Data Fetching](https://tina.io/docs/features/data-fetching/)
