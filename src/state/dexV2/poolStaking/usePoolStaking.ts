import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { formatUnits } from '@ethersproject/units'
import { parseUnits } from 'ethers/lib/utils'

import usePoolGaugeQuery, { PoolGauge } from 'hooks/dex-v2/queries/usePoolGaugeQuery'
import { isQueryLoading } from 'hooks/dex-v2//queries/useQueryHelpers'
import { bnum, getAddressFromPoolId, isSameAddress } from 'lib/utils'
import { LiquidityGauge } from 'services/balancer/contracts/liquidity-gauge'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { POOLS } from 'constants/dexV2/pools'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from '../tokens/hooks/useTokens'

import { AppState } from 'state'
import { setPoolGaugeQuery, setPoolStakingState } from '.'
import { Pool } from 'services/pool/types'
import { overflowProtected } from 'pages/DexV2/Pool/components/helpers'

export const usePoolStaking = () => {
  const [isFetchingStakedBalance, setIsFetchingStakedBalance] = useState(false)
  const [stakedBalance, setStakedBalance] = useState('0')

  const { poolGaugeQuery, currentPool } = useSelector((state: AppState) => state.dexV2Staking)
  const dispatch = useDispatch()
  const { balanceFor } = useTokens()
  const { account } = useWeb3()

  const poolGauge = poolGaugeQuery?.data as PoolGauge
  // The current preferential gauge for the specified pool.
  const preferentialGaugeAddress = poolGauge?.pool?.gauge?.address
  const poolId = poolGauge?.pool?.id
  const poolAddress = poolGauge?.pool?.address

  const refetchPoolGauges = poolGaugeQuery?.refetch
  const isLoading = poolGaugeQuery ? isQueryLoading(poolGaugeQuery) : false
  // ||
  // (isWalletReady &&
  //   (isQueryLoading(stakedSharesQuery) ||
  //     isQueryLoading(userGaugeSharesQuery) ||
  //     isQueryLoading(userBoostsQuery)))

  const isStakablePool = preferentialGaugeAddress
  const unstakeBalance = poolAddress ? balanceFor(poolAddress) : '0'

  const refetchAllPoolStakingData = async () => {
    return Promise.all([
      refetchPoolGauges(),
      // refetchStakedShares(),
      // refetchUserGaugeShares(),
      // refetchUserBoosts(),
    ])
  }

  const stake = async (amount: string) => {
    if (!preferentialGaugeAddress) throw new Error(`No preferential gauge found for this pool: ${poolId}`)
    const gauge = new LiquidityGauge(preferentialGaugeAddress)
    const balance = parseUnits(overflowProtected(amount, 18), 18)

    return await gauge.stake(balance)
  }

  const unstake = async (amount: string) => {
    if (!preferentialGaugeAddress) throw new Error('Unable to unstake, no pool gauges')
    const gauge = new LiquidityGauge(preferentialGaugeAddress)

    const balance = parseUnits(overflowProtected(amount, 18), 18)

    return await gauge.unstake(balance)
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
    async function getBalance() {
      setIsFetchingStakedBalance(true)
      const gauge = new LiquidityGauge(preferentialGaugeAddress)
      const balanceBpt = await gauge.balance(account)
      const stackedBalance = formatUnits(balanceBpt.toString(), currentPool?.onchain?.decimals || 18)
      setStakedBalance(stackedBalance)
      setIsFetchingStakedBalance(false)
    }
    if (preferentialGaugeAddress) {
      getBalance()
    }
  }, [preferentialGaugeAddress])

  return {
    // STATE/COMPUTED
    isLoading,
    isStakablePool,
    preferentialGaugeAddress,
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
