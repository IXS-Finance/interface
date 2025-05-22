import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatUnits } from '@ethersproject/units'

import { LiquidityGauge } from 'services/balancer/contracts/liquidity-gauge'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from '../tokens/hooks/useTokens'
import useLiquidityPool from 'pages/DexV2/Dashboard/hooks/useLiquidityPool'

import { AppState } from 'state'
import { setPoolStakingState } from '.'
import { Pool } from 'services/pool/types'
import { BigNumber } from 'ethers'
import useGauges from 'hooks/dex-v2/pools/useGauges'

export type UsePoolStakingProps = {
  gaugeAddress?: string // The current preferential gauge for the specified pool.
}

export const usePoolStaking = (props: UsePoolStakingProps) => {
  const { gaugeAddress } = props

  const {
    currentPool,
    stakedBalance = '0',
    isFetchingStakedBalance = false,
  } = useSelector((state: AppState) => state.dexV2Staking)
  const dispatch = useDispatch()
  const { balanceFor, refetchAllowances } = useTokens()
  const { isLoading } = useGauges()
  const { account } = useWeb3()
  const { refetchGaugesOnChain, refetchPoolsOnChain } = useLiquidityPool()

  const poolId = currentPool?.id
  const poolAddress = currentPool?.address

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
      getBalance(),
      // refetchStakedShares(),
      // refetchUserGaugeShares(),
      // refetchUserBoosts(),
      refetchGaugesOnChain(),
      refetchPoolsOnChain(),
      refetchAllowances(),
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
    // METHODS
    refetchAllPoolStakingData,
    stake,
    unstake,
    fetchPreferentialGaugeAddress,
    isFetchingStakedBalance,
    stakedBalance,
    injectCurrentPool,
    unstakeBalance,
  }
}
