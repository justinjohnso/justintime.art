'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
export function NavBar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  const navItems = [
    { name: 'Projects', href: '/projects' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ]
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 py-4 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 shadow-sm backdrop-blur-sm' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-light relative">
          Justin Johnson
          <motion.span
            className="absolute -bottom-1 left-0 w-0 h-px bg-black"
            whileHover={{ width: '100%' }}
            transition={{ duration: 0.2 }}
          />
        </Link>
        <nav>
          <ul className="flex space-x-8">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`relative font-light ${pathname === item.href ? 'text-black' : 'text-gray-600 hover:text-black'}`}
                >
                  {item.name}
                  {pathname === item.href && (
                    <motion.span
                      className="absolute -bottom-1 left-0 w-full h-px bg-black"
                      layoutId="navbar-underline"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
