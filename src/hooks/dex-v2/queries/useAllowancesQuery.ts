import { useQuery } from '@tanstack/react-query'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import TokenService from 'services/token/token.service'
import { TokenInfoMap } from 'types/TokenList'

import useNetwork from '../useNetwork'
import { useMemo } from 'react'
import useWeb3 from '../useWeb3'

/**
 * TYPES
 */
interface QueryInputs {
  tokens: TokenInfoMap
  contractAddresses: string[]
  isEnabled?: boolean
}

/**
 * Fetches all allowances for given tokens for each provided contract address.
 */
export default function useAllowancesQuery({ tokens, contractAddresses, isEnabled = true }: QueryInputs) {
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
  const queryKey = QUERY_KEYS.Account.Allowances(networkId, account, contractAddresses, tokenAddresses)

  const queryFn = async () => {
    console.log('Fetching', tokenAddresses.length, 'allowances')
    const allowances = await new TokenService().allowances.get(account, contractAddresses, tokens)

    return allowances
  }

  const queryOptions = {
    enabled,
    placeholderData: true,
    refetchOnWindowFocus: false,
  }

  // @ts-ignore
  return useQuery({
    queryKey,
    queryFn,
    ...queryOptions,
  })
}
