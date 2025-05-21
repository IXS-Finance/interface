export enum SupportedChainId {
  MAINNET = 1,
  POLYGON = 137,
  AMOY = 80002,
  BASE = 8453,
  BASE_SEPOLIA = 84532,
  OZEAN_TESTNET = 7849306,
  KAIROS_TESTNET = 1001,
  KAIA = 8217,
  REDBELLY = 151,
  REDBELLY_TESNET = 153,
  SEPOLIA = 11155111,
  AVALANCE = 43114,
  AVALANCE_FUJI = 43113,
}

export enum ChainId {
  Mainnet = SupportedChainId.MAINNET,
  Polygon = SupportedChainId.POLYGON,
  Base = SupportedChainId.BASE,
  Amoy = SupportedChainId.AMOY,
  BaseSepolia = SupportedChainId.BASE_SEPOLIA,
  OzeanTestnet = SupportedChainId.OZEAN_TESTNET,
  KairosTestnet = SupportedChainId.KAIROS_TESTNET,
  Kaia = SupportedChainId.KAIA,
  RedBelly = SupportedChainId.REDBELLY,
  RedBellyTestnet = SupportedChainId.REDBELLY_TESNET,
  Sepolia = SupportedChainId.SEPOLIA,
  Avalanche = SupportedChainId.AVALANCE,
  AvalancheFuji = SupportedChainId.AVALANCE_FUJI,
}

export interface RetryOptions {
  n: number
  minWait: number
  maxWait: number
}

export type InterfaceChainId = SupportedChainId
