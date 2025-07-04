export const SUBGRAPH_URLS: Record<string, Record<number, string>> = {
  LBP: {
    [137]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/lbp-subgraph-polygon/api',
    [80002]: 'https://api.studio.thegraph.com/proxy/71824/ixs-lbp-subgraph-test/version/latest',
    [84532]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/ixs-lbp-base-sepolia/api',
    [8453]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/lbp-base-mainnet/api',
  },
  EARN_V2_TREASURY: {
    [11155111]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/ixs-earn-sepolia-treasury/api',
  },
  EARN_V2_HYCB: {
    [43113]: 'https://api.studio.thegraph.com/query/27946/earnv-2/version/latest',
    [43114]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/hycb-avax/api',
  },
}
