import React from 'react'
import { cn } from '../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

/**
 * Example Card component using Tailwind CSS
 * Demonstrates how to create reusable components with Tailwind
 */
export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'md'
}) => {
  const baseClasses = 'bg-bg-0 rounded-20 border border-bg-3'

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  }

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-card',
    lg: 'shadow-lg'
  }

  return (
    <div
      className={cn(
        baseClasses,
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
    >
      {children}
    </div>
  )
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

/**
 * Example Input component using Tailwind CSS
 * Shows how to handle form elements with proper styling
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-text-1">
          {label}
        </label>
      )}
      <input
        className={cn(
          'input-field',
          error && 'border-error focus:border-error focus:ring-error',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      {hint && !error && (
        <p className="text-sm text-text-2">{hint}</p>
      )}
    </div>
  )
}
