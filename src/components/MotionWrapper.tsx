'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

interface MotionWrapperProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function MotionWrapper({ children, delay = 0, className = '' }: MotionWrapperProps) {
  return (
    <motion.div
      className={className}
      variants={fadeInVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  )
}
