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
  [SUBGRAPH_QUERY.POOLS]: {
    84532: baseSepoliaConfig.subgraphs.gauge,
  },
}
