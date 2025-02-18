const isProductionMode = () => process.env.NODE_ENV === 'production';

/**
 * Throws error from react-queries, where thrown errors are normally "silenced" because they just cause a query retry.
 *
 * This helper explicitly console.logs the thrown error, which is useful when testing and debugging
 */
export function throwQueryError(errorMessage: string, error: any) {
  if (!isProductionMode()) console.trace(errorMessage, error);
  throw Error(errorMessage, { cause: error });
}
