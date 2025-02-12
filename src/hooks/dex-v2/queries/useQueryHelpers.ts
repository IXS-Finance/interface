
export function isQueryLoading(query: any): boolean {
  return query.isInitialLoading || !!query.error;
}
