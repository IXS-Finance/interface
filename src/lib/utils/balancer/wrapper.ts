import { BigNumber } from 'ethers'
import { TransactionResponse } from '@ethersproject/providers'
import { configService } from 'services/config/config.service'
import { wagmiConfig } from 'components/Web3Provider'
import { simulateContract, waitForTransactionReceipt, writeContract } from '@wagmi/core'
import { parseEther } from 'viem'
import config from 'lib/config'

export enum WrapType {
  NonWrap = 0,
  Wrap,
  Unwrap,
}

export const isNativeAssetWrap = (tokenIn: string, tokenOut: string): boolean => {
  const nativeAddress = configService.network.tokens.Addresses.nativeAsset
  const wNativeAddress = configService.network.tokens.Addresses.wNativeAsset
  return tokenIn === nativeAddress && tokenOut === wNativeAddress
}

export const getWrapAction = (tokenIn: string, tokenOut: string): WrapType => {
  const nativeAddress = configService.network.tokens.Addresses.nativeAsset
  const wNativeAddress = configService.network.tokens.Addresses.wNativeAsset

  if (tokenIn === nativeAddress && tokenOut === wNativeAddress) return WrapType.Wrap

  if (tokenOut === nativeAddress && tokenIn === wNativeAddress) return WrapType.Unwrap

  return WrapType.NonWrap
}

export const getWrapOutput = async (wrapper: string, wrapType: WrapType, wrapAmount: BigNumber): Promise<BigNumber> => {
  if (wrapType === WrapType.NonWrap) throw new Error('Invalid wrap type')
  const wNativeAddress = configService.network.tokens.Addresses.wNativeAsset

  if (wrapper === wNativeAddress) return BigNumber.from(wrapAmount)

  throw new Error('Unknown wrapper')
}

export async function wrap(network: string, account: any, wrapper: string, amount: any) {
  try {
    if (wrapper === config[network].tokens.Addresses.wNativeAsset) {
      return wrapNative(network, account, amount)
    }

    throw new Error('Unrecognised wrapper contract')
  } catch (e) {
    console.log('[Wrapper] Wrap error:', e)
    return Promise.reject(e)
  }
}

export async function unwrap(network: string, account: any, wrapper: string, amount: any) {
  try {
    if (wrapper === config[network].tokens.Addresses.wNativeAsset) {
      return unwrapNative(network, account, amount)
    }
    throw new Error('Unrecognised wrapper contract')
  } catch (e) {
    console.log('[Wrapper] Unwrap error:', e)
    return Promise.reject(e)
  }
}

const wrapNative = async (network: string, account: any, amount: any) => {
  // @ts-ignore
  const { request } = await simulateContract(wagmiConfig, {
    account,
    address: config[network].tokens.Addresses.wNativeAsset,
    abi: ['function deposit() payable'],
    functionName: 'deposit',
    value: amount,
  })

  // @ts-ignore
  const txHash = await writeContract(wagmiConfig, request)

  const receipt: any = await waitForTransactionReceipt(wagmiConfig, { hash: txHash })

  return receipt
}

const unwrapNative = async (network: string, account: any, amount: any) => {
  // @ts-ignore
  const { request } = await simulateContract(wagmiConfig, {
    account,
    address: config[network].tokens.Addresses.wNativeAsset,
    abi: ['function withdraw(uint256 wad)'],
    functionName: 'withdraw',
    args: [amount],
  })

  // @ts-ignore
  const txHash = await writeContract(wagmiConfig, request)

  const receipt: any = await waitForTransactionReceipt(wagmiConfig, { hash: txHash })

  return receipt
}
