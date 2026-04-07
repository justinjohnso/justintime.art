# Video & Media Embed System

This project has a built-in system for embedding videos and audio from YouTube, Vimeo, SoundCloud, direct audio files, and direct video files.

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

### Adding Video/Audio Embeds

In your project frontmatter (MDX file), add the `mediaEmbed` field for the first media item:

```yaml
---
title: My Project
mediaEmbed: https://www.youtube.com/watch?v=dQw4w9WgXcQ
mediaEmbedLabel: Watch trailer
# ... other fields
---
```

To add multiple media items, use `mediaEmbeds`:

```yaml
---
title: My Project
mediaEmbed: https://www.youtube.com/watch?v=dQw4w9WgXcQ
mediaEmbedLabel: Watch trailer
mediaEmbeds:
  - url: https://vimeo.com/123456789
    label: Watch full performance
  - url: https://www.dropbox.com/scl/fi/abcd/demo.mp4?raw=1
    label: Watch demo clip
---
```

All valid media URLs are rendered as separate embeds on the project page.

### Current Implementation

Embeds are rendered in the dedicated media section of the project layout.

```astro
<!-- In src/pages/projects/[slug].astro -->
const mediaEmbeds = [
  project.data.mediaEmbed,
  ...(project.data.mediaEmbeds || []).map((item) => item?.url),
]

<!-- Later in template -->
{mediaEmbeds.map((media) => (
  <iframe src={media.embedUrl} ... />
))}
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
}
{
  type: 'string',
  name: 'mediaEmbedLabel',
  label: 'Media Link Label',
}
{
  type: 'object',
  name: 'mediaEmbeds',
  list: true,
}
```

### Content Collection Schema

**Location**: `src/content/config.ts`

```typescript
mediaEmbed: z.string().optional(),
mediaEmbedLabel: z.string().optional(),
mediaEmbeds: z.array(z.object({ url: z.string().optional(), label: z.string().optional() })).optional(),
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

### With Embed(s)

When `mediaEmbed` and/or `mediaEmbeds` are provided:
1. Media links appear in the project links area
2. Link labels use custom labels when set
3. Each media item renders in sequence in the media section
4. Minimum height is maintained for embedded players

### Without Embed

When no `mediaEmbed` is provided:
1. Row 3 shows `row3Image` (if available)
2. Or body text spans full width

## Known Limitations

### Current Layout
- Multiple media embeds are supported
- First media can use `mediaEmbed`, additional media can use `mediaEmbeds`
- Link labels are configurable with `mediaEmbedLabel` and per-item `label`

### Future Enhancements (from roadmap)
- [ ] More granular aspect ratio control
- [ ] Optional media captions/descriptions in layout

## Troubleshooting

### Embed not appearing

1. **Check URL format**: Must be a valid YouTube, Vimeo, or SoundCloud URL
2. **Check console**: `embedUtils.ts` logs parsing errors
3. **Verify fields**: Ensure `mediaEmbed` or `mediaEmbeds` are set in frontmatter

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
