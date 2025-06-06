import { Config } from '../types'
import contracts from './contracts'
import keys from './keys'
import tokens from './tokens'
import pools from './pools'
import rateProviders from './rateProviders'
import tokenlists from './tokenlists'
import { getAlchemyUrlFor } from 'components/Web3Provider/constants'

const config: Config = {
  key: '84532',
  chainId: 84532,
  layerZeroChainId: 10245,
  chainName: 'Base Sepolia',
  name: 'Base Sepolia',
  shortName: 'Base Sepolia',
  monorepoName: 'base-sepolia',
  slug: 'base-sepolia',
  network: 'base-sepolia',
  trustWalletNetwork: 'ethereum',
  unknown: false,
  visibleInUI: true,
  testNetwork: true,
  rpc: getAlchemyUrlFor('base-sepolia'),
  ws: ``,
  explorer: 'https://sepolia.basescan.org',
  explorerName: 'Basescan',
  subgraph: 'https://api.studio.thegraph.com/query/27946/v2-basesepolia/version/latest',
  poolsUrlV2: '',
  subgraphs: {
    main: [
      'https://api.studio.thegraph.com/query/27946/v2-basesepolia/version/latest',
      'https://api.studio.thegraph.com/query/27946/v2-basesepolia/0.3.0',
    ],
    aave: '',
    gauge: 'https://api.studio.thegraph.com/query/27946/v2-basesepolia/version/latest',
    blocks: '',
  },
  bridgeUrl: '',
  supportsEIP1559: true,
  supportsElementPools: true,
  blockTime: 12,
  nativeAsset: {
    name: 'Ether',
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    symbol: 'ETH',
    decimals: 18,
    deeplinkId: 'ether',
    logoURI:
      'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png',
    minTransactionBuffer: '0.05',
  },
  thirdParty: {
    coingecko: {
      nativeAssetId: 'ethereum',
      platformId: 'ethereum',
    },
  },
  addresses: {
    ...contracts,
  },
  pools,
  tokens,
  keys,
  gauges: {
    type: 2,
    weight: 100,
  },
  tokenlists,
  rateProviders,
}

export default config
