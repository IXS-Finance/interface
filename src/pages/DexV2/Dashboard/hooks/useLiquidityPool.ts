import { useReadContracts } from 'wagmi'
import { SUBGRAPH_QUERY } from 'constants/subgraph'
import { useSubgraphQuery } from 'hooks/useSubgraphQuery'
import { useActiveWeb3React } from 'hooks/web3'
import { GET_JOIN_EXITS, GET_POOL_GAUGES, JoinExitsType, PoolType } from '../graphql/dashboard'
import gaugeABI from '../../../../abis/gaugeABI.json'
import erc20ABI from '../../../../abis/erc20.json'
import { Address } from 'viem'
import { Voter } from 'services/balancer/contracts/voter'
import usePools from 'hooks/dex-v2/pools/usePools'

const useLiquidityPool = () => {
  const { account, chainId } = useActiveWeb3React()
  const _account = account?.toLowerCase()

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

  const poolGaugesData = useSubgraphQuery({
    queryKey: ['PoolGauges', SUBGRAPH_QUERY.POOLS, joinedPoolIds],
    feature: SUBGRAPH_QUERY.POOLS,
    chainId,
    query: GET_POOL_GAUGES,
    variables: {
      ids: joinedPoolIds,
    },
  })
  const poolGauges = (poolGaugesData?.data as { data: { pools: PoolType[] } })?.data?.pools?.map((pool) => pool) ?? []

  const gaugesByPool = poolGauges?.reduce((acc, pool) => {
    acc[pool.address as Address] = pool.gauge?.address
    return acc
  }, {} as Record<string, Address>)

  const { pools } = usePools({
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
  const { data } = useReadContracts({
    // @ts-ignore
    contracts: poolContracts,
    query: {
      enabled: !!_account && pools?.length > 0 && Object.keys(gaugesByPool).length > 0,
    },
  })

  const contractEntitiesPerPool = poolContracts?.length / pools?.length
  const lpSupplyIndex = (i: number) => i * contractEntitiesPerPool
  const userLpBalanceIndex = (i: number) => i * contractEntitiesPerPool + 1

  const gaugeAddresses = poolGauges.filter((pool) => pool.gauge?.address).map((pool) => pool.gauge.address)
  const gaugeContracts = poolGauges
    .filter((pool) => pool.gauge?.address)
    .flatMap((pool) => [
      {
        address: pool.gauge.address,
        abi: gaugeABI,
        functionName: 'balanceOf',
        args: [_account],
      },
      {
        address: pool.gauge.address,
        abi: gaugeABI,
        functionName: 'earnedTradingFee',
        args: [_account, pool.tokens.map((token) => token.address)],
      },
      {
        address: pool.gauge.address,
        abi: gaugeABI,
        functionName: 'earned',
        args: [_account],
      },
    ])
  // @ts-ignore
  const { data: dataFromGauge } = useReadContracts({
    // @ts-ignore
    contracts: gaugeContracts,
    query: {
      enabled: !!_account && poolGauges?.length > 0,
    },
  })
  const contractEntitiesPerGauge = gaugeContracts?.length / gaugeAddresses.length
  const userGaugeBalanceIndex = (i: number) => i * contractEntitiesPerGauge
  const earnedTradingFeeIndex = (i: number) => i * contractEntitiesPerGauge + 1
  const earnedEmissionsIndex = (i: number) => i * contractEntitiesPerGauge + 2

  // Map data to pools
  const mapDataToPools = (data: any[] = [], getIndex: (i: number) => number) =>
    poolGauges.reduce((acc, pool, index) => {
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
    lpSupplyByPool,
    userLpBalanceByPool,
    userGaugeBalanceByGauge,
    gaugesByPool,
    earnedTradingFeesByGauge,
    earnedEmissionsByGauge,
    claim,
  }
}

export default useLiquidityPool
