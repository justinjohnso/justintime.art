# Featured Projects System

This portfolio implements an intelligent featured projects system that prioritizes selected projects in the grid layout and provides centralized control through TinaCMS.

## Overview

The featured projects system allows you to:
- **Select featured projects** from the homepage in TinaCMS
- **Drag and drop** to reorder featured projects
- **Automatically prioritize** featured projects for larger grid cells
- **Control everything from one place** (no per-project toggles needed)

## How It Works

### Content Management

Featured projects are managed exclusively from the **homepage** in TinaCMS:

1. Navigate to `/admin` in your browser
2. Click on "Pages" in the sidebar
3. Select the "Home" page
4. Scroll to the "Featured Projects" field
5. Click "Add Item" to add a project to the featured list
6. Drag and drop items to reorder them
7. Save and commit your changes

### Technical Architecture

#### 1. Data Structure

Featured projects are stored in the homepage frontmatter (`src/content/pages/home.mdx`) as an object list with project references:

```yaml
featuredProjects:
  - project: src/content/projects/look-listen.mdx
  - project: src/content/projects/finding-home.mdx
  - project: src/content/projects/eurydice.mdx
```

#### 2. Project Sorting

The homepage (`src/pages/index.astro`) implements a two-tier sorting system:

**Featured Projects** (displayed first):
- Sorted by the order they appear in the homepage `featuredProjects` list
- This allows you to manually curate the exact order of featured projects

**Non-Featured Projects** (displayed after):
- Sorted by `yearCompleted` (newest first)
- Provides a sensible default ordering for the rest of the portfolio

```typescript
// Extract featured project order from homepage
const featuredProjectOrder = (homePage.data.featuredProjects || []).map((item, index) => {
  const match = item.project?.match(/projects\/(.+)\.mdx$/);
  return { slug: match ? match[1] : null, order: index };
});

// Sort featured by homepage order
featuredProjects.sort((a, b) => {
  const orderA = featuredProjectOrder.find(item => item.slug === a.slug)?.order ?? 999;
  const orderB = featuredProjectOrder.find(item => item.slug === b.slug)?.order ?? 999;
  return orderA - orderB;
});

// Sort non-featured by year (newest first)
nonFeaturedProjects.sort((a, b) => {
  return (b.data.yearCompleted || 0) - (a.data.yearCompleted || 0);
});
```

#### 3. Grid Layout Prioritization

The `ProjectGrid.astro` component implements a smart sizing system that gives featured projects visual prominence:

**Grid Cell Sizes:**
- **Large** (2×2): 15% of projects
- **Wide** (2×1): 23% of projects
- **Tall** (1×2): 25% of projects
- **Small** (1×1): 37% of projects

**Prioritization Logic:**

1. **Size Distribution**: Creates a pool of available sizes based on percentages
2. **Shuffle**: Randomizes the order for visual variety
3. **Featured First**: Featured projects get first pick of larger sizes (large → tall → wide → small)
4. **Non-Featured Next**: Remaining projects get assigned with an interleaved pattern
5. **Correction Pass**: Downsizes cells in incomplete last rows to prevent gaps

```typescript
// Featured projects get priority on larger sizes
const sizePriority = ['large', 'tall', 'wide', 'small'];

featuredProjects.forEach(project => {
  for (const size of sizePriority) {
    if (sizeIndices[size] < positionsBySize[size].length) {
      const posIndex = sizeIndices[size]++;
      finalSizes[project.originalIndex] = sizes[positionsBySize[size][posIndex]];
      break;
    }
  }
});
```

## TinaCMS Configuration

### Schema Setup

The TinaCMS schema for pages includes a featured projects field with drag-and-drop support:

```typescript
{
  name: 'featuredProjects',
  label: 'Featured Projects',
  type: 'object',
  list: true,
  ui: {
    itemProps: (item) => {
      // Convert slug to readable label
      const slug = item?.project?.match(/projects\/(.+)\.mdx$/)?.[1];
      const label = slug
        ?.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label: label || 'Untitled Project' };
    },
  },
  fields: [
    {
      name: 'project',
      label: 'Project',
      type: 'reference',
      collections: ['projects'],
      required: true,
    },
  ],
}
```

