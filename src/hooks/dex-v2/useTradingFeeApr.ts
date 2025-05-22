import { Pool } from 'services/pool/types'
import { Abi, Address } from 'viem'
import { useReadContracts } from 'wagmi'

import gaugeAbi from 'abis/gaugeABI.json'
import voterAbi from 'abis/voterABI.json'
import { configService } from 'services/config/config.service'
import { bptPriceFor } from './usePoolHelpers'
import { bnum, scale } from 'lib/utils'
import useGauges from './pools/useGauges'
import usePoolDayDatasQuery from './queries/usePoolDayDatasQuery'
import { useMemo } from 'react'
import { LP_DECIMALS } from 'pages/DexV2/Pool/Staking/constants'

export default function useTradingFeeApr(pool: Pool): string {
  const { gaugeFor } = useGauges()
  const { data: dailySwaps } = usePoolDayDatasQuery({}, { poolAddresses: [pool.address] })

  const gaugeAddress = gaugeFor(pool.address)?.address
  const bptTokenPrice = bptPriceFor(pool)

  const contractCalls = [
    {
      address: gaugeAddress as Address,
      abi: gaugeAbi as Abi,
      functionName: 'totalSupply',
      enabled: !!gaugeAddress,
    },
    {
      address: configService.network.addresses.voter as Address,
      abi: voterAbi as Abi,
      functionName: 'feeForVe',
    },
  ]

  // @ts-ignore
  const { data } = useReadContracts({
    contracts: contractCalls,
  })

  const totalSupply = data?.[0].result as bigint
  const feeForVe = data?.[1].result as bigint
  const feePercentageForLPers = bnum(10_000).minus(bnum(feeForVe)).div(10_000)

  return useMemo(() => {
    if (bnum(totalSupply).isZero() || bnum(bptTokenPrice).isZero() || !dailySwaps || dailySwaps.length === 0) {
      return '0'
    }

    const daysPerYear = 365

    const averageDailySwaps = dailySwaps
      .reduce((acc, day) => {
        return acc.plus(day.dailySwapFeesUSD || '0')
      }, bnum(0))
      .div(dailySwaps.length)

    return bnum(feePercentageForLPers)
      .times(averageDailySwaps)
      .times(daysPerYear)
      .div(scale(bnum(totalSupply), -1 * LP_DECIMALS))
      .div(bptTokenPrice)
      .toString()
  }, [feePercentageForLPers, dailySwaps?.length, totalSupply, bptTokenPrice])
}
