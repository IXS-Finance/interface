import { useQuery } from '@tanstack/react-query'
import { LockService } from 'services/lock/lock.service'
import { VeSugar } from 'services/balancer/contracts/ve-sugar'

export default function useLockQuery(id: string) {
  const veSugar = new VeSugar()
  const { data: lockDetail, isLoading: isLoadingLockDetail } = useQuery({
    queryKey: ['lock', id],
    queryFn: () => new LockService(veSugar).getLockDetail(id),
    enabled: !!id,
  })

  return {
    lockDetail,
    isLoadingLockDetail,
  }
}
