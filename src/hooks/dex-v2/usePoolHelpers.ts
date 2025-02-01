import { AprBreakdown, PoolType } from '@ixswap1/dex-v2-sdk';
import { getAddress } from '@ethersproject/address';
import { cloneDeep, uniq, uniqWith } from 'lodash';

import {
  PoolToken,
  allLinearTypes,
} from 'services/pool/types';
import {
  removeAddress,
} from 'lib/utils';

interface TokenTreeOpts {
  includeLinearUnwrapped?: boolean;
  includePreMintedBpt?: boolean;
}

export function isLinear(poolType: PoolType): boolean {
  return allLinearTypes.includes(poolType);
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
  const addresses: string[] = [];

  for (const token of tokenTree) {
    if (token.token?.pool?.tokens) {
      if (
        !options.includeLinearUnwrapped &&
        isLinear(token.token.pool.poolType)
      ) {
        addresses.push(
          token.token.pool.tokens[token.token.pool.mainIndex].address
        );
      } else {
        const nestedTokens = tokenTreeLeafs(token.token.pool.tokens, options);
        addresses.push(...removeAddress(token.address, nestedTokens));
      }
    } else if (!token.token?.pool?.poolType) {
      addresses.push(token.address);
    }
  }

  return uniq(addresses);
}

export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable;
}

export function isMetaStable(poolType: PoolType): boolean {
  return poolType === PoolType.MetaStable;
}

export function isStablePhantom(poolType: PoolType): boolean {
  return poolType === PoolType.StablePhantom;
}

export function isComposableStable(poolType: PoolType): boolean {
  return poolType === PoolType.ComposableStable;
}

export function isFx(poolType: PoolType | string): boolean {
  return poolType === 'FX';
}

export function isWeighted(poolType: PoolType): boolean {
  return poolType === PoolType.Weighted;
}

export function isManaged(poolType: PoolType): boolean {
  // Correct terminology is managed pools but subgraph still returns poolType = "Investment"
  return poolType === PoolType.Investment;
}

export function isLiquidityBootstrapping(poolType: PoolType): boolean {
  return poolType === PoolType.LiquidityBootstrapping;
}

export function isWeightedLike(poolType: PoolType): boolean {
  return (
    isWeighted(poolType) ||
    isManaged(poolType) ||
    isLiquidityBootstrapping(poolType)
  );
}

export function isStableLike(poolType: PoolType): boolean {
  return (
    isStable(poolType) ||
    isMetaStable(poolType) ||
    isStablePhantom(poolType) ||
    isComposableStable(poolType) ||
    isFx(poolType)
  );
}

export function isComposableStableLike(poolType: PoolType): boolean {
  return isStablePhantom(poolType) || isComposableStable(poolType);
}

export function isSwappingHaltable(poolType: PoolType): boolean {
  return isManaged(poolType) || isLiquidityBootstrapping(poolType);
}