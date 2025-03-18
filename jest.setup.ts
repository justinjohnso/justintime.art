import '@testing-library/jest-dom'
import { useRouter } from 'next/router'

// Mock the Next.js router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

// Set up default mock implementation for useRouter
// This enables mockImplementation to be available on the mock
beforeEach(() => {
  // Reset the mock before each test
  ;(useRouter as jest.Mock).mockImplementation(() => ({
    push: jest.fn(),
    query: {},
    asPath: '',
    route: '',
    pathname: '',
    basePath: '',
    locale: 'en',
    locales: ['en'],
    defaultLocale: 'en',
    isReady: true,
    isLocaleDomain: false,
    isPreview: false,
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    prefetch: jest.fn().mockResolvedValue(undefined),
    replace: jest.fn(),
    back: jest.fn(),
    reload: jest.fn(),
  }))
})

// This file is run after the test environment is set up but before each test file
