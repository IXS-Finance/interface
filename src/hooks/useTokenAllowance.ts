import { Token, CurrencyAmount } from '@ixswap1/sdk-core'
import { useMemo } from 'react'
import { useSingleCallResult } from '../state/multicall/hooks'
import { useTokenContract } from './useContract'

export function useTokenAllowance(
  token?: Token | null,
  owner?: string | null,
  spender?: string | null
): CurrencyAmount<Token> | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
   // @ts-ignore
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  return useMemo(
    () => (token && allowance ? CurrencyAmount.fromRawAmount(token, allowance.toString()) : undefined),
    [token, allowance]
  )
}
