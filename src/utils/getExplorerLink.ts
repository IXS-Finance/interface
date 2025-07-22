const ETHERSCAN_PREFIXES: { [chainId: number]: string } = {
  3: 'ropsten.',
  4: 'rinkeby.',
  5: 'goerli.',
  42: 'kovan.',
  80001: 'mumbai.',
  80002: 'amoy.',
  137: '',
  84532: 'sepolia.',
  8453: '',
  7849306: 'ozean-testnet.',
  1001: 'kairos.',
  8217: '',
  151: 'redbelly.',
  153: 'redbelly.testnet.',
  43114: '',
  43113: 'testnet.',

}
const CHAIN_EXPLORERS: { [chainId: number]: string } = {
  3: 'etherscan.io',
  4: 'etherscan.io',
  5: 'etherscan.io',
  42: 'etherscan.io',
  80001: 'polygonscan.com',
  80002: 'polygonscan.com',
  137: 'polygonscan.com',
  84532: 'basescan.org',
  8453: 'basescan.org',
  7849306: 'explorer.caldera.xyz',
  1001: 'kaiascan.io',
  8217: 'kaiascan.io',
  153: 'routescan.io',
  151: 'routescan.io',
  43114: 'snowtrace.io',
  43113: 'snowtrace.io',
}

export enum ExplorerDataType {
  TRANSACTION = 'transaction',
  TOKEN = 'token',
  ADDRESS = 'address',
  BLOCK = 'block',
}

/**
 * Return the explorer link for the given data and data type
 * @param chainId the ID of the chain for which to return the data
 * @param data the data to return a link for
 * @param type the type of the data
 */
export function getExplorerLink(chainId: any, data: string, type: ExplorerDataType): string {
  const prefix = `https://${ETHERSCAN_PREFIXES[chainId] ?? ''}${CHAIN_EXPLORERS[chainId] ?? 'etherscan.io'}`

  switch (type) {
    case ExplorerDataType.TRANSACTION: {
      return `${prefix}/tx/${data}`
    }
    case ExplorerDataType.TOKEN: {
      return `${prefix}/token/${data}`
    }
    case ExplorerDataType.BLOCK: {
      return `${prefix}/block/${data}`
    }
    case ExplorerDataType.ADDRESS:
    default: {
      return `${prefix}/address/${data}`
    }
  }
}
