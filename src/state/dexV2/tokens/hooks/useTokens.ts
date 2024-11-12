import { getAddress } from '@ethersproject/address'
import { getAddressFromPoolId, selectByAddressFast } from 'lib/utils'
import { TokenInfo } from 'types/TokenList'
import { useTokensState } from '.'

export const useTokens = () => {
  const { tokens } = useTokensState()

  /**
   * Get single token from state
   */
  function getToken(address: string): TokenInfo {
    address = getAddressFromPoolId(address) // In case pool ID has been passed

    return selectByAddressFast(tokens, getAddress(address)) as TokenInfo
  }
  return { getToken }
}
