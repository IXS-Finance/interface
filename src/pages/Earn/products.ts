const currentEnv = process.env.REACT_APP_ENV || 'development'

// Define product interface
export interface EarnProduct {
  id: string
  name: string
  type: 'EARN_V2_TREASURY' | 'EARN_V2_HYCB'
  subgraphFeatureType: string
  description: string
  iconUrl: string | null
  tvl?: number
  minimumDeposit: number // minimum deposit amount in the investing token
  maximumDeposit?: number // maximum deposit amount in the investing token
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
  learnMoreUrl?: string // optional URL for more information about the product
  apyUpto: number // optional maximum APY for the product
}

// Base product data without environment-specific values
const baseProducts: Omit<EarnProduct, 'address' | 'investingTokenAddress' | 'opentradeVaultAddress'>[] = [
  // {
  //   id: 'treasury-bill',
  //   name: 'Flexible TERM USDC Vault',
  //   type: 'EARN_V2_TREASURY',
  //   tvl: 5000000,
  //   minimumDeposit: 100,
  //   maximumDeposit: 100,
  //   description: 'US Treasuries, USD Money Market Funds',
  //   iconUrl: '/images/earn/icon01.svg',
  //   underlyingAsset: 'U.S. Treasury Bill',
  //   network: 'ethereum',
  //   investingTokenSymbol: 'USDC',
  //   investingTokenDecimals: 6,
  //   chainId: currentEnv === 'development' ? 11155111 : 1,
  //   bgUrl: '/images/earn/bg-tby.svg',
  //   bgFullUrl: '/images/earn/image01.svg',
  //   learnMoreUrl:
  //     'https://docs.opentrade.io/stablecoin-yield/stablecoin-yield-vaults/money-market-fund-vaults/franklin-templeton-benji-mmf-vault',
  // },
  {
    id: 'hycb',
    name: 'High Yield Corporate Bond',
    type: 'EARN_V2_HYCB',
    subgraphFeatureType: 'EARN_AVALANCHE',
    tvl: 2800000,
    minimumDeposit: 1,
    maximumDeposit: 1,
    description: 'BlackRock High Yield Corporate Bond ETF',
    iconUrl: '/images/earn/icon02.svg',
    underlyingAsset: 'BlackRock High Yield Corporate Bond ETF',
    network: 'avalanche',
    investingTokenSymbol: 'USDC',
    investingTokenDecimals: 6,
    chainId: currentEnv === 'development' ? 43113 : 43114,
    bgUrl: '/images/earn/bg-hycb.svg',
    bgFullUrl: '/images/earn/image02.svg',
    learnMoreUrl: 'https://docs.opentrade.io/stablecoin-yield/stablecoin-yield-vaults/high-yield-corporate-bond-vault',
    apyUpto: 0.085,
  },
  {
    id: 'treasury-bill-avalanche',
    name: 'Money Market Fund',
    type: 'EARN_V2_TREASURY',
    subgraphFeatureType: 'EARN_AVALANCHE',
    tvl: 5000000,
    minimumDeposit: 1,
    maximumDeposit: 1,
    description: 'U.S. Treasury Bills, Fidelity USD Money Market Fund,\n and other highly liquid USD MMFs.',
    iconUrl: '/images/earn/icon01.svg',
    underlyingAsset: 'U.S. Treasury Bill',
    network: 'avalanche',
    investingTokenSymbol: 'USDC',
    investingTokenDecimals: 6,
    chainId: currentEnv === 'development' ? 43113 : 43114,
    bgUrl: '/images/earn/bg-tby.svg',
    bgFullUrl: '/images/earn/image01.svg',
    learnMoreUrl:
      'https://docs.opentrade.io/stablecoin-yield/stablecoin-yield-vaults/money-market-fund-vaults/franklin-templeton-benji-mmf-vault',
    apyUpto: 0.04,
  },
]

// Environment-specific addresses
const addresses: Record<string, Record<string, string>> = {
  development: {
    'treasury-bill': '0xDDdc40135eF85848d977B9f9317cF3EE02E5C226',
    'treasury-bill-avalanche': '0x2D49B183CE78201bA5627013F8c9442477e7C98b',
    hycb: '0x5E25F811828D063E436A3923e00C7F9aDAdE39BF',
  },
  staging: {
    'treasury-bill': '0xStg1234567890123456789012345678901234567890',
    hycb: '0xStg0987654321098765432109876543210987654321',
  },
  production: {
    'treasury-bill': '0xProd1234567890123456789012345678901234567890',
    hycb: '0x9815985a4fa45D817564D7FdEA0356e65AbB8e52',
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
      avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    },
  },
  production: {
    USDC: {
      ethereum: '0xProdUSDC12345678901234567890123456789012345',
      avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
    },
  },
}

// Environment-specific opentrade vault addresses
const opentradeVaultAddresses: Record<string, Record<string, string>> = {
  development: {
    'treasury-bill': '0xaE3cfBe878FB66070030B7cb29cfe0Deeac624DD',
    'treasury-bill-avalanche': '0xBaE016C19F5b51D0Ca0af627C61EC854C712c290',
    hycb: '0xc982983B42178448C72B0fa1E7af8CbA5f79bBE3',
  },
  staging: {
    'treasury-bill': '0xStgOTVTB00000000000000000000000000000000000',
    hycb: '0x1D7E71d0CB499C31349DF3E9205A4b16bcCF2536',
  },
  production: {
    'treasury-bill': '0xProdOTVTB0000000000000000000000000000000000',
    hycb: '0x1D7E71d0CB499C31349DF3E9205A4b16bcCF2536',
  },
}

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
