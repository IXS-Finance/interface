import { useReadContracts } from 'wagmi'
import { SUBGRAPH_QUERY } from 'constants/subgraph'
import { useSubgraphQuery } from 'hooks/useSubgraphQuery'
import { useActiveWeb3React } from 'hooks/web3'
import { GET_LIQUIDITY_POSITIONS, JoinExitsType } from '../graphql/dashboard'
import voterABI from '../../../../abis/voterABI.json'
import gaugeABI from '../../../../abis/gaugeABI.json'
import erc20ABI from '../../../../abis/erc20.json'
import { IXVOTER_ADDRESS } from 'constants/addresses'
import { Address } from 'viem'
import { BigNumber } from 'ethers'

const useLiquidityPool = () => {
  const { account, chainId } = useActiveWeb3React()
  const _account = account?.toLowerCase()

  const positionsData = useSubgraphQuery({
    queryKey: ['GetDexV2Dashboard', SUBGRAPH_QUERY.POOLS, chainId],
    feature: SUBGRAPH_QUERY.POOLS,
    chainId,
    query: GET_LIQUIDITY_POSITIONS,
    variables: {
      account: _account,
    },
  })

  const pools = (positionsData?.data as { data: { joinExits: JoinExitsType[] } })?.data?.joinExits.map(
    (data) => data.pool
  )
  const voterContract = {
    address: IXVOTER_ADDRESS[chainId],
    abi: voterABI,
  } as const
  // @ts-ignore
  const gauges = useReadContracts({
    // @ts-ignore
    contracts: pools?.map((pool) => ({
      ...voterContract,
      functionName: 'gauges',
      args: [pool.address],
    })),
    query: {
      enabled: !!_account && !!pools,
    },
  })

  const gaugesByPool = pools?.reduce((acc, pool, index) => {
    acc[pool.address as Address] = gauges?.data?.[index].result as Address
    return acc
  }, {} as Record<Address, Address>)

  const contracts = pools?.flatMap((pool) => [
    {
      address: gaugesByPool[pool.address as Address],
      abi: gaugeABI,
      functionName: 'balanceOf',
      args: [_account],
    },
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
    contracts,
    query: {
      enabled: !!_account && !!pools && Object.keys(gaugesByPool).length > 0,
    },
  })
  const stakedBalanceIndex = (i: number) => i * contracts.length
  const lpSupplyIndex = (i: number) => i * contracts.length + 1
  const unstakedBalanceIndex = (i: number) => i * contracts.length + 2

  const stakedBalanceByPool = pools?.reduce((acc, pool, index) => {
    acc[pool.address as Address] = data?.[stakedBalanceIndex(index)].result as BigNumber
    return acc
  }, {} as Record<Address, BigNumber>)

  const lpSupplyByPool = pools?.reduce((acc, pool, index) => {
    acc[pool.address as Address] = data?.[lpSupplyIndex(index)].result as BigNumber
    return acc
  }, {} as Record<Address, BigNumber>)

  const unstakedBalanceByPool = pools?.reduce((acc, pool, index) => {
    acc[pool.address as Address] = data?.[unstakedBalanceIndex(index)].result as BigNumber
    return acc
  }, {} as Record<Address, BigNumber>)

  return {
    positionsData,
    lpSupplyByPool,
    stakedBalanceByPool,
    unstakedBalanceByPool,
  }
}

export default useLiquidityPool
