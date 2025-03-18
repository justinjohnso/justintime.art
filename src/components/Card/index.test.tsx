import React from 'react'
import { render, screen } from '@testing-library/react'
import { Card } from './index'
import type { NextRouter } from 'next/router'

// Create a properly typed mock router
// Use jest.fn() with explicit typing
const useRouter = jest.fn() as jest.MockedFunction<() => NextRouter>

// Mock next/router with proper typing
jest.mock('next/router', () => ({
  useRouter,
}))

// No need to double-mock the router - remove this second mock
// jest.mock('next/dist/client/router', () => {
//   // Remove this mock completely
// })

// Create a complete router implementation with ALL required properties
const mockRouter = {
  route: '/',
  pathname: '/',
  query: {},
  asPath: '/',
  basePath: '', // Add the missing property
  isLocaleDomain: false, // Add the missing property
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(), // Add the missing forward method
  prefetch: jest.fn(),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isReady: true,
  isFallback: false,
  isPreview: false,
  locale: 'en',
  locales: ['en'],
  defaultLocale: 'en',
}

useRouter.mockImplementation(() => mockRouter)

// For better type safety, import types from your payload-types
import type { Category } from '../../payload-types'

// Define card post data type
interface CardPostData {
  title: string
  slug: string
  categories: (number | Category)[]
  meta?: any
}

describe('Card Component', () => {
  it('renders the title', () => {
    const doc = { title: 'Test Title', slug: 'test-slug', categories: [], meta: {} }
    render(<Card doc={doc} />)
    const titleElement = screen.getByText('Test Title')
    expect(titleElement).toBeInTheDocument()
  })

  it('renders the description', () => {
    const doc = {
      title: 'Test Title',
      slug: 'test-slug',
      categories: [],
      meta: { description: 'Test Description' },
    }
    render(<Card doc={doc} />)
    const descriptionElement = screen.getByText('Test Description')
    expect(descriptionElement).toBeInTheDocument()
  })

  it('renders the categories', () => {
    // Create properly shaped Category objects
    const categories: Category[] = [
      {
        id: 1,
        title: 'Category 1',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'Category 2',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]

    const doc = {
      title: 'Test Title',
      slug: 'test-slug',
      categories: categories,
      meta: {},
    }

    render(<Card doc={doc} showCategories={true} />)
    const categoryElement1 = screen.getByText('Category 1')
    const categoryElement2 = screen.getByText('Category 2')
    expect(categoryElement1).toBeInTheDocument()
    expect(categoryElement2).toBeInTheDocument()
  })

  it('renders a card with image', () => {
    const mockCategory: Category = {
      id: 1,
      title: 'Test Category',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    const postData: CardPostData = {
      title: 'Test Card',
      slug: '/test',
      categories: [mockCategory],
      meta: {},
    }

    render(<Card doc={postData} relationTo="posts" showCategories={true} />)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Test Category')).toBeInTheDocument()
  })
})
