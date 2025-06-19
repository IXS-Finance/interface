import { useQuery } from '@tanstack/react-query'
import { LockService } from 'services/lock/lock.service'
import { LockedData, VeSugar } from 'services/balancer/contracts/ve-sugar'

export default function useLocksQuery(address: string) {
  const veSugar = new VeSugar()

  const { data: lockRewards, isLoading: isLoadingLockRewards, refetch } = useQuery<LockedData[]>({
    queryKey: ['lock-rewards', address],
    queryFn: () => new LockService(veSugar).getLockRewards(address),
    enabled: !!address,
  })

  return {
    lockRewards,
    isLoadingLockRewards,
    refetch,
  }
}
