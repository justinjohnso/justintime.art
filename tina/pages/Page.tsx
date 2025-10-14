import React, { useState, useEffect } from 'react'
import { tinaField, useTina } from 'tinacms/dist/react'
import { TinaMarkdown } from 'tinacms/dist/rich-text'
import type { PagesQuery } from '../__generated__/types'
import { tinaMarkdownComponents } from '../components/TinaMarkdownComponents'

interface PageProps {
  query: string
  variables: {
    relativePath: string
  }
  data: PagesQuery
}

export default function Page(props: PageProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const page = data.pages

  // Track URL changes to force re-render when category filter changes
  const [, setUrlKey] = useState(0)

  useEffect(() => {
    // Force re-render when navigation occurs (ViewTransitions)
    const handleNavigation = () => {
      setUrlKey((prev) => prev + 1)
    }

    // Listen for both popstate and Astro's view transition events
    window.addEventListener('popstate', handleNavigation)
    document.addEventListener('astro:after-swap', handleNavigation)

    return () => {
      window.removeEventListener('popstate', handleNavigation)
      document.removeEventListener('astro:after-swap', handleNavigation)
    }
  }, [])

  return (
    <main className="p-4 md:p-6 lg:p-8">
      <div className="prose prose-lg max-w-none" data-tina-field={tinaField(page, 'body')}>
        <TinaMarkdown content={page.body} components={tinaMarkdownComponents} />
      </div>
    </main>
  )
}
