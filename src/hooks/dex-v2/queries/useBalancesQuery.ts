import { useQuery } from '@tanstack/react-query'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import { BalanceMap } from 'services/token/concerns/balances.concern'
import TokenService from 'services/token/token.service'

import useNetwork from '../useNetwork'
import useWeb3 from '../useWeb3'
import { useMemo } from 'react'

/**
 * TYPES
 */
type QueryResponse = BalanceMap

/**
 * Fetches all balances for provided tokens.
 */
export default function useBalancesQuery({ tokens, isEnabled = true }: any) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3()
  const { networkId } = useNetwork()

  /**
   * COMPUTED
   */
  const enabled = useMemo(() => isWalletReady && isEnabled, [isWalletReady, isEnabled])
  const tokenAddresses = useMemo(() => Object.keys(tokens), [JSON.stringify(tokens)])

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Account.Balances(networkId, account, tokenAddresses)

  const queryFn = async () => {
    return await new TokenService().balances.get(account, tokens)
  }

  const queryOptions = {
    enabled,
    placeholderData: true,
    refetchOnWindowFocus: false,
  }

  // @ts-ignore
  return useQuery<QueryResponse>({
    queryKey,
    queryFn,
    ...queryOptions,
  })
}
