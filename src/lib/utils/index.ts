import BigNumber from 'bignumber.js'
import { getAddress } from '@ethersproject/address'
import { BigNumber as EPBigNumber, BigNumberish } from '@ethersproject/bignumber'
import { Zero, WeiPerEther as ONE } from '@ethersproject/constants'
import {
  UserRejectedRequestError,
  UnknownRpcError,
  Hex,
  TransactionNotFoundError,
  TransactionReceipt,
  TransactionReceiptNotFoundError,
} from 'viem'
import { waitForTransactionReceipt } from '@wagmi/core'

import { retry, RetryableError } from 'lib/utils/retry'
import { wagmiConfig } from 'components/Web3Provider'

export function bnum(val: string | number | BigNumber): BigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0'
  return new BigNumber(number)
}

export const bnumZero = bnum(0)

export function scale(input: BigNumber | string, decimalPlaces: number): BigNumber {
  const unscaled = typeof input === 'string' ? new BigNumber(input) : input
  const scalePow = new BigNumber(decimalPlaces.toString())
  const scaleMul = new BigNumber(10).pow(scalePow)
  return unscaled.times(scaleMul)
}

export function shortenLabel(str: string, segLength = 4) {
  const firstSegment = str.substring(0, segLength + 2)
  const lastSegment = str.substring(str.length, str.length - segLength)
  return `${firstSegment}...${lastSegment}`
}

/**
 * Select an Address using a hashmap
 * You must ensure the hashmap keys and address are in the same case
 * (lowercase or checksum case) before passing them to this function
 * @param map A hashmap of address -> type
 * @param address An address to find in the map
 * @returns Item from map or undefined
 */
export function selectByAddressFast<T>(map: Record<string, T>, address: string): T | undefined {
  return map[address]
}

export function getAddressFromPoolId(poolId: string) {
  return poolId.substring(0, 42)
}

export function isSameAddress(address1: string, address2: string): boolean {
  if (!address1 || !address2) return false
  return getAddress(address1) === getAddress(address2)
}

export function includesAddress(addresses: string[], address: string): boolean {
  if (!address) return false;
  addresses = addresses.map(a => (a ? getAddress(a) : ''));
  return addresses.includes(getAddress(address));
}

// Should match MAX_WEIGHTED_TOKENS from v2-helpers/constants
// Including would introduce a dependency
const MaxWeightedTokens = 100

/**
 * Normalize an array of token weights to ensure they sum to `1e18`
 * @param weights - an array of token weights to be normalized
 * @returns an equivalent set of normalized weights
 */
export function toNormalizedWeights(weights: EPBigNumber[]): EPBigNumber[] {
  // When the number is exactly equal to the max, normalizing with common inputs
  // leads to a value < 0.01, which reverts. In this case fill in the weights exactly.
  if (weights.length == MaxWeightedTokens) {
    return Array(MaxWeightedTokens).fill(ONE.div(MaxWeightedTokens))
  }

  const sum = weights.reduce((total, weight) => total.add(weight), Zero)
  if (sum.eq(ONE)) return weights

  const normalizedWeights = []
  let normalizedSum = Zero
  for (let index = 0; index < weights.length; index++) {
    if (index < weights.length - 1) {
      normalizedWeights[index] = weights[index].mul(ONE).div(sum)
      normalizedSum = normalizedSum.add(normalizedWeights[index])
    } else {
      normalizedWeights[index] = ONE.sub(normalizedSum)
    }
  }

  return normalizedWeights
}

/**
 * Check whether a set of weights are normalized
 * @param weights - an array of potentially unnormalized weights
 * @returns a boolean of whether the weights are normalized
 */
export const isNormalizedWeights = (weights: BigNumberish[]): boolean => {
  const totalWeight = weights.reduce((total: EPBigNumber, weight) => total.add(weight), Zero)
  return totalWeight.eq(ONE)
}

// @ts-ignore
function isUserRejected(err: any) {
  if (err instanceof UserRejectedRequestError) {
    return true
  }
  if (err instanceof UnknownRpcError) {
    // fallback for some wallets that don't follow EIP 1193, trust, safe
    if (err.details?.includes('cancel') || err.details?.includes('Transaction was rejected')) {
      return true
    }
  }

  // fallback for raw rpc error code
  if (err && typeof err === 'object') {
    if (
      ('code' in err && (err.code === 4001 || err.code === 'ACTION_REJECTED')) ||
      ('cause' in err && err.cause && 'code' in err.cause && err.cause.code === 4001)
    ) {
      return true
    }

    if ('cause' in err) {
      return isUserRejected(err.cause)
    }
  }
  return false
}

export class TransactionRejectedError extends Error {}

export const userRejectedError = (error: unknown): boolean => {
  return (
    error instanceof UserRejectedRequestError ||
    error instanceof TransactionRejectedError ||
    (typeof error !== 'string' && isUserRejected(error))
  )
}

export const retryWaitForTransaction = async ({ hash, confirmations }: { hash?: Hex; confirmations?: number }) => {
  if (hash) {
    let retryTimes = 0
    const getReceipt = async () => {
      console.info('retryWaitForTransaction', hash, retryTimes++)
      try {
        return await waitForTransactionReceipt(wagmiConfig, {
          hash,
          confirmations,
        })
      } catch (error) {
        if (error instanceof TransactionReceiptNotFoundError || error instanceof TransactionNotFoundError) {
          throw new RetryableError()
        }
        throw error
      }
    }
    const { promise } = retry<TransactionReceipt>(getReceipt, {
      n: 6,
      minWait: 2000,
      maxWait: confirmations ? confirmations * 5000 : 5000,
    })
    return promise
  }
  return undefined
}

export const lsGet = (key: string, defaultValue: string) => {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : defaultValue
}

export const lsSet = (key: string, value: string) => {
  localStorage.setItem(key, JSON.stringify(value))
}

export function removeAddress(address: string, addresses: string[]): string[] {
  return addresses.filter(a => !isSameAddress(a, address));
}