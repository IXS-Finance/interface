import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatUnits } from '@ethersproject/units'

import { PoolGauge } from 'hooks/dex-v2/queries/usePoolGaugeQuery'
import { isQueryLoading } from 'hooks/dex-v2//queries/useQueryHelpers'
import { LiquidityGauge } from 'services/balancer/contracts/liquidity-gauge'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from '../tokens/hooks/useTokens'

import { AppState } from 'state'
import { setPoolGaugeQuery, setPoolStakingState } from '.'
import { Pool } from 'services/pool/types'
import { BigNumber } from 'ethers'

export type UsePoolStakingProps = {
  gaugeAddress?: string // The current preferential gauge for the specified pool.
}

export const usePoolStaking = (props: UsePoolStakingProps) => {
  const { gaugeAddress } = props

  const {
    poolGaugeQuery,
    currentPool,
    stakedBalance = '0',
    isFetchingStakedBalance = false,
  } = useSelector((state: AppState) => state.dexV2Staking)
  const dispatch = useDispatch()
  const { balanceFor } = useTokens()
  const { account } = useWeb3()

  const poolGauge = poolGaugeQuery?.data as PoolGauge
  // The current preferential gauge for the specified pool.
  // const preferentialGaugeAddress = poolGauge?.pool?.gauge?.address
  const poolId = poolGauge?.pool?.id
  const poolAddress = poolGauge?.pool?.address

  const refetchPoolGauges = poolGaugeQuery?.refetch
  const isLoading = poolGaugeQuery ? isQueryLoading(poolGaugeQuery) : false
  // ||
  // (isWalletReady &&
  //   (isQueryLoading(stakedSharesQuery) ||
  //     isQueryLoading(userGaugeSharesQuery) ||
  //     isQueryLoading(userBoostsQuery)))

  const isStakablePool = gaugeAddress
  const unstakeBalance = poolAddress ? balanceFor(poolAddress) : '0'

  async function getBalance() {
    if (!account || !gaugeAddress) return

    dispatch(setPoolStakingState({ isFetchingStakedBalance: true }))
    const gauge = new LiquidityGauge(gaugeAddress)
    const balanceBpt = await gauge.balance(account)
    const balance = formatUnits(balanceBpt.toString(), currentPool?.onchain?.decimals || 18)
    dispatch(setPoolStakingState({ stakedBalance: balance, isFetchingStakedBalance: false }))
  }

  const refetchAllPoolStakingData = async () => {
    return Promise.all([
      refetchPoolGauges(),
      getBalance(),
      // refetchStakedShares(),
      // refetchUserGaugeShares(),
      // refetchUserBoosts(),
    ])
  }

  const stake = async (amount: BigNumber) => {
    if (!gaugeAddress) throw new Error(`No preferential gauge found for this pool: ${poolId}`)
    const gauge = new LiquidityGauge(gaugeAddress)

    return await gauge.stake(amount)
  }

  const unstake = async (amount: BigNumber) => {
    if (!gaugeAddress) throw new Error('Unable to unstake, no pool gauges')
    const gauge = new LiquidityGauge(gaugeAddress)

    return await gauge.unstake(amount)
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

  const injectCurrentPool = (pool: Pool | undefined) => {
    dispatch(setPoolStakingState({ currentPool: pool }))
  }

  useEffect(() => {
    getBalance()
  }, [gaugeAddress])

  return {
    // STATE/COMPUTED
    isLoading,
    isStakablePool,
    // boost,
    poolGauge,
    // METHODS
    refetchAllPoolStakingData,
    stake,
    unstake,
    fetchPreferentialGaugeAddress,
    injectPoolGaugeQuery,
    isFetchingStakedBalance,
    stakedBalance,
    injectCurrentPool,
    unstakeBalance,
  }
}
