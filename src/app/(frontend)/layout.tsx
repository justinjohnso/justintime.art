import './globals.css'
import { Inter } from 'next/font/google'
import { NavBar } from '@/components/NavBar'
import { CustomCursor } from '@/components/CustomCursor'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ImageGrid from '@/components/ImageGrid'
import About from '@/components/About'
import Footer from '@/components/Footer'
import ContactModal from '@/components/ContactModal'
import React from 'react'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata = {
  title: 'Justin Johnson - Creative Technologist',
  description:
    'Portfolio of Justin Johnson - Creative Technologist, Sound Designer, and Web Developer',
}

// Use inline type annotation instead of separate type declaration
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-black`}>
        <CustomCursor />
        <NavBar />
        <Header />
        <Hero />
        <ImageGrid />
        <About />
        {children}
        <Footer />
        <ContactModal />
      </body>
    </html>
  )
}
