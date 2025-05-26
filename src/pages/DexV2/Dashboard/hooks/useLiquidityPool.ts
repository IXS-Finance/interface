import { useReadContracts } from 'wagmi'
import { SUBGRAPH_QUERY } from 'constants/subgraph'
import { useSubgraphQuery } from 'hooks/useSubgraphQuery'
import { useActiveWeb3React } from 'hooks/web3'
import { GET_JOIN_EXITS, JoinExitsType } from '../graphql/dashboard'
import gaugeABI from '../../../../abis/gaugeABI.json'
import erc20ABI from '../../../../abis/erc20.json'
import { Address } from 'viem'
import { Voter } from 'services/balancer/contracts/voter'
import usePools from 'hooks/dex-v2/pools/usePools'
import useGauges from 'hooks/dex-v2/pools/useGauges'

const useLiquidityPool = () => {
  const { account, chainId } = useActiveWeb3React()
  const _account = account?.toLowerCase()
  const { gaugeFor } = useGauges()

  const joinExits = useSubgraphQuery({
    queryKey: ['GetDexV2DashboardJoinExits', SUBGRAPH_QUERY.POOLS, chainId],
    feature: SUBGRAPH_QUERY.POOLS,
    chainId,
    query: GET_JOIN_EXITS,
    variables: {
      account: _account,
    },
  })

  const joinedPoolIds = (joinExits?.data as { data: { joinExits: JoinExitsType[] } })?.data?.joinExits.map(
    (data) => data.pool.id
  )

  const { pools, isLoading: isPoolsLoading } = usePools({
    poolIds: joinedPoolIds,
  })

  const poolContracts = pools?.flatMap((pool) => [
    {
      address: pool.address,
      abi: erc20ABI,
      functionName: 'totalSupply',
    },
    {
      address: pool.address,
      abi: erc20ABI,
      functionName: 'balanceOf',
      args: [_account],
    },
  ])

  // @ts-ignore
  const { data, refetch: refetchPoolsOnChain } = useReadContracts({
    // @ts-ignore
    contracts: poolContracts,
    query: {
      enabled: !!_account && pools?.length > 0,
    },
  })

  const contractEntitiesPerPool = poolContracts?.length / pools?.length
  const lpSupplyIndex = (i: number) => i * contractEntitiesPerPool
  const userLpBalanceIndex = (i: number) => i * contractEntitiesPerPool + 1

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

  // Map data to pools
  const mapDataToPools = (data: any[] = [], getIndex: (i: number) => number) =>
    pools.reduce((acc, pool, index) => {
      acc[pool.address as Address] = data?.[getIndex(index)]?.result || BigInt(0)
      return acc
    }, {} as Record<string, any>)
  const lpSupplyByPool = mapDataToPools(data, (i) => lpSupplyIndex(i))
  const userLpBalanceByPool = mapDataToPools(data, (i) => userLpBalanceIndex(i))

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
    isPoolsLoading,
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
