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

const MediaBlock = (props: any) => {
  const { media, caption } = props
  if (!media) return null

  return (
    <figure className="my-6">
      <img src={media} alt={caption || ''} className="w-full h-auto rounded" />
      {caption && <figcaption className="mt-2 text-sm text-gray-600 text-center">{caption}</figcaption>}
    </figure>
  )
}

const Banner = (props: any) => {
  const { heading, subheading } = props
  return (
    <div className="my-6 p-6 bg-gray-100 rounded">
      {heading && <h2 className="text-2xl font-bold mb-2">{heading}</h2>}
      {subheading && <p className="text-lg text-gray-700">{subheading}</p>}
    </div>
  )
}

const CodeBlock = (props: any) => {
  const { language, code } = props
  return (
    <pre className="my-4 p-4 bg-gray-900 text-gray-100 rounded overflow-x-auto">
      <code className={language ? `language-${language}` : ''}>{code}</code>
    </pre>
  )
}

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
  MediaBlock,
  Banner,
  CodeBlock,
}
