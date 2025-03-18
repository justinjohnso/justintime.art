import { ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * A utility function that combines class names and resolves Tailwind CSS conflicts
 * @param inputs - Class names to combine
 * @returns A string with combined and resolved class names
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
