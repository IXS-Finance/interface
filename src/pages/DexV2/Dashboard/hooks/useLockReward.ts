import { LP_SUGAR_ADDRESS } from 'constants/addresses'
import { useActiveWeb3React } from 'hooks/web3'
import { useReadContracts } from 'wagmi'
import LP_SUGAR_ABI from 'abis/LpSugarABI.json'

const useLockReward = () => {
  const { account, chainId } = useActiveWeb3React()
  const _account = account?.toLowerCase()

  // @ts-ignore
  const lockData = useReadContracts({
    // @ts-ignore
    contracts: [{
      address: LP_SUGAR_ADDRESS[chainId],
      abi: LP_SUGAR_ABI,
      functionName: 'byAccount',
      args: [_account],
    }],
    query: {
      enabled: !!_account,
    },
  })

  return {
    lockData,
  }
}

export default useLockReward
