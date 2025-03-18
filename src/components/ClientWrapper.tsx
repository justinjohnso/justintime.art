'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ClientWrapperProps {
  children: React.ReactNode
}

// Container animation for staggered children
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Default export for ClientWrapper component
const ClientWrapper = ({ children }: ClientWrapperProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

export default ClientWrapper
