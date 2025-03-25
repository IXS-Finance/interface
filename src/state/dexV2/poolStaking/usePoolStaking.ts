import usePoolGaugeQuery, { PoolGauge } from 'hooks/dex-v2/queries/usePoolGaugeQuery'
import { isQueryLoading } from 'hooks/dex-v2//queries/useQueryHelpers'
import { bnum, getAddressFromPoolId, isSameAddress } from 'lib/utils'
import { LiquidityGauge } from 'services/balancer/contracts/contracts/liquidity-gauge'
import { getAddress } from '@ethersproject/address'
import { parseUnits } from '@ethersproject/units'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { POOLS } from 'constants/dexV2/pools'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from '../tokens/hooks/useTokens'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppState } from 'state'
import { setPoolGaugeQuery } from '.'

export const usePoolStaking = () => {
  const { poolGaugeQuery } = useSelector((state: AppState) => state.dexV2Staking)
  const dispatch = useDispatch()

  // COMPOSABLES / HOOKS
  const { balanceFor } = useTokens()
  const { account, isWalletReady } = useWeb3()

  const poolGauge = poolGaugeQuery?.data as PoolGauge
  // The current preferential gauge for the specified pool.
  const preferentialGaugeAddress = poolGauge?.pool?.gauge?.address
  const poolId = poolGauge?.pool?.id
  const poolAddress = poolGauge?.pool?.address

  const refetchPoolGauges = poolGaugeQuery?.refetch

  // const { userGaugeSharesQuery, userBoostsQuery, stakedSharesQuery } = useUserData()
  // const userGaugeShares = userGaugeSharesQuery.data
  const userGaugeShares: any = []
  // const refetchUserGaugeShares = userGaugeSharesQuery.refetch

  // const boostsMap = userBoostsQuery.data
  // const refetchUserBoosts = userBoostsQuery.refetch

  // const _stakedShares: any = stakedSharesQuery.data
  // const refetchStakedShares = stakedSharesQuery.refetch
  // const isRefetchingStakedShares = stakedSharesQuery.isRefetching
  const isRefetchingStakedShares = false

  // COMPUTED VALUES (recalculated every render)
  const isLoading = poolGaugeQuery ? isQueryLoading(poolGaugeQuery) : false
  // ||
  // (isWalletReady &&
  //   (isQueryLoading(stakedSharesQuery) ||
  //     isQueryLoading(userGaugeSharesQuery) ||
  //     isQueryLoading(userBoostsQuery)))

  const isStakablePool = preferentialGaugeAddress

  // const stakedShares = poolId ? _stakedShares?.[poolId] || '0' : '0'
  const stakedShares = '0'
  // const boost = !boostsMap || !poolId ? '1' : boostsMap[poolId] || '1'

  // METHODS
  const setCurrentPool = (id: string) => {}

  const refetchAllPoolStakingData = async () => {
    return Promise.all([
      refetchPoolGauges(),
      // refetchStakedShares(),
      // refetchUserGaugeShares(),
      // refetchUserBoosts(),
    ])
  }

  const stake = async () => {
    if (!preferentialGaugeAddress) throw new Error(`No preferential gauge found for this pool: ${poolId}`)
    const gauge = new LiquidityGauge(preferentialGaugeAddress)
    // User's full BPT balance for this pool.
    const userBptBalance = parseUnits(balanceFor(getAddress(poolAddress)))
    return await gauge.stake(userBptBalance)
  }

  const unstake = async () => {
    // if (!poolGauge?.pool?.gauges) throw new Error('Unable to unstake, no pool gauges')
    // const gaugesWithUserBalance = await filterGaugesWhereUserHasBalance(poolGauge, account)
    // const firstGaugeWithUserBalance = gaugesWithUserBalance[0]
    // const gauge = new LiquidityGauge(firstGaugeWithUserBalance.id)
    // const balance = await gauge.balance(account)
    // return await gauge.unstake(balance)
  }

  const fetchPreferentialGaugeAddress = async (poolAddress: string): Promise<string> => {
    try {
      const data = await subgraphRequest<{
        pool: { preferentialGauge: { id: string } }
      }>({
        url: configService.network.subgraphs.gauge,
        query: {
          pool: {
            __args: {
              id: poolAddress.toLowerCase(),
            },
            preferentialGauge: {
              id: true,
            },
          },
        },
      })

      return data.pool.preferentialGauge.id
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const injectPoolGaugeQuery = (poolGaugeQuery: any) => {
    dispatch(setPoolGaugeQuery(poolGaugeQuery))
  }

  return {
    // STATE/COMPUTED
    isLoading,
    stakedShares,
    isStakablePool,
    preferentialGaugeAddress,
    // boost,
    isRefetchingStakedShares,
    poolGauge,
    // METHODS
    setCurrentPool,
    // refetchStakedShares,
    refetchAllPoolStakingData,
    stake,
    unstake,
    fetchPreferentialGaugeAddress,
    injectPoolGaugeQuery,
  }
}
