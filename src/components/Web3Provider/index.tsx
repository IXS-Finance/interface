import React, { ReactNode } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClientProvider } from '@tanstack/react-query'

import { queryClient, createWagmiConfig } from './wagmi'
import { ConnectionProvider } from 'hooks/useConnect'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'

import '@rainbow-me/rainbowkit/styles.css'

export const wagmiConfig = createWagmiConfig()

export default function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectionProvider>{children}</ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
