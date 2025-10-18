import React from 'react'
import { tinaField, useTina } from 'tinacms/dist/react'
import type { CategoriesQuery, CategoriesQueryVariables } from '../__generated__/types'

type Props = {
  variables: CategoriesQueryVariables
  data: CategoriesQuery
  query: string
}

export default function Category(props: Props) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  })

  const category = data.categories

  return (
    <div className="hidden">
      {/* Hidden component for TinaCMS editing - visual elements are in Astro */}
      <div data-tina-field={tinaField(category, 'title')} />
      <div data-tina-field={tinaField(category, 'categorySlug')} />
      <div data-tina-field={tinaField(category, 'description')} />
    </div>
  )
}
