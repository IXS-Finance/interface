// Define product interface
export interface EarnProduct {
  id: string
  name: string
  asset: string
  apy: number
  description: string
  iconUrl: string | null
  tvl?: number
  underlyingAsset?: string
  network?: string // blockchain network: 'ethereum', 'polygon', etc.
  address?: string // contract address of the vault
  investingTokenAddress?: string // address of the token being invested
}

// Base product data without environment-specific values
const baseProducts: Omit<EarnProduct, 'address' | 'investingTokenAddress'>[] = [
  {
    id: 'treasury-bill',
    name: 'U.S. Treasury Backed Yield',
    asset: 'USDC',
    apy: 3.9,
    tvl: 5000000,
    description: 'Flexible Term USDC Vault',
    iconUrl: null,
    underlyingAsset: 'U.S. Treasury Bill',
    network: 'ethereum',
  },
  {
    id: 'stablecoin-yield',
    name: 'Stablecoin Yield',
    asset: 'USDT',
    apy: 4.2,
    tvl: 2800000,
    description: 'Earn yield on stablecoin deposits',
    iconUrl: null,
    network: 'polygon',
  },
]

// Environment-specific addresses
const addresses: Record<string, Record<string, string>> = {
  development: {
    'treasury-bill': '0x94F8e70EbA362A68ee71a3e1D6516526BdD92014',
    'stablecoin-yield': '0xDev0987654321098765432109876543210987654321',
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

// Environment-specific investing token addresses
const investingTokenAddresses: Record<string, Record<string, string>> = {
  development: {
    'treasury-bill': '0xfd4f11a2aae86165050688c85ec9ed6210c427a9',
    'stablecoin-yield': '0xDevUSDT12345678901234567890123456789012345',
  },
  staging: {
    'treasury-bill': '0xStgUSDC12345678901234567890123456789012345',
    'stablecoin-yield': '0xStgUSDT12345678901234567890123456789012345',
  },
  production: {
    'treasury-bill': '0xProdUSDC12345678901234567890123456789012345',
    'stablecoin-yield': '0xProdUSDT12345678901234567890123456789012345',
  },
}

// Get current environment
const currentEnv = process.env.REACT_APP_ENV || 'development'

// Combine base product data with environment-specific addresses
const products: EarnProduct[] = baseProducts.map((product) => ({
  ...product,
  address: addresses[currentEnv][product.id] || '0x0000000000000000000000000000000000000000',
  investingTokenAddress:
    investingTokenAddresses[currentEnv][product.id] || '0x0000000000000000000000000000000000000000',
}))

export { products }

