import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { anyone } from '../access/anyone'
import { slugField } from '@/fields/slug'
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  LinkFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { Banner } from '../blocks/Banner/config'
import { Code } from '../blocks/Code/config'
import { MediaBlock } from '../blocks/MediaBlock/config'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured',
    },
    {
      name: 'links',
      type: 'richText',
      label: 'Links',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            LinkFeature({
              fields: [
                {
                  name: 'rel',
                  label: 'Rel Attribute',
                  type: 'select',
                  hasMany: true,
                  options: ['noopener', 'noreferrer', 'nofollow'],
                },
                {
                  name: 'target',
                  label: 'Target',
                  type: 'select',
                  options: ['_self', '_blank'],
                  defaultValue: '_blank',
                },
              ],
            }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
    {
      name: 'yearCompleted',
      type: 'number',
      label: 'Year Completed',
      min: 1900,
      max: 2100,
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Body',
      required: true,
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({
              enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'],
            }),
            LinkFeature({
              fields: [
                {
                  name: 'rel',
                  label: 'Rel Attribute',
                  type: 'select',
                  hasMany: true,
                  options: ['noopener', 'noreferrer', 'nofollow'],
                },
                {
                  name: 'target',
                  label: 'Target',
                  type: 'select',
                  options: ['_self', '_blank'],
                  defaultValue: '_blank',
                },
              ],
            }),
            BlocksFeature({
              blocks: [Banner, Code, MediaBlock],
            }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
            HorizontalRuleFeature(),
          ]
        },
      }),
    },
    {
      name: 'additionalImages',
      type: 'array',
      label: 'Additional Images',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    ...slugField(),
  ],
}

export default Projects
