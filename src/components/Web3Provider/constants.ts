import {
  baseSepolia,
  base,
  polygon,
  polygonAmoy,
  Chain,
  kairos,
  kaia,
  redbellyTestnet,
  redbellyMainnet,
  avalanche,
  avalancheFuji,
} from 'wagmi/chains'
import { fallback, http } from 'wagmi'
import { Transport } from 'viem'

import { ChainId } from 'types/chains'
import { isTestnet } from 'utils/isEnvMode'
import GNOSIS_ICON from 'assets/wallets/gnosis.png'
import COINBASE_ICON from 'assets/wallets/coinbase-icon.svg'
import METAMASK_ICON from 'assets/wallets/metamask-icon.svg'
import WALLET_CONNECT_ICON from 'assets/wallets/walletconnect-icon.svg'
import ozeanTestnet from './chains/ozeanTestnet'

export const CONNECTION = {
  WALLET_CONNECT_CONNECTOR_ID: 'walletConnect',
  INJECTED_CONNECTOR_ID: 'injected',
  INJECTED_CONNECTOR_TYPE: 'injected',
  COINBASE_SDK_CONNECTOR_ID: 'coinbaseWalletSDK',
  COINBASE_RDNS: 'com.coinbase.wallet',
  METAMASK_RDNS: 'io.metamask',
  UNISWAP_EXTENSION_RDNS: 'org.uniswap.app',
  SAFE_CONNECTOR_ID: 'safe',
} as const

export const CONNECTOR_ICON_OVERRIDE_MAP: { [id in string]?: string } = {
  [CONNECTION.METAMASK_RDNS]: METAMASK_ICON,
  [CONNECTION.COINBASE_SDK_CONNECTOR_ID]: COINBASE_ICON,
  [CONNECTION.WALLET_CONNECT_CONNECTOR_ID]: WALLET_CONNECT_ICON,
  [CONNECTION.SAFE_CONNECTOR_ID]: GNOSIS_ICON,
}

const getAlchemyUrlFor = (network: string) =>
  process.env.REACT_APP_ALCHEMY_KEY ? `https://${network}.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}` : ''

export const CHAINS: [Chain, ...Chain[]] = isTestnet
  ? [baseSepolia, polygonAmoy, ozeanTestnet, kairos, redbellyTestnet, avalancheFuji]
  : [base, polygon, kaia, redbellyMainnet, avalanche]

export const customChains = {
  ozeanTestnet,
}

export const PUBLIC_NODES = {
  [ChainId.Polygon]: [getAlchemyUrlFor('polygon-mainnet'), 'https://polygon-rpc.com'].filter(Boolean),
  [ChainId.Amoy]: [getAlchemyUrlFor('polygon-amoy'), 'https://rpc-amoy.polygon.technology/'].filter(Boolean),
  [ChainId.Base]: [getAlchemyUrlFor('base-mainnet')],
  [ChainId.BaseSepolia]: [getAlchemyUrlFor('base-sepolia')],
  [ChainId.OzeanTestnet]: ['https://ozean-testnet.rpc.caldera.xyz/http'],
  [ChainId.KairosTestnet]: ['https://public-en-kairos.node.kaia.io'],
  [ChainId.Kaia]: ['https://public-en.node.kaia.io'],
  [ChainId.RedBellyTestnet]: ['https://governors.testnet.redbelly.network'],
  [ChainId.RedBelly]: ['https://governors.mainnet.redbelly.network'],
  [ChainId.Avalanche]: ['https://api.avax.network/ext/bc/C/rpc'],
  [ChainId.AvalancheFuji]: ['https://api.avax-test.network/ext/bc/C/rpc'],
} as any

export const transports = CHAINS.reduce((ts, chain) => {
  let httpStrings: string[] | readonly string[] = []

  httpStrings = PUBLIC_NODES[chain.id] ? PUBLIC_NODES[chain.id] : []

  if (ts) {
    return {
      ...ts,
      [chain.id]: fallback(httpStrings.map((t: any) => http(t))),
    }
  }

  return {
    [chain.id]: fallback(httpStrings.map((t: any) => http(t))),
  }
}, {} as Record<number, Transport>) as any
