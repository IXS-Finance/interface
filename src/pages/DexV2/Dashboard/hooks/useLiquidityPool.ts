import { useReadContracts } from 'wagmi'
import { useActiveWeb3React } from 'hooks/web3'
import gaugeABI from '../../../../abis/gaugeABI.json'
import erc20ABI from '../../../../abis/erc20.json'
import { Address } from 'viem'
import { Voter } from 'services/balancer/contracts/voter'
import usePools from 'hooks/dex-v2/pools/usePools'
import useGauges from 'hooks/dex-v2/pools/useGauges'
import useJoinExits from 'hooks/dex-v2/pools/useJoinExits'

const useLiquidityPool = () => {
  const { account } = useActiveWeb3React()
  const _account = account?.toLowerCase()
  const { gaugeFor } = useGauges()

  const { data: joinExits, isLoading: joinExitsLoading } = useJoinExits()
  const joinedPoolIds = Array.from(new Set(joinExits?.map((data) => data.pool.id)))
  const joinedPoolAddresses = Array.from(new Set(joinExits?.map((data) => data.pool.address)))

  const poolContracts = joinedPoolAddresses?.flatMap((address) => [
    {
      address: address,
      abi: erc20ABI,
      functionName: 'totalSupply',
    },
    {
      address: address,
      abi: erc20ABI,
      functionName: 'balanceOf',
      args: [_account],
    },
  ])

  const contractEntitiesPerPool = poolContracts?.length / joinedPoolAddresses?.length
  const lpSupplyIndex = (i: number) => i * contractEntitiesPerPool
  const userLpBalanceIndex = (i: number) => i * contractEntitiesPerPool + 1
  // @ts-ignore
  const { data, refetch: refetchPoolsOnChain } = useReadContracts({
    // @ts-ignore
    contracts: poolContracts,
    query: {
      enabled: !!_account && joinedPoolAddresses?.length > 0,
    },
  })
  // Map data to pools
  const mapDataToPools = (data: any[] = [], getIndex: (i: number) => number) =>
    joinedPoolAddresses.reduce((acc, address, index) => {
      acc[address as Address] = data?.[getIndex(index)]?.result || BigInt(0)
      return acc
    }, {} as Record<string, any>)
  const lpSupplyByPool = mapDataToPools(data, (i) => lpSupplyIndex(i))
  const userLpBalanceByPool = mapDataToPools(data, (i) => userLpBalanceIndex(i))

  const { pools, isLoading: isPoolsLoading } = usePools({
    poolIds: joinedPoolIds,
    enabled: !!joinedPoolIds?.length && joinedPoolIds.length > 0,
  })

  const poolsHasGauge = pools
    ?.filter((pool) => gaugeFor(pool.address)?.address)
    ?.map((pool) => ({
      ...pool,
      gauge: gaugeFor(pool.address),
    }))
  const gaugeAddresses = poolsHasGauge?.map((pool) => pool.gauge!.address)
  const gaugeContracts = poolsHasGauge.flatMap((pool) => [
    {
      address: pool.gauge!.address,
      abi: gaugeABI,
      functionName: 'balanceOf',
      args: [_account],
    },
    {
      address: pool.gauge!.address,
      abi: gaugeABI,
      functionName: 'earnedTradingFee',
      args: [_account, pool.tokens.map((token) => token.address)],
    },
    {
      address: pool.gauge!.address,
      abi: gaugeABI,
      functionName: 'earned',
      args: [_account],
    },
  ])
  // @ts-ignore
  const { data: dataFromGauge, refetch: refetchGaugesOnChain } = useReadContracts({
    // @ts-ignore
    contracts: gaugeContracts,
    query: {
      enabled: !!_account && poolsHasGauge?.length > 0,
    },
  })
  const contractEntitiesPerGauge = gaugeContracts?.length / gaugeAddresses.length
  const userGaugeBalanceIndex = (i: number) => i * contractEntitiesPerGauge
  const earnedTradingFeeIndex = (i: number) => i * contractEntitiesPerGauge + 1
  const earnedEmissionsIndex = (i: number) => i * contractEntitiesPerGauge + 2

  const mapDataToGauges = (data: any[] = [], getIndex: (i: number) => number) =>
    gaugeAddresses.reduce((acc, gauge, index) => {
      acc[gauge as Address] = data?.[getIndex(index)]?.result || BigInt(0)
      return acc
    }, {} as Record<string, any>)
  const userGaugeBalanceByGauge = mapDataToGauges(dataFromGauge, (i) => userGaugeBalanceIndex(i))
  const earnedTradingFeesByGauge = mapDataToGauges(dataFromGauge, (i) => earnedTradingFeeIndex(i))
  const earnedEmissionsByGauge = mapDataToGauges(dataFromGauge, (i) => earnedEmissionsIndex(i))

  const claim = async (gaugeAddress: string) => {
    const voter = new Voter()
    const tx = await voter.claimRewards([gaugeAddress])
    return tx
  }

  return {
    pools,
    isPoolsLoading: isPoolsLoading || joinExitsLoading,
    lpSupplyByPool,
    userLpBalanceByPool,
    userGaugeBalanceByGauge,
    earnedTradingFeesByGauge,
    earnedEmissionsByGauge,
    claim,
    refetchPoolsOnChain,
    refetchGaugesOnChain,
  }
}

export default useLiquidityPool
