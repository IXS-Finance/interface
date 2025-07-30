import { Interface, FunctionFragment } from '@ethersproject/abi'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useReadContracts } from 'wagmi'
import { useActiveWeb3React } from '../../hooks/web3'
import { useBlockNumber } from '../application/hooks'
import { AppDispatch, AppState } from '../index'
import {
  addMulticallListeners,
  Call,
  removeMulticallListeners,
  parseCallKey,
  toCallKey,
  ListenerOptions,
} from './actions'

export interface Result extends ReadonlyArray<any> {
  readonly [key: string]: any
}

type MethodArg = string | number | BigNumber
type MethodArgs = Array<MethodArg | MethodArg[]>

export type OptionalMethodInputs = Array<MethodArg | MethodArg[] | undefined | null> | undefined

function isMethodArg(x: unknown): x is MethodArg {
  return BigNumber.isBigNumber(x) || ['string', 'number'].indexOf(typeof x) !== -1
}

function isValidMethodArgs(x: unknown): x is MethodArgs | undefined {
  return (
    x === undefined ||
    (Array.isArray(x) && x.every((xi) => isMethodArg(xi) || (Array.isArray(xi) && xi.every(isMethodArg))))
  )
}

interface CallResult {
  readonly valid: boolean
  readonly data: string | undefined
  readonly blockNumber: number | undefined
}

const INVALID_RESULT: CallResult = { valid: false, blockNumber: undefined, data: undefined }

// use this options object
export const NEVER_RELOAD: ListenerOptions = {
  blocksPerFetch: Infinity,
}

// the lowest level call for subscribing to contract data
function useCallsData(calls: (Call | undefined)[], options?: ListenerOptions): CallResult[] {
  const { chainId } = useActiveWeb3React()
  const callResults = useSelector<AppState, AppState['multicall']['callResults']>(
    (state) => state.multicall.callResults
  )
  const dispatch = useDispatch<AppDispatch>()

  const serializedCallKeys: string = useMemo(
    () =>
      JSON.stringify(
        calls
          ?.filter((c): c is Call => Boolean(c))
          ?.map(toCallKey)
          ?.sort() ?? []
      ),
    [calls]
  )

  // update listeners when there is an actual change that persists for at least 100ms
  useEffect(() => {
    const callKeys: string[] = JSON.parse(serializedCallKeys)
    if (!chainId || callKeys.length === 0) return undefined
    const calls = callKeys.map((key) => parseCallKey(key))
    dispatch(
      addMulticallListeners({
        chainId,
        calls,
        options,
      })
    )

    return () => {
      dispatch(
        removeMulticallListeners({
          chainId,
          calls,
          options,
        })
      )
    }
  }, [chainId, dispatch, options, serializedCallKeys])

  return useMemo(
    () =>
      calls.map<CallResult>((call) => {
        if (!chainId || !call) return INVALID_RESULT

        const result = callResults[chainId]?.[toCallKey(call)]
        let data
        if (result?.data && result?.data !== '0x') {
          data = result.data
        }

        return { valid: true, data, blockNumber: result?.blockNumber }
      }),
    [callResults, calls, chainId]
  )
}

export interface CallState {
  readonly valid: boolean
  // the result, or undefined if loading or errored/no data
  readonly result: Result | undefined
  // true if the result has never been fetched
  readonly loading: boolean
  // true if the result is not for the latest block
  readonly syncing: boolean
  // true if the call was made and is synced, but the return data is invalid
  readonly error: boolean
}

const INVALID_CALL_STATE: CallState = { valid: false, result: undefined, loading: false, syncing: false, error: false }
const LOADING_CALL_STATE: CallState = { valid: true, result: undefined, loading: true, syncing: true, error: false }

function toCallState(
  callResult: CallResult | undefined,
  contractInterface: Interface | undefined,
  fragment: FunctionFragment | undefined,
  latestBlockNumber: number | undefined
): CallState {
  if (!callResult) return INVALID_CALL_STATE
  const { valid, data, blockNumber } = callResult
  if (!valid) return INVALID_CALL_STATE
  if (valid && !blockNumber) return LOADING_CALL_STATE
  if (!contractInterface || !fragment || !latestBlockNumber) return LOADING_CALL_STATE
  const success = data && data.length > 2
  const syncing = (blockNumber ?? 0) < latestBlockNumber
  let result: Result | undefined = undefined
  if (success && data) {
    try {
      result = contractInterface.decodeFunctionResult(fragment, data)
    } catch (error) {
      return {
        valid: true,
        loading: false,
        error: true,
        syncing,
        result,
      }
    }
  }
  return {
    valid: true,
    loading: false,
    syncing,
    result: result,
    error: !success,
  }
}

export function useSingleContractMultipleData(
  contract: Contract | null | undefined,
  methodName: string,
  callInputs: OptionalMethodInputs[],
  options?: ListenerOptions,
  gasRequired?: number
): CallState[] {
  const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [contract, methodName])

  const calls = useMemo(
    () =>
      contract && fragment && callInputs?.length > 0 && callInputs.every((inputs) => isValidMethodArgs(inputs))
        ? callInputs.map<Call>((inputs) => {
            return {
              address: contract.address,
              callData: contract.interface.encodeFunctionData(fragment, inputs),
              ...(gasRequired ? { gasRequired } : {}),
            }
          })
        : [],
    [contract, fragment, callInputs, gasRequired]
  )

  const results = useCallsData(calls, options)

  const latestBlockNumber = useBlockNumber()

  return useMemo(() => {
    return results.map((result) => toCallState(result, contract?.interface, fragment, latestBlockNumber))
  }, [fragment, contract, results, latestBlockNumber])
}

