import { Currency, Ether, NativeCurrency, Token, WETH9 } from '@ixswap1/sdk-core'
import invariant from 'tiny-invariant'

import { IXS_ADDRESS } from './addresses'
import { SupportedChainId } from './chains'
import { isProd } from 'utils/isEnvMode'

export const USDC: { [chainId: number]: Token } = {
  [1]: new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD//C'),
  [42]: new Token(42, '0xe22da380ee6B445bb8273C81944ADEB6E8450422', 6, 'USDC', 'USD//C'),
  [137]: new Token(137, '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', 6, 'USDC', 'USD//C'),
  [80001]: new Token(80001, '0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747', 6, 'USDC', 'USD//C'),
  [80002]: new Token(80002, '0xA9bc9D3F0fF05AB339D1E195982794B15beA0f88', 6, 'USDC', 'USD//C'),
  [84532]: new Token(84532, '0xA9c2c7D5E9bdA19bF9728384FFD3cF71Ada5dfcB', 6, 'USDC', 'USD//C'),
  [8453]: new Token(
    8453,
    isProd ? '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' : '0xD971d0d96cc21576fbbc237C7a5B27A249cF67ca',
    6,
    'USDC',
    'USD//C'
  ),
  153: new Token(153, '0x5c5f3E64bd3F95Df54a6601369BD3A08bfD28a2f', 6, 'USDC', 'USDC'),
  151: new Token(151, '0x8201c02d4AB2214471E8C3AD6475C8b0CD9F2D06', 6, 'USDC', 'USDC'),
}

// Mirror Protocol compat.
export const IXS: { [chainId: number]: Token } = {
  [1]: new Token(1, IXS_ADDRESS[1], 18, 'IXS', 'IXS'),
  [4]: new Token(4, IXS_ADDRESS[4], 18, 'IXS', 'IXS'),
  [3]: new Token(3, IXS_ADDRESS[3], 18, 'IXS', 'IXS'),
  [5]: new Token(5, IXS_ADDRESS[5], 18, 'IXS', 'IXS'),
  [42]: new Token(42, IXS_ADDRESS[42], 18, 'IXS', 'IXS'),
  [80001]: new Token(80001, IXS_ADDRESS[80001], 18, 'IXS', 'IXS'),
  [80002]: new Token(80002, IXS_ADDRESS[80002], 18, 'IXS', 'IXS'),
  [137]: new Token(137, IXS_ADDRESS[137], 18, 'IXS', 'IXS'),
  [84532]: new Token(84532, IXS_ADDRESS[84532], 18, 'IXS', 'IXS'),
  [8453]: new Token(8453, IXS_ADDRESS[8453], 18, 'IXS', 'IXS'),
  153: new Token(153, IXS_ADDRESS[153], 18, 'IXS', 'IXS'),
  151: new Token(151, IXS_ADDRESS[151], 18, 'IXS', 'IXS'),
}

export const WRAPPED_NATIVE_CURRENCY: { [chainId: number]: Token | undefined } = {
  ...(WETH9 as Record<SupportedChainId, Token>),
  [SupportedChainId.MATIC]: new Token(
    SupportedChainId.MATIC,
    '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    18,
    'WMATIC',
    'Wrapped MATIC'
  ),
  [SupportedChainId.MUMBAI]: new Token(
    SupportedChainId.MUMBAI,
    '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
    18,
    'WMATIC',
    'Wrapped MATIC'
  ),
  [SupportedChainId.AMOY]: new Token(
    SupportedChainId.AMOY,
    '0x0ae690AAD8663aaB12a671A6A0d74242332de85f',
    18,
    'WMATIC',
    'Wrapped MATIC'
  ),
  [SupportedChainId.REDBELLY_TESNET]: new Token(
    SupportedChainId.REDBELLY_TESNET,
    '0xC8fce9E9F0a999Def5cbc041AcC64750C3F92Cd8',
    18,
    'wRBNT',
    'Wrapped RBNT'
  ),
  [SupportedChainId.REDBELLY]: new Token(
    SupportedChainId.REDBELLY,
    '0x6ed1F491e2d31536D6561f6bdB2AdC8F092a6076',
    18,
    'wRBNT',
    'Wrapped RBNT'
  ),
}

