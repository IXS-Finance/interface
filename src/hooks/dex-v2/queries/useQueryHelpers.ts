import { UseQueryResult } from '@tanstack/react-query';

export function isQueryLoading(query: UseQueryResult<any, any>): boolean {
  return query.isFetching || !!query.error;
}