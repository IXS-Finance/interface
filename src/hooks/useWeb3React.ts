import { useAccount } from 'hooks/useAccount'
import { useEthersProvider } from 'hooks/useEthersProvider'
import { useMemo } from 'react'
import { ChainId } from 'types/chains'

export function useWeb3React() {
  const account = useAccount()
  const chainId = account?.chain?.id ?? ChainId.Base
  const provider = useEthersProvider({ chainId })

  return useMemo(
    () => ({
      account: account.address,
      chainId,
      provider,
    }),
    [account.address, account.chainId, provider]
  )
}
