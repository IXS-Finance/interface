import React from 'react'
import { cn } from '../utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

/**
 * Example Button component using Tailwind CSS
 * Demonstrates the hybrid approach - uses Tailwind for styling while maintaining
 * your existing component API patterns
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

  const variantClasses = {
    primary: 'bg-primary text-text-4 hover:bg-primary-dark focus:ring-primary disabled:bg-text-3',
    secondary: 'bg-bg-2 text-text-1 hover:bg-bg-3 focus:ring-bg-3 disabled:bg-bg-2 disabled:text-text-3',
    outline: 'border-2 border-primary text-primary bg-transparent hover:bg-primary hover:text-text-4 focus:ring-primary disabled:border-text-3 disabled:text-text-3',
    ghost: 'text-primary bg-transparent hover:bg-bg-1 focus:ring-primary disabled:text-text-3'
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  const disabledClasses = disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
