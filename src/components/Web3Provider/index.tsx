import React, { ReactNode, useEffect } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'
import { reconnect } from '@wagmi/core'

import { queryClient, createWagmiConfig } from './wagmi'
import { ConnectionProvider } from 'hooks/useConnect'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

import '@rainbow-me/rainbowkit/styles.css'

export const wagmiConfig = createWagmiConfig()

// Auto-reconnect component
function AutoReconnect() {
  useEffect(() => {
    // Attempt to reconnect on app load
    const attemptReconnect = async () => {
      try {
        await reconnect(wagmiConfig)
      } catch (error) {
        console.log('Auto-reconnect failed:', error)
      }
    }

    // Small delay to ensure providers are ready
    const timer = setTimeout(attemptReconnect, 100)
    return () => clearTimeout(timer)
  }, [])

  return null
}

export default function Web3Provider({ children }: { children: ReactNode }) {

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AutoReconnect />
          <ConnectionProvider>{children}</ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
