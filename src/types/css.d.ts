// CSS type declarations
declare module '*.css' {
  const content: string;
  export default content;
}

// Suppress CSS at-rule warnings for Tailwind CSS
declare global {
declare module 'csstype' {
  interface Properties {
    '--tw-bg-opacity'?: string;
    '--tw-text-opacity'?: string;
    '--tw-border-opacity'?: string;
    '--tw-ring-opacity'?: string;
    '--tw-shadow'?: string;
    '--tw-ring-offset-shadow'?: string;
    '--tw-ring-shadow'?: string;
  }
}

// Global CSS at-rules - suppress TypeScript warnings
declare global {
  namespace CSS {
    interface AtRules {
      tailwind: unknown;
      apply: unknown;
      layer: unknown;
      variants: unknown;
      responsive: unknown;
      screen: unknown;
      media: unknown;
      supports: unknown;
    }
  }
}

// CSS module declarations
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

export {};
