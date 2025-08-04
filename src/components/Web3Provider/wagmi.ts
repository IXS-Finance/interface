import { QueryClient } from '@tanstack/react-query'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import * as wallets from '@rainbow-me/rainbowkit/wallets'
import { createStorage } from 'wagmi'

import {  CHAINS, transports } from './constants'
import walletConnectConfig from 'walletConnectConfig.json'

type WalletConnectConfig = {
  [key: string]: string
}

function getWalletConnectProjectId() {
  const key = window.location.host as keyof WalletConnectConfig
  const configs: WalletConnectConfig = walletConnectConfig || {}

  const projectId = configs[key]
  return projectId
}

export function createWagmiConfig() {
  const WALLET_CONNECT_PROJECT_ID = getWalletConnectProjectId()

  const config = getDefaultConfig({
    appName: 'IXSwap',
    projectId: WALLET_CONNECT_PROJECT_ID,
    ssr: false, // Disable SSR to prevent hydration mismatches
    storage: createStorage({
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      key: 'wagmi.store', // Explicit storage key
    }),
    wallets: [
      {
        groupName: 'Popular',
        wallets: [wallets.coinbaseWallet, wallets.metaMaskWallet, wallets.walletConnectWallet],
      },
      {
        groupName: 'Others',
        wallets: [
          wallets.trustWallet,
          wallets.phantomWallet,
          wallets.braveWallet,
          wallets.uniswapWallet,
          wallets.rainbowWallet,
          wallets.zerionWallet,
          wallets.rabbyWallet,
          wallets.injectedWallet,
        ],
      },
    ],
    chains: CHAINS,
    transports,
  })

  return config
}

export const queryClient = new QueryClient()
