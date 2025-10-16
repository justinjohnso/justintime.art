# Video & Media Embed System

This project has a built-in system for embedding videos and audio from YouTube, Vimeo, and SoundCloud.

## How It Works

### Embed Utility

**Location**: `src/utils/embedUtils.ts`

The `getEmbedInfo()` function automatically detects the platform and generates the appropriate embed URL.

```typescript
import { getEmbedInfo } from '@/utils/embedUtils';

const embedInfo = getEmbedInfo('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
// Returns: { type: 'youtube', embedUrl: '...', aspectRatio: '16/9' }
```

### Supported Platforms

#### YouTube
- Standard URLs: `https://www.youtube.com/watch?v=VIDEO_ID`
- Short URLs: `https://youtu.be/VIDEO_ID`
- Embed URLs are automatically generated with player parameters

#### Vimeo
- Standard URLs: `https://vimeo.com/VIDEO_ID`
- Automatically uses Vimeo's player embed

#### SoundCloud
- Widget URLs: Use the full SoundCloud widget URL
- Passed through directly to iframe

## Usage in Projects

### Adding a Video/Audio Embed

In your project frontmatter (MDX file), add the `mediaEmbed` field:

```yaml
---
title: My Project
mediaEmbed: https://www.youtube.com/watch?v=dQw4w9WgXcQ
# ... other fields
---
```

The embed will automatically be rendered in the project page layout.

### Current Implementation

Embeds are currently rendered in **Row 3** of the project layout, in a 2-column grid alongside images or body text.

```astro
<!-- In src/pages/projects/[slug].astro -->
const embedInfo = project.data.mediaEmbed ? getEmbedInfo(project.data.mediaEmbed) : null;

<!-- Later in template -->
{embedInfo && (
  <iframe src={embedInfo.embedUrl} ... />
)}
```

## Technical Details

### Aspect Ratios

All embeds default to **16/9** aspect ratio:
- YouTube: 16/9
- Vimeo: 16/9
- SoundCloud: 16/9 (minimum height: 350px)

### Iframe Parameters

**YouTube embeds include:**
- Autoplay disabled
- Related videos from same channel only
- Modest branding

**Vimeo embeds use:**
- Standard player settings
- Responsive sizing

**SoundCloud embeds:**
- Full widget functionality
- Scrolling disabled
- Autoplay allowed

### Accessibility

All iframes include:
- `title` attribute (project title)
- `allow` attribute for required permissions
- `allowfullscreen` for video players

## Schema Definition

### TinaCMS Schema

**Location**: `tina/collections/projects.ts`

```typescript
{
  type: 'string',
  name: 'mediaEmbed',
  label: 'Media Embed URL',
  description: 'YouTube, Vimeo, or SoundCloud URL',
}
```

### Content Collection Schema

**Location**: `src/content/config.ts`

```typescript
mediaEmbed: z.string().optional(),
```

## Examples

### YouTube Video

```yaml
---
title: Demo Video Project
mediaEmbed: https://www.youtube.com/watch?v=dQw4w9WgXcQ
---
```

### Vimeo Video

```yaml
---
title: Vimeo Showcase
mediaEmbed: https://vimeo.com/123456789
---
```

### SoundCloud Track

```yaml
---
title: Audio Project
mediaEmbed: https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789
---
```

## Layout Behavior

### With Embed

When `mediaEmbed` is provided:
1. Embed renders in Row 3 (left column)
2. Body text renders in Row 3 (right column)
3. Minimum height: 350px

### Without Embed

When no `mediaEmbed` is provided:
1. Row 3 shows `row3Image` (if available)
2. Or body text spans full width

## Known Limitations

### Current Layout
- Embeds are mixed with images/text in grid layout
- Not in a dedicated section under hero
- Limited control over placement

### Future Enhancements (from roadmap)
- [ ] Move videos to dedicated section under hero
- [ ] Separate video content from other media
- [ ] More granular aspect ratio control
- [ ] Multiple videos per project
- [ ] Video captions/descriptions

## Troubleshooting

### Embed not appearing

1. **Check URL format**: Must be a valid YouTube, Vimeo, or SoundCloud URL
2. **Check console**: `embedUtils.ts` logs parsing errors
3. **Verify field**: Ensure `mediaEmbed` is set in frontmatter

### Wrong aspect ratio

Currently all embeds default to 16/9. Custom aspect ratios require code changes in `embedUtils.ts`:

```typescript
return {
  type: 'youtube',
  embedUrl: '...',
  aspectRatio: '4/3', // Change here
}
```

### SoundCloud not loading

SoundCloud requires the full widget URL, not the track URL:
- ❌ `https://soundcloud.com/artist/track`
- ✅ `https://w.soundcloud.com/player/?url=...`

Get the widget URL from SoundCloud's "Share" → "Embed" option.

## Performance Considerations

- **Lazy loading**: Not currently implemented
- **Iframe overhead**: Each embed adds ~100-200KB
- **Multiple embeds**: Consider impact on page load time
- **Mobile**: Embeds are responsive but may be bandwidth-intensive

## Security

All iframes use:
- `frameborder="0"` (legacy support)
- Specific `allow` permissions
- Trusted embed domains only

No user-generated URLs are allowed - all embeds come from project frontmatter.

## Related Files

- `src/utils/embedUtils.ts` - Embed detection and URL generation
- `src/pages/projects/[slug].astro` - Project page layout with embed rendering
- `tina/collections/projects.ts` - TinaCMS schema definition
- `src/content/config.ts` - Content collection schema
