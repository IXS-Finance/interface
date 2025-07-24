import { useActiveWeb3React } from 'hooks/web3'
import { useReadContracts } from 'wagmi'
import LP_SUGAR_ABI from 'abis/LpSugarABI.json'
import { configService } from 'services/config/config.service'
import { Address } from 'viem'

const useLockReward = () => {
  const { account } = useActiveWeb3React()
  const _account = account?.toLowerCase()

  // @ts-ignore
  const lockData = useReadContracts({
    // @ts-ignore
    contracts: [{
      address: configService.network.addresses.veSugar as Address,
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
