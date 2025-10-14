import React from 'react'

/**
 * Default component mappings for TinaMarkdown
 * Import and use these components to ensure rich-text content renders as proper HTML elements
 *
 * Usage:
 * import { tinaMarkdownComponents } from '../components/TinaMarkdownComponents'
 * <TinaMarkdown content={data.body} components={tinaMarkdownComponents} />
 */
export const tinaMarkdownComponents = {
  h1: (props: any) => <h1 {...props} />,
  h2: (props: any) => <h2 {...props} />,
  h3: (props: any) => <h3 {...props} />,
  h4: (props: any) => <h4 {...props} />,
  h5: (props: any) => <h5 {...props} />,
  h6: (props: any) => <h6 {...props} />,
  p: (props: any) => <p {...props} />,
  a: (props: any) => <a {...props} />,
  ul: (props: any) => <ul {...props} />,
  ol: (props: any) => <ol {...props} />,
  li: (props: any) => <li {...props} />,
  blockquote: (props: any) => <blockquote {...props} />,
  code: (props: any) => <code {...props} />,
  pre: (props: any) => <pre {...props} />,
  strong: (props: any) => <strong {...props} />,
  em: (props: any) => <em {...props} />,
  hr: (props: any) => <hr {...props} />,
  img: (props: any) => <img {...props} />,
  table: (props: any) => <table {...props} />,
  thead: (props: any) => <thead {...props} />,
  tbody: (props: any) => <tbody {...props} />,
  tr: (props: any) => <tr {...props} />,
  th: (props: any) => <th {...props} />,
  td: (props: any) => <td {...props} />,
}
