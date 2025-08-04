import { clsx, type ClassValue } from "clsx"

/**
 * Utility function to concatenate class names
 * Combines clsx for conditional classes with Tailwind merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Utility to merge Tailwind classes properly
 * Use this when you need to override Tailwind classes
 */
export function mergeTailwindClasses(baseClasses: string, overrideClasses?: string) {
  if (!overrideClasses) return baseClasses

  // Simple merge - for more complex merging, consider using tailwind-merge package
  return `${baseClasses} ${overrideClasses}`
}
