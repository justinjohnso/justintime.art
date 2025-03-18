"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
export function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isActive, setIsActive] = useState(false);
  useEffect(() => {
    const mouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };
    const mouseDown = () => setIsActive(true);
    const mouseUp = () => setIsActive(false);
    // Only add cursor on non-touch devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) {
      window.addEventListener('mousemove', mouseMove);
      window.addEventListener('mousedown', mouseDown);
      window.addEventListener('mouseup', mouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, []);
  // Don't render custom cursor on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }
  return (
    <>
      <motion.div
        className="hidden md:block fixed top-0 left-0 w-6 h-6 rounded-full border border-black/60 pointer-events-none z-50"
        style={{
          translateX: mousePosition.x - 12,
          translateY: mousePosition.y - 12,
        }}
        animate={{
          scale: isActive ? 0.8 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 30,
          mass: 0.5
        }}
      />
      <motion.div 
        className="hidden md:block fixed top-0 left-0 w-2 h-2 bg-black/80 rounded-full pointer-events-none z-50"
        style={{
          translateX: mousePosition.x - 4,
          translateY: mousePosition.y - 4,
        }}
      />
    </>
  );
}
