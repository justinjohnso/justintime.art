import React from 'react'

/**
 * Default component mappings for TinaMarkdown
 * Import and use these components to ensure rich-text content renders as proper HTML elements
 *
 * Usage:
 * import { tinaMarkdownComponents } from '../components/TinaMarkdownComponents'
 * <TinaMarkdown content={data.body} components={tinaMarkdownComponents} />
 */
type ComponentProps = unknown

const withUnknownProps = (Tag: any) => (props: ComponentProps) => <Tag {...(props as any)} />

export const tinaMarkdownComponents = {
  h1: withUnknownProps('h1'),
  h2: withUnknownProps('h2'),
  h3: withUnknownProps('h3'),
  h4: withUnknownProps('h4'),
  h5: withUnknownProps('h5'),
  h6: withUnknownProps('h6'),
  p: withUnknownProps('p'),
  a: withUnknownProps('a'),
  ul: withUnknownProps('ul'),
  ol: withUnknownProps('ol'),
  li: withUnknownProps('li'),
  blockquote: withUnknownProps('blockquote'),
  code: withUnknownProps('code'),
  pre: withUnknownProps('pre'),
  strong: withUnknownProps('strong'),
  em: withUnknownProps('em'),
  hr: withUnknownProps('hr'),
  img: withUnknownProps('img'),
  table: withUnknownProps('table'),
  thead: withUnknownProps('thead'),
  tbody: withUnknownProps('tbody'),
  tr: withUnknownProps('tr'),
  th: withUnknownProps('th'),
  td: withUnknownProps('td'),
}
