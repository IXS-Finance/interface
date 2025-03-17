
export function isQueryLoading(query: any): boolean {
  return query.isFetching || !!query.error;
}
