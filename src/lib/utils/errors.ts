import debounce from 'lodash/debounce';
import { TransactionError } from 'pages/DexV2/types/transactions'

// interface Params {
//   error: Error | unknown;
//   action?: TransactionAction | 'unknown';
//   msgPrefix?: string;
//   context?: Partial<ScopeContext>;
//   query?: UseQueryReturnType<any, any>;
// }

export const captureBalancerException = debounce(
  _captureBalancerException,
  1000
);

function _captureBalancerException({
  error,
  action = 'unknown',
  msgPrefix = '',
  context = {},
  query,
}: any): void {
  // if (!shouldCaptureError(error, query)) return;
  // console.error(error);

  // const balError = getBalError(error);
  // const message = formatErrorMsgForSentry(error, balError, msgPrefix);
  // const metadata = (error as WalletError).metadata || {};
  // const tags = getTags(action, context, balError, metadata);
  // const originalError = getOriginalError(error);

  // const _error = constructError(message, action, error);
  // captureException(_error, {
  //   ...context,
  //   extra: {
  //     ...context?.extra,
  //     ...metadata,
  //     balError,
  //     originalError,
  //   },
  //   tags,
  // });
}

/**
 * Checks if error is caused by user rejecting/canceling the transaction.
 */
function isUserRejected(error: any): boolean {
  const messages = [
    /rejected/,
    /user rejected transaction/,
    /request rejected/,
    /user rejected methods./,
    /user rejected the transaction/,
    /user rejected the request/,
    /rejected by user/,
    /user canceled/,
    /cancelled by user/,
    /transaction declined/,
    /transaction was rejected/,
    /user denied transaction signature/,
    /user disapproved requested methods/,
    /canceled/,
    /cancelled/,
    /user rejected signing/,
    /user cancelled/,
  ]

  if (error.cause?.code && error.cause?.code === 4001) {
    return true
  }

  return isErrorOfType(error, messages)
}

/**
 * Checks if error is caused by user not having enough gas or setting gas too low.
 */
function isUserNotEnoughGas(error: any): boolean {
  const messages = [
    /insufficient funds for gas/,
    /the signed fee is insufficient/,
    /EffectivePriorityFeePerGas too low/,
    /Комиссия за газ обновлена/i,
    /insufficient eth to pay the network fees/,
    /insufficient funds for intrinsic transaction cost/,
  ]

  return isErrorOfType(error, messages)
}

/**
 * Checks if error is caused by the user or the state of their wallet.
 */
export function isUserError(error: any): boolean {
  return isUserRejected(error) || isUserNotEnoughGas(error) || isWalletConfigError(error)
}

/**
 * Checks if error is caused by user's wallet having bad config / state
 */
function isWalletConfigError(error: any): boolean {
  const messages = [
    /invalid rpc url/,
    /nonce has already been used/,
    /no matching key/, //Wallet connect v2 random error when disconnecting: https://github.com/WalletConnect/walletconnect-monorepo/issues/2326#issuecomment-1633706820
    /unknown account #0/,
  ]

  return isErrorOfType(error, messages)
}

/**
 * Checks if error has any metadata that matches given set of RegExps.
 *
 * @param {Error} error Error to check
 * @param {RegExp[]} messages Array of RegExps to match against error metadata
 */
function isErrorOfType(error: any, messages: RegExp[]): boolean {
  if (!error) return false

  if (typeof error === 'string' && messages.some((msg) => msg.test(error.toLowerCase()))) return true

  if (error.message && messages.some((msg) => msg.test(error.message.toLowerCase()))) return true

  if (
    typeof error.reason === 'string' &&
    messages.some((msg) => msg.test(error.reason) || msg.test(error.reason.toLowerCase()))
  )
    return true

  if (error.cause?.message && messages.some((msg) => msg.test(error.cause.message.toLowerCase()))) return true

  if (typeof error.cause === 'string' && messages.some((msg) => msg.test(error.cause.toLowerCase()))) return true

  if (error.b && messages.some((msg) => msg.test(error.b.toLowerCase()))) return true

  if (error?.code && error.code === 4001) {
    return true
  }

  return false
}

/**
 * Composable for formatting error messages.
 */
export function useErrorMsg() {
  const gasTooLowError: TransactionError = {
    title: 'Gas too low',
    description: 'transactionErrors.gasTooLow.description',
  }

  const cannotEstimateGasError: TransactionError = {
    title: 'transactionErrors.cannotEstGas.title',
    description: 'transactionErrors.cannotEstGas.description',
  }

  const slippageError: TransactionError = {
    title: 'transactionErrors.slippage.title',
    description: 'transactionErrors.slippage.description',
  }

  const unknownAccountError: TransactionError = {
    title: 'Possible wallet connection error',
    description: 'Please review your setup and try again.',
  }

  function defaultError(message = ''): TransactionError {
    return {
      title: 'transactionErrors.default.title',
      description: message.trim(),
    }
  }

  function formatErrorMsg(error: any): TransactionError | null {
    if (isErrorOfType(error, [/unknown account #0/])) return unknownAccountError
    if (isUserError(error)) return null
    if (isErrorOfType(error, [/UNPREDICTABLE_GAS_LIMIT/])) return cannotEstimateGasError
    if (isErrorOfType(error, [/-32010/])) return gasTooLowError
    if (isErrorOfType(error, [/BAL#507/])) return slippageError
    if (isErrorOfType(error, [/BAL#505/])) return slippageError

    return defaultError()
  }

  return {
    formatErrorMsg,
  }
}
