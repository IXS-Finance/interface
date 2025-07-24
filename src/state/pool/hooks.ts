/* eslint-disable react-hooks/rules-of-hooks */
// @ts-nocheck
import { Contract } from 'ethers'
import { usePairContract } from 'hooks/useContract'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import { AppDispatch, AppState } from 'state'
import apiService from 'services/apiService'
import { pool } from 'services/apiUrls'

import { setPoolTransctionHash, addLiquidity } from './actions'

export function getPoolTransactionHash(): null | string {
  return useSelector<AppState, null | string>((state) => state.pool.transactionHash)
}

export const setPoolTransactionHash = () => {
  const dispatch = useDispatch<AppDispatch>()

  return useCallback(
    (newState: string | null) => {
      dispatch(setPoolTransctionHash({ transactionHash: newState }))
    },
    [dispatch]
  )
}

export const useMitigationEnabled = (liquidityAddress?: string) => {
  const pairContract: Contract | null = usePairContract(liquidityAddress)
  const [mitigationEnabled, setMitigationEnabled] = useState(false)

  const checkMitigation = useCallback(async () => {
    if (!pairContract) {
      return false
    }
    const isEnabled = await pairContract.mitigationEnabled()
    return isEnabled
  }, [pairContract])

  useEffect(() => {
    async function check() {
      const result = await checkMitigation()
      setMitigationEnabled(result)
    }
    check()
  }, [checkMitigation])
  return mitigationEnabled
}

interface AddLiquidity {
  address: string
  tokenId: number
  token0: string
  token1: string
  network: string
  blockNumber: number
  decimals: number
  txHash: string
}

const addLiquidityReq = async (data: AddLiquidity) => {
  const result = await apiService.post(pool.addLiquidity, data)
  return result.data
}

export function useAddLiquidity() {
  const dispatch = useDispatch<AppDispatch>()
  const callback = useCallback(
    async (data: AddLiquidity) => {
      try {
        dispatch(addLiquidity.pending())
        await addLiquidityReq(data)
        dispatch(addLiquidity.fulfilled())
        return data
      } catch (error: any) {
        dispatch(addLiquidity.rejected({ errorMessage: error }))
        return error
      }
    },
    [dispatch]
  )
  return callback
}
