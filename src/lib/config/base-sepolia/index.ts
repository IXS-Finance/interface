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
  explorer: 'https://sepolia.etherscan.io',
  explorerName: 'Etherscan',
  subgraph: 'https://api.studio.thegraph.com/query/80624/balancer-sepolia/version/latest',
  poolsUrlV2: '',
  subgraphs: {
    main: ['https://api.studio.thegraph.com/query/24660/balancer-sepolia-v2/version/latest'],
    aave: '',
    gauge: 'https://api.studio.thegraph.com/query/24660/balancer-gauges-sepolia-beta/version/latest',
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
    logoURI: 'tokens/eth.png',
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
