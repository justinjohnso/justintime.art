// Astro component type declarations
declare module 'astro:content' {
  export * from 'astro/content';
}

// HTML attribute overrides for Astro
declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    class?: string;
  }

  interface SVGAttributes {
    class?: string;
  }

  interface AnchorHTMLAttributes extends HTMLAttributes {
    class?: string;
  }

  interface ImgHTMLAttributes extends HTMLAttributes {
    class?: string;
  }

  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

// Component prop types
declare global {
  namespace astroHTML.JSX {
    interface IntrinsicElements {
        [elemName: string]: unknown;
      }
  }
}

export {};
