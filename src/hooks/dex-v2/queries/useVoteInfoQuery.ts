import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BigNumber } from '@ethersproject/bignumber'
import { mapValues } from 'lodash'
import { formatUnits } from '@ethersproject/units'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { getMulticaller } from 'dependencies/Multicaller'
import useWeb3 from '../useWeb3'
import { configService } from 'services/config/config.service'

export default function useVoteInfoQuery() {
  const { account, isWalletReady } = useWeb3()

  const queryKey = useMemo(() => {
    return QUERY_KEYS.User.Vote.VoteInfo(account)
  }, [account])

  const enabled = isWalletReady

  const queryFn = async () => {
    let result = {} as Record<string, Record<string, BigNumber>>
    const Multicaller = getMulticaller()
    const multicaller = new Multicaller()

    // timestamp = now() in unix seconds
    const timestamp = Math.floor(Date.now() / 1000).toString()

    multicaller.call({
      key: 'epochVoteEnd',
      address: configService.network.addresses.voter,
      function: 'epochVoteEnd',
      abi: ['function epochVoteEnd(uint256) returns (uint256)'],
      params: [timestamp],
    })
    multicaller.call({
      key: 'totalSupply',
      address: configService.network.addresses.votingEscrow,
      function: 'totalSupply',
      abi: ['function totalSupply() returns (uint256)'],
    })
    multicaller.call({
      key: 'availableDeposit',
      address: configService.network.addresses.rewardsDistributor,
      function: 'availableDeposit',
      abi: ['function availableDeposit() returns (uint256)'],
    })

    result = await multicaller.execute()

    const { epochVoteEnd, totalSupply, availableDeposit } = result as any

    return {
      epochVoteEnd: epochVoteEnd.toString(),
      totalSupply: formatUnits(totalSupply.toString(), 18),
      availableDeposit: formatUnits(availableDeposit.toString(), 18),
    }
  }

  const queryOptionsFinal: any = {
    enabled,
    refetchOnWindowFocus: false,
  }

  return useQuery({ queryKey, queryFn, ...queryOptionsFinal })
}
