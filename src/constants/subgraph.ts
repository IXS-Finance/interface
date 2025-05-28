export const SUBGRAPH_URLS: Record<string, Record<number, string>> = {
  LBP: {
    [137]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/lbp-subgraph-polygon/api',
    [80002]: 'https://api.studio.thegraph.com/proxy/71824/ixs-lbp-subgraph-test/version/latest',
    [84532]: 'https://subgraph.satsuma-prod.com/788670ba78ee/ixswap/ixs-lbp-base-sepolia/api',
  },
  EARN_V2_TREASURY: {
    [11155111]: 'https://api.studio.thegraph.com/query/27946/earnv-2/v1.1.1',
  },
}
