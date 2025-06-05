// Define product interface
export interface EarnProduct {
  id: string
  name: string
  type: 'EARN_V2_TREASURY' | 'EARN_V2_HYCB' // Add more types as needed
  apy: number
  description: string
  iconUrl: string | null
  tvl?: number
  underlyingAsset?: string
  network?: string // blockchain network: 'ethereum', 'polygon', etc.
  address?: string // contract address of the vault
  investingTokenAddress?: string // address of the token being invested
  investingTokenSymbol?: string // symbol of the token being invested
  opentradeVaultAddress?: string // address of the opentrade vault
  investingTokenDecimals?: number
  chainId: number
  bgUrl: string // background image URL for the product
  bgFullUrl: string // full background image URL for the product
}

// Base product data without environment-specific values
const baseProducts: Omit<EarnProduct, 'address' | 'investingTokenAddress' | 'opentradeVaultAddress'>[] = [
  {
    id: 'treasury-bill',
    name: 'Flexible TERM USDC Vault',
    type: 'EARN_V2_TREASURY',
    apy: 3.9,
    tvl: 5000000,
    description: 'US Treasuries, USD Money Market Funds',
    iconUrl: '/images/earn/icon01.svg',
    underlyingAsset: 'U.S. Treasury Bill',
    network: 'ethereum',
    investingTokenSymbol: 'USDC',
    investingTokenDecimals: 6,
    chainId: 11155111,
    bgUrl: '/images/earn/bg-tby.svg',
    bgFullUrl: '/images/earn/image01.svg',
  },
  {
    id: 'stablecoin-yield',
    name: 'High Yield Corporate Bond',
    type: 'EARN_V2_HYCB',
    apy: 7,
    tvl: 2800000,
    description: 'BlackRock High Yield Corporate Bond ETF',
    iconUrl: '/images/earn/icon02.svg',
    underlyingAsset: 'BlackRock High Yield Corporate Bond ETF',
    network: 'avalanche',
    investingTokenSymbol: 'USDC',
    investingTokenDecimals: 6,
    chainId: 43113,
    bgUrl: '/images/earn/bg-hycb.svg',
    bgFullUrl: '/images/earn/image02.svg',
  },
]

// Environment-specific addresses
const addresses: Record<string, Record<string, string>> = {
  development: {
    'treasury-bill': '0x94F8e70EbA362A68ee71a3e1D6516526BdD92014',
    'stablecoin-yield': '0x5E25F811828D063E436A3923e00C7F9aDAdE39BF',
  },
  staging: {
    'treasury-bill': '0xStg1234567890123456789012345678901234567890',
    'stablecoin-yield': '0xStg0987654321098765432109876543210987654321',
  },
  production: {
    'treasury-bill': '0xProd1234567890123456789012345678901234567890',
    'stablecoin-yield': '0xProd0987654321098765432109876543210987654321',
  },
}

// Environment-specific investing token addresses organized by token symbol
const investingTokenAddresses: Record<string, Record<string, Record<string, string>>> = {
  development: {
    USDC: {
      ethereum: '0xfd4f11a2aae86165050688c85ec9ed6210c427a9',
      avalanche: '0xBc0Aa760964BD838f462610fC996b24Ff09ca0B9',
    },
  },
  staging: {
    USDC: {
      ethereum: '0xStgUSDC12345678901234567890123490123456789012345',
    },
  },
  production: {
    USDC: {
      ethereum: '0xProdUSDC12345678901234567890123456789012345',
    },
  },
}

// Environment-specific opentrade vault addresses
const opentradeVaultAddresses: Record<string, Record<string, string>> = {
  development: {
    'treasury-bill': '0xb76Ce5dDfF947eA5f0fE7B587bF53925d09266bd',
    'stablecoin-yield': '0xDevOTVSY00000000000000000000000000000000000',
  },
  staging: {
    'treasury-bill': '0xStgOTVTB00000000000000000000000000000000000',
    'stablecoin-yield': '0xStgOTVSY00000000000000000000000000000000000',
  },
  production: {
    'treasury-bill': '0xProdOTVTB0000000000000000000000000000000000',
    'stablecoin-yield': '0xProdOTVSY0000000000000000000000000000000000',
  },
}

// Get current environment
const currentEnv = process.env.REACT_APP_ENV || 'development'

// Combine base product data with environment-specific addresses
const products: EarnProduct[] = baseProducts.map((product) => ({
  ...product,
  address: addresses[currentEnv][product.id] || '0x0000000000000000000000000000000000000000',
  investingTokenAddress:
    investingTokenAddresses[currentEnv][product.investingTokenSymbol || ''][product.network || ''] ||
    '0x0000000000000000000000000000000000000000',
  opentradeVaultAddress:
    opentradeVaultAddresses[currentEnv][product.id] || '0x0000000000000000000000000000000000000000',
}))

export { products }
