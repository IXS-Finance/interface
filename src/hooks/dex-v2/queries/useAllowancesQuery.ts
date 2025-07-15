import { useQuery } from '@tanstack/react-query'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import TokenService from 'services/token/token.service'

import useNetwork from '../useNetwork'
import useWeb3 from '../useWeb3'

/**
 * TYPES
 */
interface QueryInputs {
  tokenAddresses: string[]
  contractAddresses: string[]
  isEnabled?: boolean
}

/**
 * Fetches all allowances for given tokens for each provided contract address.
 */
export default function useAllowancesQuery({ tokenAddresses, contractAddresses, isEnabled = true }: QueryInputs) {
  /**
   * COMPOSABLES
   */
  const { account, isWalletReady } = useWeb3()
  const { networkId } = useNetwork()

  /**
   * COMPUTED
   */
  const enabled: boolean = isWalletReady && isEnabled

  /**
   * QUERY INPUTS
   */
  const queryKey = QUERY_KEYS.Account.Allowances(networkId, account, contractAddresses, tokenAddresses)

  const queryFn = async () => {
    const allowances = await new TokenService().allowances.get(account, contractAddresses, tokenAddresses)
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
