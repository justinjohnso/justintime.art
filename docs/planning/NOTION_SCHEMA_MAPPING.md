# Notion to Portfolio Schema Mapping

Documentation of Notion database structure and how it maps to the portfolio's project schema.

**Last Updated**: October 16, 2025  
**Notion Workspace**: https://dusty-pineapple.notion.site

---

## Current Portfolio Schema

### Project Fields (TinaCMS)

Located in `tina/collections/projects.ts`:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✅ | Project title |
| `description` | string (textarea) | ❌ | Brief description |
| `image` | image | ❌ | Featured/hero image |
| `mediaEmbed` | string (textarea) | ❌ | YouTube/Vimeo/SoundCloud URL |
| `categories` | string[] | ❌ | Array of category tags |
| `dateCompleted` | datetime | ❌ | Full completion date (YYYY-MM-DD) |
| `yearCompleted` | number | ❌ | Year only (for display) |
| `links` | object[] | ❌ | Array of link objects |
| `links[].title` | string | ❌ | Link display text |
| `links[].url` | string | ❌ | Link URL |
| `links[].type` | string | ❌ | 'github', 'live', 'demo', 'other' |
| `additionalImages` | image[] | ❌ | Gallery images |
| `body` | rich-text | ❌ | Main project content (MDX) |

### Rich Text Templates

Custom content blocks available in `body`:

1. **Banner**: Heading + subheading
2. **MediaBlock**: Image + caption
3. **CodeBlock**: Code with syntax highlighting

---

## Notion Database Structure

**Audited from**: https://dusty-pineapple.notion.site/Portfolio-Projects  
**Database Name**: 🗂️ Portfolio Projects

### Actual Fields

| Notion Field | Type | Portfolio Mapping | Notes |
|--------------|------|-------------------|-------|
| **Title** | Title | → `title` | Primary identifier |
| **Categories** | Multi-select | → `categories[]` | Project categories/tags |
| **Description** | Text | → `description` | Brief project summary |
| **Hero Image File** | File | → `image` | Main/featured image |
| **Additional Image Files** | Files | → `additionalImages[]` | Gallery images |
| **Media Embed** | Text/URL | → `mediaEmbed` | YouTube/Vimeo/SoundCloud URL |
| **Slug** | Text | → filename | Used for URL/filename |
| **Status** | Select | Filter `published` | Draft vs Published |
| **Year** | Number | → `yearCompleted` | Completion year |
| **Links (Rich Text)** | Rich Text | → `links[]` | Needs parsing |
| **Page Content** | Rich Text | → `body` | Main project content (in page) |

### Field Mapping Details

#### Simple 1:1 Mappings
- ✅ **Title** → `title` (direct string)
- ✅ **Description** → `description` (direct string)
- ✅ **Year** → `yearCompleted` (direct number)
- ✅ **Media Embed** → `mediaEmbed` (direct string)
- ✅ **Slug** → Used for filename generation

#### Complex Mappings Needed
- ⚠️ **Categories** (Multi-select) → `categories[]` (string array)
- ⚠️ **Hero Image File** (Notion file) → `image` (local file path)
- ⚠️ **Additional Image Files** (Notion files) → `additionalImages[]` (local file paths)
- ⚠️ **Links (Rich Text)** → `links[]` (structured objects with title/url/type)
- ⚠️ **Page Content** (Notion blocks) → `body` (MDX rich-text)

### Questions Resolved

1. ✅ **Field Names**: Documented above
2. ✅ **Categories**: Multi-select field
3. ⚠️ **Links**: Rich text field - needs parsing to extract structured data
4. ✅ **Images**: Separate fields - one for hero, one for additional (files array)
5. ✅ **Status Field**: Select field for draft/published filtering
6. ⚠️ **Date Format**: Only Year field (number) - no full date field currently
7. ❓ **Rich Text**: Need to inspect actual page content to see block types used

---

## Mapping Strategy

### One-Way Sync (Notion → Portfolio)

**Phase 1 Approach**: Pull data from Notion, don't push back.

**Rationale**:
- Simpler to implement
- Notion is source of truth
- Layout changes stay in portfolio
- Content updates flow from Notion

### Bi-Directional Sync (Future)

**Phase 2 Enhancement**: Allow content edits to flow back to Notion.

**Challenges**:
- Conflict resolution needed
- Layout data shouldn't sync back
- Notion API write limits
- More complex error handling

---

## Field-by-Field Mapping

### Simple 1:1 Mappings

Fields that map directly:

```typescript
{
  title: notionPage.properties.Title.title[0].plain_text,
  description: notionPage.properties.Description.rich_text[0]?.plain_text,
  yearCompleted: notionPage.properties.Year.number,
  // etc...
}
```

### Complex Mappings

#### Categories Array

Notion multi-select → String array:

```typescript
categories: notionPage.properties.Categories.multi_select.map(
  cat => cat.name
)
```

#### Links Array

Notion relation/database → Object array:

```typescript
links: notionLinksDB.map(link => ({
  title: link.properties.Title.title[0].plain_text,
  url: link.properties.URL.url,
  type: link.properties.Type.select.name.toLowerCase()
}))
```

#### Rich Text Content

Notion blocks → MDX:

