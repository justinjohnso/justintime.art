import React from 'react';
import { tinaField, useTina } from 'tinacms/dist/react';
import { TinaMarkdown } from 'tinacms/dist/rich-text';
import type { PagesQuery } from '../__generated__/types';

interface PageComponentProps {
  query: string;
  variables: {
    relativePath: string;
  };
  data: PagesQuery;
}

export default function PageComponent(props: PageComponentProps) {
  const { data } = useTina({
    query: props.query,
    variables: props.variables,
    data: props.data,
  });

  const page = data.pages;

  return (
    <section className="mb-12">
      <h2 
        className="text-3xl md:text-4xl font-light mb-6" 
        data-tina-field={tinaField(page, 'title')}
      >
        {page.title}
      </h2>
      <p 
        className="text-lg text-gray-600 max-w-2xl mb-8"
        data-tina-field={tinaField(page, 'description')}
      >
        {page.description}
      </p>
    </section>
  );
}
