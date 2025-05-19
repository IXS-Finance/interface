import { useReadContracts } from 'wagmi'

import { configService } from 'services/config/config.service'
import voterAbi from 'abis/voterABI.json'
import rewardsDistributorAbi from 'abis/rewardsDistributorABI.json'
import gaugeAbi from 'abis/gaugeABI.json'
import { Address, Abi } from 'viem'
import { useMemo } from 'react'
import { bnum } from 'lib/utils'
import { Pool } from 'services/pool/types'
import { IXS_ADDRESS } from 'constants/addresses'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { useWeb3React } from 'hooks/useWeb3React'
import { fiatValueOf } from 'hooks/dex-v2/usePoolHelpers'
import { timePeriods } from 'utils/time'

export default function useEmissionApr(pool: Pool, gaugeAddress?: string): string {
  const poolAddress = pool.address
  const { priceFor } = useTokens()
  const bptTokenPrice = fiatValueOf(pool, pool.totalLiquidity)

  const { chainId } = useWeb3React()
  const ixsTokenPrice = priceFor(IXS_ADDRESS[chainId])

  const contractCalls = [
    {
      address: configService.network.addresses.voter as Address,
      abi: voterAbi as Abi,
      functionName: 'weights',
      args: [poolAddress],
    },
    {
      address: configService.network.addresses.voter as Address,
      abi: voterAbi as Abi,
      functionName: 'totalWeight',
    },
    {
      address: configService.network.addresses.rewardsDistributor as Address,
      abi: rewardsDistributorAbi as Abi,
      functionName: 'availableDeposit',
    },
    {
      address: configService.network.addresses.rewardsDistributor as Address,
      abi: rewardsDistributorAbi as Abi,
      functionName: 'lastAvailableDeposit',
    },
    {
      address: configService.network.addresses.rewardsDistributor as Address,
      abi: rewardsDistributorAbi as Abi,
      functionName: 'EPOCH_DURATION',
    },
    {
      address: gaugeAddress as Address,
      abi: gaugeAbi as Abi,
      functionName: 'totalSupply',
    },
  ]

  // @ts-ignore
  const { data } = useReadContracts({
    contracts: contractCalls,
  })

  const poolWeight = data?.[0].result as bigint
  const totalWeight = data?.[1].result as bigint
  const availableDeposit = data?.[2].result as bigint
  const lastAvailableDeposit = data?.[3].result as bigint
  const epochDuration = data?.[4].result as bigint
  const totalSupply = data?.[5].result as bigint

  return useMemo(() => {
    if (!gaugeAddress || !ixsTokenPrice || !poolWeight || !totalWeight || !totalSupply || !bptTokenPrice) {
      return '0'
    }

    let rewardRate = lastAvailableDeposit / epochDuration
    if (availableDeposit > 0) {
      rewardRate = availableDeposit / epochDuration
    }

    return bnum(rewardRate)
      .times(timePeriods['1 year'])
      .times(bnum(ixsTokenPrice))
      .times(bnum(poolWeight))
      .div(bnum(totalSupply))
      .div(bnum(bptTokenPrice))
      .div(bnum(totalWeight))
      .toString()
  }, [
    gaugeAddress,
    ixsTokenPrice,
    poolWeight,
    totalWeight,
    totalSupply,
    bptTokenPrice,
    availableDeposit,
    lastAvailableDeposit,
    epochDuration,
  ])
}