**Key Features:**
- **Object list**: Enables drag-and-drop functionality (string lists don't support this)
- **Reference field**: Creates a relationship to the projects collection
- **Custom labels**: Displays readable project titles instead of file paths
- **Title Case conversion**: Transforms kebab-case slugs into readable names

## Usage Guide

### Adding a Featured Project

1. Open `/admin` in your browser
2. Navigate to Pages → Home
3. Scroll to "Featured Projects"
4. Click "Add Item"
5. Select a project from the dropdown
6. The project will appear in the list with a readable title
7. Save your changes

### Reordering Featured Projects

1. Open the "Featured Projects" section
2. Hover over a project in the list
3. Click and drag the handle (six dots) on the left
4. Drop the project in the desired position
5. The grid will automatically update to reflect the new order
6. Save your changes

### Removing a Featured Project

1. Open the "Featured Projects" section
2. Find the project you want to remove
3. Click the trash icon on the right side
4. The project will move to the non-featured section, sorted by year
5. Save your changes

### Visual Preview

Changes to featured projects are immediately visible in the TinaCMS visual editor. You'll see:
- Projects moving position in the grid
- Size changes as featured projects get priority for larger cells
- The overall layout adjusting automatically

## Best Practices

### How Many Featured Projects?

There's no hard limit, but consider:
- **3-6 projects**: Creates clear visual hierarchy without overwhelming
- **More than 10**: May dilute the impact of "featured" status
- **Quality over quantity**: Feature your absolute best work

### When to Use Featured Projects

Feature projects that:
- Represent your current direction and capabilities
- Are most relevant to your target audience
- Showcase diverse skills or approaches
- Are recent and reflect your current work quality

### Ordering Strategy

Consider ordering by:
- **Impact**: Most impressive projects first
- **Relevance**: Most relevant to your current goals
- **Recency**: Mix of recent and older work
- **Variety**: Alternate between different types of projects

## Troubleshooting

### Project not appearing in dropdown

**Cause**: The project may not be published or the MDX file may have errors.

**Solution**: Check that:
1. The project file exists in `src/content/projects/`
2. The frontmatter is valid YAML
3. Required fields are filled in
4. The file doesn't have syntax errors

### Drag and drop not working

**Cause**: This was a bug that has been fixed by converting from string list to object list.

**Solution**: If you still experience issues:
1. Clear your browser cache
2. Refresh the TinaCMS admin page
3. Check the browser console for errors
4. Ensure you're using the latest version of TinaCMS

### Grid layout not updating

**Cause**: The client-side layout script may not be running.

**Solution**:
1. Check the browser console for JavaScript errors
2. Ensure `window.relayoutProjectGrid()` is being called
3. Try refreshing the page
4. Verify that the project data is being passed correctly

### Featured project showing wrong size

**Cause**: The grid correction pass may be downsizing cells in incomplete rows.

**Solution**: This is expected behavior to prevent gaps in the grid. Featured projects still get priority for larger sizes, but may be downsized if they're in the last row and would create gaps.

## Future Enhancements

Possible improvements to consider:

1. **Per-Category Featured Projects**: Allow different featured projects for different category views
2. **Featured Project Analytics**: Track which featured projects get the most engagement
3. **Automatic Featured Rotation**: Automatically cycle through projects over time
4. **Visual Size Control**: Allow manual control over grid cell sizes for specific projects
5. **Featured Expiration**: Automatically unfeature projects after a certain date

## Migration Notes

### Previous Implementation

Earlier versions of this portfolio used per-project featured toggles. This created issues:
- **Dual sources of truth**: Featured status defined in two places
- **Hard to manage**: Required editing individual project files
- **No ordering control**: Featured projects sorted by year like everything else

### Current Implementation

The current system centralizes control:
- **Single source of truth**: Homepage frontmatter only
- **Easy management**: Drag and drop in TinaCMS
- **Ordering control**: Manual control over featured project order
- **Better UX**: Visual editor shows immediate feedback

### Migration Path

If upgrading from the old system:

1. Note which projects have `featured: true` in their frontmatter
2. Add those projects to the homepage "Featured Projects" list
3. Remove `featured: true` from all project MDX files
4. Reorder the homepage list as desired
5. Test the grid layout to ensure proper prioritization

## Related Documentation

- [Visual Editor Guide](./VISUAL_EDITOR.md) - TinaCMS visual editing features
- [README.md](../README.md) - General project documentation
