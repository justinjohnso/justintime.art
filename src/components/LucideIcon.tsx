/**
 * React wrapper for Lucide icons
 * Used by Icon.astro component
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface Props {
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

export default function LucideIcon({
  name,
  size = 24,
  strokeWidth = 2,
  className = '',
  ariaLabel,
}: Props) {
  // Get the icon component from lucide-react
  const IconComponent = LucideIcons[name as keyof typeof LucideIcons] as React.ComponentType<LucideProps>;

  // Warn if icon not found
  if (!IconComponent || typeof IconComponent !== 'function') {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-label={ariaLabel}
    />
  );
}
