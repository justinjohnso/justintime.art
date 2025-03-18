import './globals.css'
import { Inter } from 'next/font/google'
import { NavBar } from '@/components/NavBar'
import { CustomCursor } from '@/components/CustomCursor'

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
        <main className="pt-16">{children}</main>
        <footer className="py-16 border-t mt-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Justin Johnson</h3>
                <p className="text-sm text-gray-600">Creative Technologist & Sound Designer</p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Connect</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://twitter.com/"
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      Twitter
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/"
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      Github
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com/"
                      className="text-sm text-gray-600 hover:text-black transition-colors"
                    >
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Contact</h3>
                <a
                  href="mailto:hello@jjohnson.art"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  hello@jjohnson.art
                </a>
              </div>
            </div>
            <div className="text-center text-sm text-gray-600 mt-12">
              © {new Date().getFullYear()} Justin Johnson. All rights reserved.
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
