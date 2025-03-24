import usePoolGaugesQuery, { PoolGauges } from 'hooks/dex-v2/queries/usePoolGaugesQuery'
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

export const usePoolStaking = (initialPoolId?: string) => {
  // STATE
  const [poolId, setPoolId] = useState<string | undefined>(initialPoolId)
  const poolAddress = poolId ? getAddressFromPoolId(poolId) : undefined

  // COMPOSABLES / HOOKS
  const { balanceFor } = useTokens()
  const { account, isWalletReady } = useWeb3()

  // Queries
  const poolGaugesQuery = usePoolGaugesQuery(poolAddress)
  const poolGauges: any = poolGaugesQuery.data
  const refetchPoolGauges = poolGaugesQuery.refetch

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
  const isLoading = isQueryLoading(poolGaugesQuery)
  // ||
  // (isWalletReady &&
  //   (isQueryLoading(stakedSharesQuery) ||
  //     isQueryLoading(userGaugeSharesQuery) ||
  //     isQueryLoading(userBoostsQuery)))

  const preferentialGaugeAddress = poolGauges?.pool?.preferentialGauge?.id

  // const isStakablePool =
  //   !!poolId &&
  //   poolGauges?.liquidityGauges?.[0]?.id !== undefined &&
  //   POOLS.Stakable.VotingGaugePools.concat(POOLS.Stakable.AllowList).includes(poolId)

  // const stakedShares = poolId ? _stakedShares?.[poolId] || '0' : '0'
  const stakedShares = '0'
  // const boost = !boostsMap || !poolId ? '1' : boostsMap[poolId] || '1'

  const gaugeAddresses: string[] = poolGauges?.pool?.gauges?.map((gauge: any) => gauge.id) || []

  const userGaugeSharesMap: Record<string, string> = userGaugeShares
    ? userGaugeShares.reduce((acc: Record<string, string>, share: any) => {
        acc[share.gauge.id] = share.balance
        return acc
      }, {})
    : {}

  const hasNonPrefGaugeBalance =
    poolGauges && userGaugeShares && preferentialGaugeAddress
      ? gaugeAddresses.some(
          (gaugeAddress: string) =>
            !isSameAddress(gaugeAddress, preferentialGaugeAddress) &&
            bnum(userGaugeSharesMap[gaugeAddress] || '0').gt(0)
        )
      : false

  // METHODS
  const setCurrentPool = (id: string) => {
    setPoolId(id)
  }

  const refetchAllPoolStakingData = async () => {
    return Promise.all([
      refetchPoolGauges(),
      // refetchStakedShares(),
      // refetchUserGaugeShares(),
      // refetchUserBoosts(),
    ])
  }

  const stake = async () => {
    // if (!poolAddress) throw new Error('No pool to stake.')
    // if (!preferentialGaugeAddress)
    //   throw new Error(`No preferential gauge found for this pool: ${poolId}`)
    // const gauge = new LiquidityGauge(preferentialGaugeAddress)
    // // User's full BPT balance for this pool.
    // const userBptBalance = parseUnits(balanceFor(getAddress(poolAddress)))
    // return await gauge.stake(userBptBalance)
  }

  const unstake = async () => {
    // if (!poolGauges?.pool?.gauges) throw new Error('Unable to unstake, no pool gauges')
    // const gaugesWithUserBalance = await filterGaugesWhereUserHasBalance(poolGauges, account)
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

  return {
    // STATE/COMPUTED
    isLoading,
    stakedShares,
    // isStakablePool,
    // boost,
    hasNonPrefGaugeBalance,
    isRefetchingStakedShares,
    preferentialGaugeAddress,
    poolGauges,
    // METHODS
    setCurrentPool,
    // refetchStakedShares,
    refetchAllPoolStakingData,
    stake,
    unstake,
    fetchPreferentialGaugeAddress,
  }
}

async function filterGaugesWhereUserHasBalance(poolGauges: PoolGauges, userAddress: string) {
  // Insert user's balance in gauge objects
  const gaugesWithBalance = await Promise.all(
    poolGauges.pool.gauges.map(async (gauge: any) => {
      const gaugeInstance = new LiquidityGauge(gauge.id)
      const balance = await gaugeInstance.balance(userAddress)
      return { ...gauge, balance: balance?.toString() }
    })
  )

  const gaugesWhereUserHasBalance = gaugesWithBalance.filter((gauge: any) => gauge.balance !== '0')
  if (gaugesWhereUserHasBalance.length === 0) {
    throw new Error(`User doesn't have any balance for any gauges.`)
  }
  return gaugesWhereUserHasBalance
}
