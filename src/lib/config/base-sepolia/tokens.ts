import { TokenConstants } from '../types'

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['USDC', 'TIXS', 'USDT', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    output: '0xb19382073c7A0aDdbb56Ac6AF1808Fa49e377B75',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2',
    WETH: '0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2',
  },
  PriceChainMap: {
    /**
     * Addresses must be lower case and map from sepolia to mainnet, e.g
     * [sepolia address]: mainnet address
     */
    // WETH
    '0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2': '0x4200000000000000000000000000000000000006',
    // USDC
    '0xA9c2c7D5E9bdA19bF9728384FFD3cF71Ada5dfcB': '0xD971d0d96cc21576fbbc237C7a5B27A249cF67ca',
    // USDT
    '0x142953B2F88D0939FD9f48F4bFfa3A2BFa21e4F8': '0xbCDfB2F1c0f9237274736fda5Bd290CAF467B69A',
    // TIXS
    '0x949546713004ee02537292b1F41046f705909191': '0x7913B2F933911c4FCf29DA62DB0Db2CF3CdEA894'
  },
}

export default tokens
