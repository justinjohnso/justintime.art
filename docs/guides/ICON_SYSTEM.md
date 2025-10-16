# Icon System

This project uses [Lucide React](https://lucide.dev) for icons - a beautiful, consistent, and tree-shakeable icon library.

## Components

### `<Icon>` Component

The main icon component for use throughout the site.

**Location**: `src/components/Icon.astro`

**Usage**:
```astro
---
import Icon from '@/components/Icon.astro';
---

<!-- Basic usage -->
<Icon name="Github" />

<!-- Custom size -->
<Icon name="Mail" size={32} />

<!-- Custom styling -->
<Icon name="Linkedin" class="text-blue-500 hover:text-blue-700" />

<!-- Custom stroke width -->
<Icon name="Heart" strokeWidth={3} />

<!-- Custom aria label -->
<Icon name="ExternalLink" ariaLabel="Open in new tab" />
```

### `<SocialLinks>` Component

Pre-configured social media links component.

**Location**: `src/components/SocialLinks.astro`

**Usage**:
```astro
---
import SocialLinks from '@/components/SocialLinks.astro';
---

<!-- Use default links (GitHub, LinkedIn, Email) -->
<SocialLinks />

<!-- Custom size -->
<SocialLinks size={28} />

<!-- Custom styling -->
<SocialLinks class="justify-center my-8" />

<!-- Custom links -->
<SocialLinks links={[
  {
    name: 'Twitter',
    url: 'https://twitter.com/yourusername',
    icon: 'Twitter',
    ariaLabel: 'Follow me on Twitter'
  },
  {
    name: 'Instagram',
    url: 'https://instagram.com/yourusername',
    icon: 'Instagram',
    ariaLabel: 'Follow me on Instagram'
  }
]} />
```

## Available Icons

Browse the full icon catalog at [lucide.dev/icons](https://lucide.dev/icons).

### Commonly Used Icons

**Social Media**:
- `Github`
- `Linkedin`
- `Twitter`
- `Instagram`
- `Facebook`
- `Youtube`
- `Mail`

**Navigation**:
- `Menu`
- `X` (close)
- `ArrowLeft`
- `ArrowRight`
- `ChevronDown`
- `ChevronUp`
- `Home`

**Actions**:
- `Download`
- `ExternalLink`
- `Share`
- `Copy`
- `Check`
- `Plus`
- `Minus`

**Media**:
- `Play`
- `Pause`
- `Video`
- `Image`
- `File`
- `FileText`

**UI Elements**:
- `Search`
- `Settings`
- `User`
- `Calendar`
- `Clock`
- `Star`
- `Heart`

## Implementation Details

### Architecture

The icon system consists of three components:

1. **`LucideIcon.tsx`**: React component that interfaces with lucide-react
2. **`Icon.astro`**: Astro wrapper that hydrates the React component
3. **`SocialLinks.astro`**: Pre-built component for social media links

### Client-Side Hydration

Icons are hydrated on the client using `client:load` for immediate visibility. For better performance with many icons, consider:

```astro
<!-- Load when visible -->
<Icon name="Github" client:visible />

<!-- Load when idle -->
<Icon name="Github" client:idle />

<!-- No hydration (static SVG) - best performance -->
<!-- Note: This requires static SVG generation which is not implemented yet -->
```

### Styling

Icons inherit text color and can be styled with Tailwind classes:

```astro
<!-- Color -->
<Icon name="Github" class="text-blue-500" />

<!-- Hover effects -->
<Icon name="Mail" class="hover:text-blue-700 transition-colors" />

<!-- Size via Tailwind (affects container, icon size prop is better) -->
<Icon name="Star" class="w-8 h-8" />
```

### Accessibility

Always provide meaningful aria labels:

```astro
<!-- Good: Descriptive label -->
<Icon name="ExternalLink" ariaLabel="Open link in new tab" />

<!-- Avoid: Generic labels -->
<Icon name="ExternalLink" ariaLabel="Icon" />
```

## Customization

### Default Links

To change the default social links, edit `src/components/SocialLinks.astro`:

```typescript
const defaultLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/yourusername',
    icon: 'Github',
    ariaLabel: 'Visit my GitHub profile'
  },
  // Add more links...
];
```

### Stroke Width

Default stroke width is `2`. For bolder icons, increase to `2.5` or `3`:

```astro
<Icon name="Bold" strokeWidth={3} />
```

## Performance Considerations

- **Tree-shaking**: Only imported icons are bundled (Lucide React benefit)
- **File size**: Each icon is ~1-2KB
- **Hydration**: Icons use `client:load` - consider `client:visible` for below-fold icons
- **Bundle size**: lucide-react is ~50KB gzipped for common icons

## Troubleshooting

### Icon not appearing

1. Check the icon name at [lucide.dev/icons](https://lucide.dev/icons)
2. Verify the name matches exactly (case-sensitive)
3. Check browser console for warnings

### Icon sizing issues

Use the `size` prop instead of CSS width/height:

```astro
<!-- ✅ Good -->
<Icon name="Github" size={32} />

<!-- ⚠️ May cause issues -->
<Icon name="Github" class="w-8 h-8" />
```

### Icons not inheriting color

Ensure you're using text color classes:

```astro
<!-- ✅ Good -->
<Icon name="Github" class="text-blue-500" />

<!-- ❌ Won't work -->
<Icon name="Github" class="bg-blue-500" />
```

## Future Enhancements

- [ ] Add static SVG generation for no-hydration option
- [ ] Create icon button component
- [ ] Add animation utilities for icons
- [ ] Create icon sprite system for frequently used icons
