import { useActiveWeb3React } from 'hooks/web3'
import useJoinExitsQuery from '../queries/useJoinExitsQuery'

export default function useJoinExits() {
  const { account } = useActiveWeb3React()

  const { data, isLoading } = useJoinExitsQuery(
    {
      enabled: !!account,
    },
    { account: account!.toLowerCase() }
  )

  return {
    data,
    isLoading,
  }
}
