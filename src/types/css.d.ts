// CSS type declarations
declare module '*.css' {
  const content: string;
  export default content;
}

// Allow Tailwind CSS at-rules
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

// Global CSS at-rules
declare global {
  namespace CSS {
    interface AtRules {
      tailwind: any;
      apply: any;
      layer: any;
      variants: any;
      responsive: any;
      screen: any;
    }
  }
}

export {};
