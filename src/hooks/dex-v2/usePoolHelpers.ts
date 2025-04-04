import { AprBreakdown, PoolType } from '@ixswap1/dex-v2-sdk'
import { getAddress } from '@ethersproject/address'
import { cloneDeep, uniq, uniqWith } from 'lodash'

import { PoolToken, allLinearTypes, AnyPool, Pool, SubPool } from 'services/pool/types'
import useNumbers, { FNumFormats, numF } from './useNumbers'
import { configService } from 'services/config/config.service'
import { bnum, includesAddress, isSameAddress, removeAddress, selectByAddress } from 'lib/utils'
import { poolWarning, usePoolWarning } from './usePoolWarning'
import { DeprecatedDetails, PoolWarning } from 'types/pools'
import { APR_THRESHOLD } from 'constants/dexV2/pools'
import { isPoolBoostsEnabled } from './useNetwork'

const POOLS = configService.network.pools

interface TokenTreeOpts {
  includeLinearUnwrapped?: boolean
  includePreMintedBpt?: boolean
}

export function isPreMintedBptType(poolType: PoolType): boolean {
  // Currently equivalent to isComposableStableLike but will be extended later
  // with managed and composable weighted pools.
  return isStablePhantom(poolType) || isComposableStable(poolType)
}

export function isLinear(poolType: PoolType): boolean {
  return allLinearTypes.includes(poolType)
}

export function wNativeAssetAddress() {
  return configService.network.tokens.Addresses.wNativeAsset
}

export function isWrappedNativeAsset(pool: AnyPool): boolean {
  return includesAddress(pool.tokensList || [], wNativeAssetAddress())
}

/**
 * Parse token tree and extract all token addresses.
 *
 * @param {PoolToken[]} tokenTree - A pool's token tree.
 * @param {TokenTreeOpts} options
 * @returns {string[]} Array of token addresses in tree.
 */