```typescript
// Will need block-by-block conversion
// Notion paragraph → Markdown paragraph
// Notion heading → MDX heading
// Notion image → MDX image block
// Notion code → MDX code block
```

### Media Handling

#### Images

- Featured image: Download from Notion → Save to `/public/media/`
- Gallery images: Download all → Save with project slug prefix

#### Video Embeds

- Extract URL from Notion
- Validate format (YouTube/Vimeo/SoundCloud)
- Convert to proper embed URL if needed

---

## Sync Script Requirements

### Minimum Viable Sync

```typescript
// Pseudocode based on actual Notion schema
async function syncProjects() {
  // 1. Fetch published projects from Notion
  const notionProjects = await notion.databases.query({
    database_id: process.env.NOTION_PROJECTS_DB,
    filter: { property: 'Status', select: { equals: 'Published' } }
  });

  // 2. For each project
  for (const notionProject of notionProjects) {
    const props = notionProject.properties;
    
    // 3. Map simple fields
    const projectData = {
      title: props.Title.title[0]?.plain_text,
      description: props.Description.rich_text[0]?.plain_text,
      yearCompleted: props.Year.number,
      mediaEmbed: props['Media Embed'].rich_text[0]?.plain_text,
      categories: props.Categories.multi_select.map(c => c.name),
      slug: props.Slug.rich_text[0]?.plain_text,
    };
    
    // 4. Download hero image
    if (props['Hero Image File'].files[0]) {
      const heroUrl = props['Hero Image File'].files[0].file.url;
      projectData.image = await downloadImage(heroUrl, projectData.slug);
    }
    
    // 5. Download additional images
    projectData.additionalImages = [];
    for (const file of props['Additional Image Files'].files) {
      const imagePath = await downloadImage(file.file.url, projectData.slug);
      projectData.additionalImages.push(imagePath);
    }
    
    // 6. Parse links from rich text
    projectData.links = parseLinksFromRichText(props['Links (Rich Text)']);
    
    // 7. Fetch page content and convert to MDX
    const pageBlocks = await notion.blocks.children.list({
      block_id: notionProject.id
    });
    const mdxContent = await convertNotionBlocksToMDX(pageBlocks);
    
    // 8. Write MDX file to src/content/projects/{slug}.mdx
    await writeProjectFile(projectData, mdxContent);
  }

  // 9. Trigger git commit (optional)
  // 10. Trigger Astro rebuild
}
```

### Error Handling

- Missing required fields → Skip project + log warning
- Invalid dates → Use year only or skip
- Image download failures → Use placeholder or skip
- Rich text conversion errors → Log + manual review needed

---

## Implementation Phases

### Phase 1: Audit & Document ✅

- [x] Access Notion database
- [x] Document all field names and types
- [x] Update document with actual schema
- [ ] Test access with Notion API token

### Phase 2: Schema Mapping

- [ ] Create TypeScript types for Notion schema
- [ ] Implement simple field mappers (title, description, year, etc.)
- [ ] Implement Categories multi-select → string array mapper
- [ ] Implement Links rich text → structured array parser
- [ ] Handle edge cases (missing data, nulls, empty arrays)
- [ ] Test mapping with sample project data

### Phase 3: Media Handling

- [ ] Implement Hero Image downloader (Notion URL → local file)
- [ ] Implement Additional Images downloader (array handling)
- [ ] Create filename generation logic (slug-based)
- [ ] Handle media embed validation (YouTube/Vimeo/SoundCloud)
- [ ] Test with projects containing images

### Phase 4: Rich Text Conversion

- [ ] Fetch Notion page blocks (content)
- [ ] Convert Notion blocks → MDX
  - [ ] Paragraph → MDX paragraph
  - [ ] Heading → MDX heading
  - [ ] Image → MDX image block
  - [ ] Code → MDX code block
  - [ ] Lists → MDX lists
- [ ] Handle custom TinaCMS templates (Banner, MediaBlock, CodeBlock)
- [ ] Test conversion with complex content

### Phase 5: Sync Script Implementation

- [ ] Set up Notion SDK (@notionhq/client)
- [ ] Create environment variables (NOTION_API_KEY, NOTION_PROJECTS_DB)
- [ ] Implement database query with Status filter
- [ ] Wire up all mappers and converters
- [ ] Implement file writing to src/content/projects/
- [ ] Add error handling and logging
- [ ] Test end-to-end sync with one project

### Phase 6: Automation & Polish

- [ ] Add CLI script (npm run sync-notion)
- [ ] Add dry-run mode for testing
- [ ] Add verbose logging option
- [ ] Document usage in README
- [ ] Test with all existing projects
- [ ] Handle duplicate detection/updates

### Phase 7: Webhook Integration (Future)

- [ ] Create webhook endpoint in Astro
- [ ] Verify Notion webhook signatures
- [ ] Trigger sync on specific events (publish, update)
- [ ] Add rate limiting
- [ ] Add error notifications (email/Slack)

---

## Next Steps

1. **Access Notion database** to audit actual field structure
2. **Update this document** with real field names and types
3. **Create sample mappings** for 2-3 projects
4. **Build proof of concept** sync script
5. **Test with one project** end-to-end

---

## Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js)
- [Notion to Markdown](https://github.com/souvikinator/notion-to-md)
- Current embedUtils: `src/utils/embedUtils.ts`
