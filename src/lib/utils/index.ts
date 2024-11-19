import BigNumber from 'bignumber.js'
import { getAddress } from '@ethersproject/address'

export function bnum(val: string | number | BigNumber): BigNumber {
  const number = typeof val === 'string' ? val : val ? val.toString() : '0'
  return new BigNumber(number)
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