export function tokenTreeNodes(
  tokenTree: PoolToken[],
  options: TokenTreeOpts = { includeLinearUnwrapped: false }
): string[] {
  const addresses: string[] = []

  for (const token of tokenTree) {
    addresses.push(token.address)
    if (token.token?.pool?.tokens) {
      if (!options.includeLinearUnwrapped && isLinear(token.token.pool.poolType)) {
        addresses.push(token.token.pool.tokens[token.token.pool.mainIndex].address)
      } else {
        const nestedTokens = tokenTreeNodes(token.token.pool?.tokens, options)
        addresses.push(...nestedTokens)
      }
    }
  }

  return uniq(addresses)
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

export function isStable(poolType: PoolType): boolean {
  return poolType === PoolType.Stable
}

export function isMetaStable(poolType: PoolType): boolean {
  return poolType === PoolType.MetaStable
}

export function isStablePhantom(poolType: PoolType): boolean {
  return poolType === PoolType.StablePhantom
}

export function isComposableStable(poolType: PoolType): boolean {
  return poolType === PoolType.ComposableStable
}

export function isFx(poolType: PoolType | string): boolean {
  return poolType === 'FX'
}

export function isWeighted(poolType: PoolType): boolean {
  return poolType === PoolType.Weighted
}

export function isManaged(poolType: PoolType): boolean {
  // Correct terminology is managed pools but subgraph still returns poolType = "Investment"
  return poolType === PoolType.Investment
}

export function isLiquidityBootstrapping(poolType: PoolType): boolean {
  return poolType === PoolType.LiquidityBootstrapping
}

export function isWeightedLike(poolType: PoolType): boolean {
  return isWeighted(poolType) || isManaged(poolType) || isLiquidityBootstrapping(poolType)
}

export function isStableLike(poolType: PoolType): boolean {
  return (
    isStable(poolType) ||
    isMetaStable(poolType) ||
    isStablePhantom(poolType) ||
    isComposableStable(poolType) ||
    isFx(poolType)
  )
}

export function isComposableStableV1(pool: Pool): boolean {
  return isComposableStable(pool.poolType) && pool.poolTypeVersion === 1
}

export function isComposableStableLike(poolType: PoolType): boolean {
  return isStablePhantom(poolType) || isComposableStable(poolType)
}

export function isSwappingHaltable(poolType: PoolType): boolean {
  return isManaged(poolType) || isLiquidityBootstrapping(poolType)
}

/**
 * Checks if the pool is to be considered 'deep'. Deep pools are pools that the
 * UI treats differently because it understands that it contains nested pools.
 * This is used to enable the generalised deep pool join/exit flow for example.
 */
export function isDeep(pool: Pool): boolean {
  return configService.network.pools.Deep.includes(pool.id)
}

/**
 * Checks if pool ID is included in the list of deprecated pools
 * @param {string} id - The pool ID to check
 * @returns {boolean} True if included in list
 */
export function deprecatedDetails(id: string): DeprecatedDetails | undefined {
  return POOLS.Deprecated?.[id.toLowerCase()]
}

/**
 * Gets weight of token in pool if relevant, e.g if it's a weighted pool.
 * If not, returns 0.
 *
 * @param {Pool} pool - The pool to check
 * @param {string} tokenAddress - The address of the token to check
 * @returns {number} The weight of the token in the pool
 */
export function tokenWeight(pool: Pool, tokenAddress: string): number {
  if (isStableLike(pool.poolType)) return 0
  if (!pool?.onchain?.tokens) return 0

  const { nativeAsset, wNativeAsset } = configService.network.tokens.Addresses

  if (isSameAddress(tokenAddress, nativeAsset)) {
    return selectByAddress(pool.onchain.tokens, wNativeAsset)?.weight || 1
  }
  return selectByAddress(pool.onchain.tokens, tokenAddress)?.weight || 1
}

/**
 * Gets all pool token addresses that can possibly be used to join a pool.
 *
 * @param {Pool} pool - The pool to check
 * @returns {string[]} The addresses of the tokens that can be used to join the pool
 */
export function joinTokens(pool: Pool): string[] {
  let addresses: string[] = []

  addresses = isDeep(pool) ? tokenTreeNodes(pool.tokens) : pool.tokensList

  return removeAddress(pool.address, addresses)
}

export function orderByWeight<T extends { weight?: string | null }>(tokens: T[]): T[] {
  return tokens.slice().sort((a, b) => parseFloat(b.weight || '0') - parseFloat(a.weight || '0'))
}

/**
 * Get all unique token tree tokens as flat array.
 *
 * @param {PoolToken[]} tokenTree - A pool's token tree.
 * @param {TokenTreeOpts} options
 * @returns {PoolToken[]} Flat array of tokens in tree.
 */
export function flatTokenTree(
  pool: Pool | SubPool,
  options: TokenTreeOpts = {
    includeLinearUnwrapped: false,
    includePreMintedBpt: false,
  }
): PoolToken[] {
  const tokens: PoolToken[] = []

  const nestedTokens = pool?.tokens || []

  nestedTokens.forEach((token) => {
    if (!isSameAddress(pool.address, token.address)) {
      tokens.push(token)
    }

    if (token.token?.pool?.tokens) {
      if (!options.includeLinearUnwrapped && isLinear(token.token.pool.poolType)) {
        tokens.push(token.token.pool.tokens[token.token.pool.mainIndex])
      } else {
        const nestedTokens = flatTokenTree(token.token.pool, options)
        tokens.push(...nestedTokens)
      }
    }
  })

  // Avoid duplicated tokens with the same address
  return uniqWith(tokens, (token1, token2) => isSameAddress(token1.address, token2.address))
}

/**
 * Removes pre-minted pool token from tokensList.
 *
 * @param {Pool} pool - Pool to get tokensList from.
 * @returns tokensList excluding pre-minted BPT address.
 */
type TokensListExclBptPoolProps = Pick<Pool, 'address' | 'tokensList'>
export function tokensListExclBpt(pool: TokensListExclBptPoolProps): string[] {
  return removeAddress(pool.address, pool.tokensList)
}

/**
 * @summary Orders pool tokens by weight if weighted pool
 */
export function orderedPoolTokens(pool: Pool, tokens: PoolToken[]): PoolToken[] {
  if (isDeep(pool)) {
    const leafs = tokenTreeLeafs(tokens)
    const flatTokens = flatTokenTree(pool)
    return flatTokens.filter((token) => includesAddress(leafs, token.address))
  } else if (isComposableStable(pool.poolType) || isLinear(pool.poolType)) {
    return tokens.filter((token) => !isSameAddress(token.address, pool.address))
  } else if (isStableLike(pool.poolType)) return tokens

  return orderByWeight(tokens)
}

/**
 * @summary Orders pool token addresses by weight if weighted pool
 * @returns Array of checksum addresses
 */
export function orderedTokenAddresses(pool: AnyPool): string[] {
  const sortedTokens = orderedPoolTokens(pool, pool.tokens)
  return sortedTokens.map((token) => getAddress(token?.address || ''))
}

/**
 * @summary Calculates absolute max APR given boost or not.
 * If given boost returns user's max APR.
 * If not given boost returns pool absolute max assuming 2.5x boost.
 * Used primarily for sorting tables by the APR column.
 */
export function absMaxApr(aprs: AprBreakdown, boost?: string): string {
  if (boost) {
    const nonStakingApr = bnum(aprs.swapFees).plus(aprs.tokenAprs.total).plus(aprs.rewardAprs.total)
    const stakingApr = bnum(aprs.stakingApr.min).times(boost).toString()
    return nonStakingApr.plus(stakingApr).toString()
  }

  return aprs.max.toString()
}

/**
 * @summary Checks if a pool has BAL emissions
 */
export function hasBalEmissions(aprs?: AprBreakdown): boolean {
  if (!aprs) return false
  return bnum(aprs?.stakingApr?.min || 0).gt(0)
}

/**
 * @summary Returns total APR label, whether range or single value.
 */
export function totalAprLabel(aprs: AprBreakdown, boost?: string, isConnected?: boolean): string {
  if (aprs.swapFees > APR_THRESHOLD) {
    return '-'
  }
  if (boost && boost !== '1' && isConnected) {
    return numF(absMaxApr(aprs, boost), FNumFormats.bp)
  }
  if ((hasBalEmissions(aprs) && isPoolBoostsEnabled) || aprs.protocolApr > 0) {
    const minAPR = numF(aprs.min, FNumFormats.bp)
    const maxAPR = numF(aprs.max, FNumFormats.bp)
    return `${minAPR} - ${maxAPR}`
  }

  return numF(aprs.min, FNumFormats.bp)
}

/**
 * Should hide the display of APRs for this pool.
 */
export function shouldHideAprs(poolId: string): boolean {
  if (!poolId) return false

  return poolWarning(poolId).isAffectedBy(PoolWarning.CspPoolVulnWarning)
}

export function isMigratablePool(pool: AnyPool) {
  return !!POOLS.Migrations?.[pool.id]
}

export function noInitLiquidity(pool: AnyPool): boolean {
  // Uncomment to DEBUG
  // if (
  //   pool.id ===
  //   '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014'
  // )
  //   return true;
  return bnum(pool?.totalShares || '0').eq(0)
}

/**
 * Approximate BPT price using total liquidity calculated via Coingecko prices
 * and subgraph total shares. Cannot be relied on to be 100% accurate.
 *
 * @returns USD value of 1 BPT
 */
type BptPriceForPool = Pick<Pool, 'totalLiquidity' | 'totalShares'>
export function bptPriceFor(pool: BptPriceForPool): string {
  return bnum(pool.totalLiquidity).div(pool.totalShares).toString()
}

/**
 * Calculate USD value of shares using approx. BPT price function.
 *
 * @returns USD value of shares.
 */
export function fiatValueOf(pool: BptPriceForPool, shares: string): string {
  return bnum(shares).times(bptPriceFor(pool)).toString()
}

/**
 * Updates the passed subPool by removing the preminted token from tokens and updating mainIndex accordingly.
 */
export function removeBptFromTokens(pool: SubPool) {
  if (!pool.tokens) {
    return
  }

  const premintedIndex = pool.tokens.findIndex((token) => isSameAddress(pool.address, token.address))

  if (premintedIndex === -1) return

  // Remove preminted token by index
  pool.tokens.splice(premintedIndex, 1)

  // Fix mainIndex after removing premintedBPT
  if (pool.mainIndex && premintedIndex < pool.mainIndex) {
    pool.mainIndex -= 1
  }
}

/**
 * Should recovery exits be the only option for this pool?
 *
 * @param {Pool} pool - The pool to check
 */
export function isRecoveryExitsOnly(pool: Pool): boolean {
  const isInRecoveryAndPausedMode = !!pool.isInRecoveryMode && !!pool.isPaused
  const isVulnCsPoolAndInRecoveryMode =
    poolWarning(pool.id).isAffectedBy(PoolWarning.CspPoolVulnWarning) && !!pool.isInRecoveryMode
  const isNotDeepAndCsV1 = !isDeep(pool) && isComposableStableV1(pool)

  return isInRecoveryAndPausedMode || isVulnCsPoolAndInRecoveryMode || isNotDeepAndCsV1
}

/**
 * Updates the passed subPool by removing its pre-minted tokens.
 */
export function removeBptFromPoolTokenTree(pool: SubPool) {
  if (pool.tokens) {
    removeBptFromTokens(pool)

    pool.tokens.forEach((token) => {
      if (token.token?.pool) {
        removeBptFromPoolTokenTree(token.token.pool)
      }
    })
  }
  return pool
}

/**
 * Returns a new (cloned) pool with pre-minted pool tokens removed from both tokensList and tokenTree.
 */
export function removeBptFrom(pool: Pool): Pool {
  const newPool = cloneDeep(pool)
  newPool.tokensList = tokensListExclBpt(pool)

  newPool.tokens = newPool.tokens.filter((token) => !isSameAddress(newPool.address, token.address))

  newPool.tokens.forEach((token) => {
    if (token.token?.pool) {
      removeBptFromPoolTokenTree(token.token.pool)
    }
  })
  return newPool
}

export function usePoolHelpers(pool: AnyPool | undefined) {
  const { fNum } = useNumbers()

  /**
   * Returns pool weights label
   */
  function poolWeightsLabel(pool: Pool): string {
    if (!pool?.onchain?.tokens) return ''

    if (isStableLike(pool.poolType)) {
      return Object.values(pool.onchain.tokens)
        .map((token) => token.symbol)
        .join(', ')
    }

    return Object.values(pool.onchain.tokens)
      .map(
        (token) =>
          `${fNum(token.weight, {
            style: 'percent',
            maximumFractionDigits: 0,
          })} ${token.symbol}`
      )
      .join(', ')
  }

  /**
   * COMPUTED
   */
  const isStablePool: boolean = !!pool && isStable(pool.poolType)
  const isMetaStablePool: boolean = !!pool && isMetaStable(pool.poolType)
  const isStablePhantomPool: boolean = !!pool && isStablePhantom(pool.poolType)
  const isComposableStablePool: boolean = !!pool && isComposableStable(pool.poolType)
  const isDeepPool: boolean = !!pool && isDeep(pool)
  const isShallowComposableStablePool: boolean = isComposableStablePool && !isDeepPool
  const isStableLikePool: boolean = !!pool && isStableLike(pool.poolType)
  const isComposableStableLikePool: boolean = !!pool && isComposableStableLike(pool.poolType)
  const isPreMintedBptPool: boolean = !!pool && isPreMintedBptType(pool.poolType)
  const isWeightedPool: boolean = !!pool && isWeighted(pool.poolType)
  const isWeightedLikePool: boolean = !!pool && isWeightedLike(pool.poolType)
  const isManagedPool: boolean = !!pool && isManaged(pool.poolType)
  const isLiquidityBootstrappingPool: boolean = !!pool && isLiquidityBootstrapping(pool.poolType)
  const managedPoolWithSwappingHalted: boolean = !!pool && isManagedPool && !pool.onchain?.swapEnabled
  const isWrappedNativeAssetPool: boolean = !!pool && isWrappedNativeAsset(pool)
  const poolJoinTokens: string[] = pool ? joinTokens(pool) : []
  const hasNonApprovedRateProviders: boolean =
    !!pool &&
    isWeighted(pool.poolType) &&
    !pool?.priceRateProviders?.every(
      (provider) =>
        configService.network.rateProviders['*'][provider.address] ||
        configService.network.rateProviders[provider.token?.address]?.[provider.address]
    )
  const isDeprecatedPool: boolean = !!pool && !!POOLS.Deprecated?.[pool.id]
  const isNewPoolAvailable: boolean = !!pool && !!POOLS.NewVersionAvailable?.[pool.id]

  return {
    // computed
    isStablePool,
    isMetaStablePool,
    isStablePhantomPool,
    isComposableStablePool,
    isStableLikePool,
    isComposableStableLikePool,
    isPreMintedBptPool,
    isDeepPool,
    isShallowComposableStablePool,
    isWeightedPool,
    isWeightedLikePool,
    isManagedPool,
    isLiquidityBootstrappingPool,
    managedPoolWithSwappingHalted,
    isWrappedNativeAssetPool,
    hasNonApprovedRateProviders,
    isDeprecatedPool,
    isNewPoolAvailable,
    poolJoinTokens,
    // methods
    isStable,
    isMetaStable,
    isStablePhantom,
    isStableLike,
    isWeighted,
    isLiquidityBootstrapping,
    isWeightedLike,
    isSwappingHaltable,
    isPreMintedBptType,
    isWrappedNativeAsset,
    noInitLiquidity,
    isMigratablePool,
    poolWeightsLabel,
    orderedTokenAddresses,
    orderedPoolTokens,
    joinTokens,
  }
}