export function useMultipleContractSingleData(
  addresses: (string | undefined)[],
  contractInterface: Interface,
  methodName: string,
  callInputs?: OptionalMethodInputs,
  options?: ListenerOptions
): CallState[] {
  const fragment = useMemo(() => contractInterface.getFunction(methodName), [contractInterface, methodName])

  // Prepare contracts for Wagmi useReadContracts
  const contracts = useMemo(() => {
    if (!fragment || !addresses || addresses.length === 0) {
      return []
    }

    if (!isValidMethodArgs(callInputs)) {
      return []
    }

    const validAddresses = addresses.filter((address): address is string => Boolean(address))

    try {
      // Convert ethers Interface to Viem-compatible ABI
      const abiJson = contractInterface.format('json')
      const abi = typeof abiJson === 'string' ? JSON.parse(abiJson) : abiJson

      return validAddresses.map((address) => ({
        address: address as `0x${string}`,
        abi: abi as any, // Use the full ABI in JSON format
        functionName: methodName,
        args: callInputs || [],
      }))
    } catch (error) {
      console.error('🔍 useMultipleContractSingleData: Error preparing contracts', error)
      return []
    }
  }, [addresses, contractInterface, methodName, callInputs, fragment])

  // Use Wagmi's useReadContracts hook
  // @ts-ignore
  const { data: results, isLoading, error } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
      staleTime: options?.blocksPerFetch === Infinity ? Infinity : 30_000, // 30 seconds default
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  })

  return useMemo(() => {
    if (!addresses || addresses.length === 0) {
      return []
    }

    return addresses.map((address, index) => {
      if (!address || !fragment) {
        return INVALID_CALL_STATE
      }

      if (isLoading) {
        return LOADING_CALL_STATE
      }

      // Find the corresponding result for this address
      const validAddresses = addresses.filter(addr => Boolean(addr))
      const validIndex = validAddresses.indexOf(address)
      const result = validIndex >= 0 ? results?.[validIndex] : undefined

      if (!result) {
        return INVALID_CALL_STATE
      }

      if (result.status === 'failure') {
        return {
          valid: true,
          loading: false,
          error: true,
          syncing: false,
          result: undefined,
        }
      }

      if (result.status === 'success') {
        // Convert BigInt values to string format for compatibility with existing code
        let processedResult = result.result

        if (Array.isArray(result.result)) {
          // Convert array to object with named properties for compatibility with ethers decoding
          // This handles cases like getReserves() which returns [reserve0, reserve1, blockTimestampLast]
          const arrayResult = result.result.map((item: any) => {
            if (typeof item === 'bigint') {
              return item.toString()
            }
            return item
          })

          // Try to get the function output names from the interface
          try {
            const func = contractInterface.getFunction(methodName)
            if (func && func.outputs && func.outputs.length > 0) {
              const namedResult: any = {}
              // Add both indexed and named access
              func.outputs.forEach((output, index) => {
                if (output.name && arrayResult[index] !== undefined) {
                  namedResult[output.name] = arrayResult[index]
                }
                namedResult[index] = arrayResult[index]
              })
              // Also include array methods like .length
              Object.defineProperty(namedResult, 'length', {
                value: arrayResult.length,
                enumerable: false,
              })
              // Make it behave like an array
              Object.setPrototypeOf(namedResult, Array.prototype)
              processedResult = namedResult
            } else {
              processedResult = arrayResult
            }
          } catch (error) {
            console.warn('Could not map array result to named properties:', error)
            processedResult = arrayResult
          }
        } else if (typeof result.result === 'object' && result.result !== null) {
          // Handle object results (like structs)
          const obj = result.result as any
          processedResult = {}
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'bigint') {
              ;(processedResult as any)[key] = value.toString()
            } else {
              ;(processedResult as any)[key] = value
            }
          }
        } else if (typeof result.result === 'bigint') {
          processedResult = result.result.toString()
        }

        return {
          valid: true,
          loading: false,
          error: false,
          syncing: false,
          result: processedResult as Result,
        }
      }

      return INVALID_CALL_STATE
    })
  }, [addresses, fragment, results, isLoading])
}

export function useSingleCallResult(
  contract: Contract | null | undefined,
  methodName: string,
  inputs?: OptionalMethodInputs,
  options?: ListenerOptions,
  gasRequired?: number
): CallState {
  const fragment = useMemo(() => contract?.interface?.getFunction(methodName), [contract, methodName])

  const calls = useMemo<Call[]>(() => {
    return contract && fragment && isValidMethodArgs(inputs)
      ? [
        {
          address: contract.address,
          callData: contract.interface.encodeFunctionData(fragment, inputs),
          ...(gasRequired ? { gasRequired } : {}),
        },
      ]
      : []
  }, [contract, fragment, inputs, gasRequired])

  const result = useCallsData(calls, options)[0]
  const latestBlockNumber = useBlockNumber()

  return useMemo(() => {
    return toCallState(result, contract?.interface, fragment, latestBlockNumber)
  }, [result, contract, fragment, latestBlockNumber])
}
