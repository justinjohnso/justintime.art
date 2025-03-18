import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NavBar } from '@/components/NavBar'
import { CustomCursor } from '@/components/CustomCursor'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ImageGrid from '@/components/ImageGrid'
import About from '@/components/About'
import Footer from '@/components/Footer'
import ContactModal from '@/components/ContactModal'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Justin Johnson - Creative Technologist',
  description:
    'Portfolio of Justin Johnson - Creative Technologist, Sound Designer, and Web Developer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
