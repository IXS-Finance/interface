import { useMemo } from 'react'
import _get from 'lodash/get'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits } from '@ethersproject/units'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { getMulticaller } from 'dependencies/Multicaller'
import useWeb3 from '../useWeb3'
import { PoolsHasGauge } from './usePoolsHasGaugeQuery'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { configService } from 'services/config/config.service'

function parseRewardAndBribeOfPools(data: any, priceFor: any, getToken: any) {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data available')
    }

    const feeTokens = data[0]
    const bribeTokens = data[1]
    const feeRewards = data[2]
    const bribeRewards = data[3]

    const feeTokensFlat = feeTokens.flat()
    const feeRewardsFlat = feeRewards.flat()
    const bribeTokensFlat = bribeTokens.flat()
    const bribeRewardsFlat = bribeRewards.flat()

    const totalFees = feeRewardsFlat.reduce((acc: BigNumber, reward: BigNumber, index: number) => {
      const tokenAddress = feeTokensFlat[index]
      const token = getToken(tokenAddress)
      const tokenPrice = priceFor(tokenAddress)

      const priceDecimals = 18
      const rewardValue = reward
        .mul(BigNumber.from(Math.floor(Number(tokenPrice) * 10 ** priceDecimals).toString()))
        .div(BigNumber.from(10).pow(token.decimals))

      return acc.add(rewardValue)
    }, BigNumber.from(0))

    const totalIncentivess = bribeRewardsFlat.reduce((acc: BigNumber, reward: BigNumber, index: number) => {
      const tokenAddress = bribeTokensFlat[index]
      const token = getToken(tokenAddress)
      const tokenPrice = priceFor(tokenAddress)

      const priceDecimals = 18
      const rewardValue = reward
        .mul(BigNumber.from(Math.floor(Number(tokenPrice) * 10 ** priceDecimals).toString()))
        .div(BigNumber.from(10).pow(token.decimals))

      return acc.add(rewardValue)
    }, BigNumber.from(0))

    const totalRewards = totalFees.add(totalIncentivess)

    return {
      totalFees: formatUnits(totalFees, 18),
      totalIncentivess: formatUnits(totalIncentivess, 18),
      totalRewards: formatUnits(totalRewards, 18),
    }
  } catch (error) {
    console.error('Error parsing data:', error)
    return {
      totalFees: '0',
      totalIncentivess: '0',
      totalRewards: '0',
    }
  }
}

export default function useRewardOfPools(poolsData: any) {
  const { account, isWalletReady } = useWeb3()
  const { priceFor, getToken } = useTokens()
  const pools = poolsData?.pools || []
  const poolsAddresses = pools.map((pool: PoolsHasGauge) => pool.address)
  const createAts = pools.map((pool: PoolsHasGauge) => pool.createTime)
  const queryKey = useMemo(() => {
    return QUERY_KEYS.User.Vote.VoteReward(account)
  }, [account])

  const isEnabled = isWalletReady && poolsAddresses.length > 0 && createAts.length > 0

  const queryFn = async () => {
    let result = {} as Record<string, Record<string, BigNumber>>
    const Multicaller = getMulticaller()
    const multicaller = new Multicaller()

    multicaller.call({
      key: 'allRewardOfPools',
      address: configService.network.addresses.rewardSugar,
      function: 'getAllRewardOfPools',
      abi: [
        'function getAllRewardOfPools(address[], uint256[]) returns (address[][], address[][], uint256[][], uint256[][])',
      ],
      params: [poolsAddresses, createAts],
    })

    result = await multicaller.execute()

    const { allRewardOfPools } = result as any

    const parseData = parseRewardAndBribeOfPools(allRewardOfPools, priceFor, getToken)

    return parseData
  }

  const queryOptionsFinal: any = {
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  }

  return useQuery({ queryKey, queryFn, ...queryOptionsFinal })
}