function isMatic(chainId: number) {
  return chainId === SupportedChainId.MUMBAI || chainId === SupportedChainId.MATIC || chainId === SupportedChainId.AMOY
}

class MaticNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other?.isNative && other.chainId === this.chainId
  }

  get wrapped(): Token {
    if (!isMatic(this.chainId)) throw new Error('Not matic')
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    invariant(wrapped instanceof Token)
    return wrapped
  }

  public constructor(chainId: number) {
    if (!isMatic(chainId)) throw new Error('Not matic')
    super(chainId, 18, 'MATIC', 'Polygon Matic')
  }
}

export class ExtendedEther extends Ether {
  public get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    if (wrapped) return wrapped
    throw new Error('Unsupported chain ID')
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } = {}

  public static onChain(chainId: number): ExtendedEther {
    return this._cachedExtendedEther[chainId] ?? (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
  }
}

function isRedBelly(chainId: number) {
  return chainId === SupportedChainId.REDBELLY || chainId === SupportedChainId.REDBELLY_TESNET
}

export class RedBellyNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other?.isNative && other.chainId === this.chainId
  }

  get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    invariant(wrapped instanceof Token)
    return wrapped
  }

  public constructor(chainId: number) {
    super(chainId, 18, 'RBNT', 'RBNT')
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency } = {}

export function nativeOnChain(chainId: number) {
  if (cachedNativeCurrency[chainId]) return cachedNativeCurrency[chainId]

  switch (chainId) {
    case SupportedChainId.MATIC:
    case SupportedChainId.MUMBAI:
    case SupportedChainId.AMOY:
      return (cachedNativeCurrency[chainId] = new MaticNativeCurrency(chainId))
    case SupportedChainId.REDBELLY:
    case SupportedChainId.REDBELLY_TESNET:
      return (cachedNativeCurrency[chainId] = new RedBellyNativeCurrency(chainId))
    default:
      return (cachedNativeCurrency[chainId] = ExtendedEther.onChain(chainId))
  }
}

export const TOKEN_SHORTHANDS: { [shorthand: string]: Record<any, any> } = {
  USDC: {
    [SupportedChainId.MAINNET]: USDC[1],
    [SupportedChainId.KOVAN]: USDC[42],
    [SupportedChainId.MATIC]: USDC[137],
    [SupportedChainId.MUMBAI]: USDC[80001],
    [SupportedChainId.AMOY]: USDC[80002],
    [SupportedChainId.BASE_SEPOLIA]: USDC[84532],
    [SupportedChainId.BASE]: USDC[8453],
    [SupportedChainId.REDBELLY_TESNET]: USDC[153],
    [SupportedChainId.REDBELLY]: USDC[151],
    // [SupportedChainId.MUMBAI]: '0xe11a86849d99f524cac3e7a0ec1241828e332c62',
  },
  IXS: {
    [SupportedChainId.MAINNET]: IXS[1],
    [SupportedChainId.KOVAN]: IXS[42],
    [SupportedChainId.MATIC]: IXS[137],
    [SupportedChainId.MUMBAI]: IXS[80001],
    [SupportedChainId.AMOY]: IXS[80002],
    [SupportedChainId.BASE_SEPOLIA]: IXS[84532],
    [SupportedChainId.BASE]: IXS[8453],
    [SupportedChainId.REDBELLY_TESNET]: IXS[153],
    [SupportedChainId.REDBELLY]: IXS[151],
  },
}

export enum TokenStatusEnum {
  APPROVED = 'approved',
  WRAPPING = 'wrapping',
}

export const DEFAULT_TOKEN_DECIMALS = 18;