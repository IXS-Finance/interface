import React, { useEffect } from 'react'
import { useTheme } from 'styled-components'

/**
 * Hook to sync styled-components theme with Tailwind CSS custom properties
 * This allows Tailwind to use the same colors as your styled-components theme
 */
export function useTailwindThemeSync() {
  const theme = useTheme()

  useEffect(() => {
    if (!theme) return

    const root = document.documentElement

    // Map your theme colors to CSS custom properties
    if (theme.bg0) root.style.setProperty('--color-bg-0', theme.bg0)
    if (theme.bg1) root.style.setProperty('--color-bg-1', theme.bg1)
    if (theme.bg2) root.style.setProperty('--color-bg-2', theme.bg2)
    if (theme.bg3) root.style.setProperty('--color-bg-3', theme.bg3)
    if (theme.bg4) root.style.setProperty('--color-bg-4', theme.bg4)
    if (theme.bg5) root.style.setProperty('--color-bg-5', theme.bg5)

    if (theme.text1) root.style.setProperty('--color-text-1', theme.text1)
    if (theme.text2) root.style.setProperty('--color-text-2', theme.text2)
    if (theme.text3) root.style.setProperty('--color-text-3', theme.text3)
    if (theme.text4) root.style.setProperty('--color-text-4', theme.text4)
    if (theme.text5) root.style.setProperty('--color-text-5', theme.text5)
    if (theme.text6) root.style.setProperty('--color-text-6', theme.text6)

    if (theme.red1) root.style.setProperty('--color-red-1', theme.red1)
    if (theme.red2) root.style.setProperty('--color-red-2', theme.red2)
    if (theme.red3) root.style.setProperty('--color-red-3', theme.red3)

    if (theme.green1) root.style.setProperty('--color-green-1', theme.green1)

    if (theme.yellow1) root.style.setProperty('--color-yellow-1', theme.yellow1)
    if (theme.yellow2) root.style.setProperty('--color-yellow-2', theme.yellow2)

    if (theme.blue1) root.style.setProperty('--color-blue-1', theme.blue1)

    // Handle whitelabel config colors
    if (theme.config?.elements?.main) {
      root.style.setProperty('--color-primary', theme.config.elements.main)
    }

    if (theme.config?.elements?.secondary) {
      root.style.setProperty('--color-primary-dark', theme.config.elements.secondary)
    }

    // Map additional theme properties
    if (theme.error) root.style.setProperty('--color-error', theme.error)
    if (theme.success) root.style.setProperty('--color-success', theme.success)
    if (theme.warning) root.style.setProperty('--color-warning', theme.warning)

    // Set design system colors from Figma
    root.style.setProperty('--color-dark-100', '#141419')  // Sidebar background
    root.style.setProperty('--color-dark-200', '#16171C')  // Main background
    root.style.setProperty('--color-dark-300', '#222328')  // Border/secondary
    root.style.setProperty('--color-light-100', '#FFFFFF') // Primary white
    root.style.setProperty('--color-light-200', 'rgba(255, 255, 255, 0.9)') // High opacity
    root.style.setProperty('--color-light-300', 'rgba(255, 255, 255, 0.6)') // Medium opacity
    root.style.setProperty('--color-light-400', 'rgba(255, 255, 255, 0.3)') // Low opacity

  }, [theme])
}

/**
 * Component to be added at the root level to sync themes
 */
export function TailwindThemeProvider({ children }: { children: React.ReactNode }) {
  useTailwindThemeSync()
  return <>{children}</>
}
