'use client' // Mark as client component

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

export function MotionWrapper({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      style={{ originY: 0 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
