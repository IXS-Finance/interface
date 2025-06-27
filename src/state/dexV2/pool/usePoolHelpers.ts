import { AprBreakdown, PoolType } from '@ixswap1/dex-v2-sdk';
import { cloneDeep, uniq, uniqWith } from 'lodash';

import { AnyPool, Pool, PoolToken, SubPool, allLinearTypes } from 'services/pool/types'
import { bnum, includesAddress, isSameAddress, removeAddress, selectByAddress } from 'lib/utils'

interface TokenTreeOpts {
  includeLinearUnwrapped?: boolean;
  includePreMintedBpt?: boolean;
}

export function isLinear(poolType: PoolType): boolean {
  return allLinearTypes.includes(poolType);
}

/**
 * Removes pre-minted pool token from tokensList.
 *
 * @param {Pool} pool - Pool to get tokensList from.
 * @returns tokensList excluding pre-minted BPT address.
 */
export function tokensListExclBpt(pool: Pool): string[] {
  return removeAddress(pool.address, pool.tokensList)
}

/**
 * Parse token tree and extract all leaf token addresses.
 *
 * @param {PoolToken[]} tokenTree - A pool's token tree.
 * @param {TokenTreeOpts} options
 * @returns {string[]} Array of token addresses in tree.
 */
export function tokenTreeLeafs(
  tokenTree: PoolToken[],
  options: TokenTreeOpts = { includeLinearUnwrapped: false }
): string[] {
  const addresses: string[] = []

  for (const token of tokenTree) {
    if (token.token?.pool?.tokens) {
      if (!options.includeLinearUnwrapped && isLinear(token.token.pool.poolType)) {
        addresses.push(token.token.pool.tokens[token.token.pool.mainIndex].address)
      } else {
        const nestedTokens = tokenTreeLeafs(token.token.pool.tokens, options)
        addresses.push(...removeAddress(token.address, nestedTokens))
      }
    } else if (!token.token?.pool?.poolType) {
      addresses.push(token.address)
    }
  }

  return uniq(addresses)
}
