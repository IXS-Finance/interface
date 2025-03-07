import { TokenConstants } from '../types'

const tokens: TokenConstants = {
  Popular: {
    Symbols: ['USDC', 'TIXS', 'USDT', 'WETH'],
  },
  InitialSwapTokens: {
    input: '0xb6cd7297d7f0D761C5C395383219333d47F47b2a',
    output: '0x8e3b0aEEF4b75d5aF86eF027fFe2d7C2AeC21CA4',
  },
  Addresses: {
    nativeAsset: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    wNativeAsset: '0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2',
    WETH: '0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2',
    USDC: '0x8e3b0aEEF4b75d5aF86eF027fFe2d7C2AeC21CA4',
  },
  PriceChainMap: {
    /**
     * Addresses must be lower case and map from sepolia to mainnet, e.g
     * [sepolia address]: mainnet address
     */
    // WETH
    '0x4a2b0767ACEE85C7825F09F48A9347285F58a5C2': '0x4200000000000000000000000000000000000006',
    // USDC
    '0x8e3b0aEEF4b75d5aF86eF027fFe2d7C2AeC21CA4': '0xD971d0d96cc21576fbbc237C7a5B27A249cF67ca',
    // USDT
    '0xb6cd7297d7f0D761C5C395383219333d47F47b2a': '0xbCDfB2F1c0f9237274736fda5Bd290CAF467B69A',
    // TIXS
    '0x949546713004ee02537292b1F41046f705909191': '0x7913B2F933911c4FCf29DA62DB0Db2CF3CdEA894',
  },
}

export default tokens
