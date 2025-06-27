import { useMemo } from 'react';
import useLocksQuery from 'hooks/dex-v2/queries/useLocksQuery';
import { LockedData } from 'services/balancer/contracts/ve-sugar';

const useFlattenedLocks = (account: string) => {
  const { lockRewards, refetch } = useLocksQuery(account);

  const flattenedLocks = useMemo(() => {
    if (!lockRewards) return {};
    return lockRewards.reduce((acc, lock) => {
      acc[lock.id] = lock;
      return acc;
    }, {} as Record<string, LockedData>);
  }, [lockRewards]);

  return { flattenedLocks, refetch };
};

export default useFlattenedLocks;