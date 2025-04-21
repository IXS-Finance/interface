import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { subgraphRequest } from 'lib/utils/subgraph'
import { configService } from 'services/config/config.service'
import useWeb3 from '../useWeb3'

export type VoteHistory = {
  pool: string
  timestamp: string
  tokenId: string
  totalWeight: string
  tx: string
  voter: {
    id: string
  }
  weight: string
}

/**
 * useVoteHistoriesQuery
 *
 * Fetches vote histories
 *
 * @returns An object from react-query with the vote histories data.
 */
export default function useVoteHistoriesQuery() {
  const { isWalletReady, chainId, account } = useWeb3()

  const queryKey = QUERY_KEYS.Pools.VoteHistories(chainId)

  const enabled = !!configService.network.subgraphs.gauge && isWalletReady

  const subgraphQuery = useMemo(
    () => ({
      __name: 'voteHistories',
      voteHistories: {
        __args: {
          where: {
            voter: account.toLowerCase(),
          },
        },
        pool: true,
        timestamp: true,
        tokenId: true,
        totalWeight: true,
        tx: true,
        voter: {
          id: true,
        },
        weight: true,
      },
    }),
    []
  )

  const queryFn = async () => {
    try {
      const voteHistories = await subgraphRequest<any>({
        url: configService.network.subgraphs.gauge,
        query: subgraphQuery,
      })

      console.log('configService.network.subgraphs.gauge', configService.network.subgraphs.gauge)

      return voteHistories
    } catch (error) {
      console.error('Failed to fetch vote histories', { cause: error })
      throw error
    }
  }

  const queryOptions = {
    enabled,
    refetchOnWindowFocus: false,
  }

  return useQuery({ queryKey, queryFn, ...queryOptions })
}
