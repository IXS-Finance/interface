import baseSepoliaConfig from '../lib/config/base-sepolia';

export enum SUBGRAPH_QUERY {
  LBP,
  POOLS,
}
export const SUBGRAPH_URLS: Record<string, Record<number, string>> = {
  [SUBGRAPH_QUERY.LBP]: {
    [137]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/lbp-subgraph-polygon/api',
    [80002]: 'https://api.studio.thegraph.com/proxy/71824/ixs-lbp-subgraph-test/version/latest',
    [84532]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/ixs-lbp-base-sepolia/api',
  },
  EARN_ETHEREUM: {
    [11155111]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/ixs-earn-sepolia-treasury/api',
  },
  EARN_AVALANCHE: {
    [43113]: 'https://api.studio.thegraph.com/query/89103/earnv-2/version/latest',
    [43114]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/hycb-avax/api',
  },
  [SUBGRAPH_QUERY.POOLS]: {
    84532: baseSepoliaConfig.subgraphs.gauge,
  },
}
