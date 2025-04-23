import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react'
import { utils } from 'ethers'
import { useVotingEscrowContract } from 'hooks/useContract'
import useIXSCurrency from 'hooks/useIXSCurrency'
import { useTransactionAdder } from 'state/transactions/hooks'
import { safeParseUnits } from 'utils/formatCurrencyAmount'
import { WEEK, FOUR_YEARS_IN_SECONDS } from '../constants'
import { useAllowance } from 'hooks/useApproveCallback'
import { useWeb3React } from 'hooks/useWeb3React'
import { IXS_ADDRESS } from 'constants/addresses'
import { useParams } from 'react-router-dom'
import { configService } from 'services/config/config.service'

export type UseLockDetailResult = ReturnType<typeof _useLockDetail>
export const LockDetailContext = createContext<UseLockDetailResult | null>(null)

export function _useLockDetail() {
  const params = useParams<{ id: string }>()
  const lockId = params.id.toLowerCase()
  const [userInput, setUserInput] = useState('')
  const [duration, setDuration] = useState(604800) // 7 days
  const [locking, setLocking] = useState(false)
  const [increased, setIncreased] = useState(false)
  const [extended, setExtended] = useState(false)
  const [openMaxLockMode, setOpenMaxLockMode] = useState(false)
  const votingEscrowContract = useVotingEscrowContract()
  const addTransaction = useTransactionAdder()
  const currency = useIXSCurrency()

  useEffect(() => {
    if (openMaxLockMode) {
      setDuration(FOUR_YEARS_IN_SECONDS)
    } else {
      setDuration(WEEK)
    }
  }, [openMaxLockMode])

  const handleSubmitIncrease = useCallback(async () => {
    if (!lockId) return
    setLocking(true)
    try {
      const tx = await votingEscrowContract?.increaseAmount(lockId, safeParseUnits(+userInput, currency?.decimals))
      await tx.wait()

      if (!tx.hash) return
      setIncreased(true)
      addTransaction(tx, {
        summary: `Increase Lock ${userInput} IXS`,
      })

      setTimeout(() => {
        setIncreased(false)
      }, 3000)
    } finally {
      setLocking(false)
    }
  }, [userInput, duration, votingEscrowContract, addTransaction, currency, lockId])

  const handleSubmitExtend = useCallback(async () => {
    if (!lockId) return
    setLocking(true)
    console.log('handleSubmitExtend', lockId, duration, typeof duration)
    try {
      const tx = await votingEscrowContract?.increaseUnlockTime(lockId, duration)
      await tx.wait()

      if (!tx.hash) return
      setExtended(true)
      addTransaction(tx, {
        summary: `Extend Lock in ${Math.round(duration / WEEK)} weeks`,
      })

      setTimeout(() => {
        setExtended(false)
      }, 3000)
    } finally {
      setLocking(false)
    }
  }, [duration, votingEscrowContract, addTransaction, lockId])

  const { chainId } = useWeb3React()
  const [approvalState, approve] = useAllowance(
    IXS_ADDRESS[chainId],
    utils.parseUnits(userInput || '0', currency?.decimals),
    configService.network.addresses.votingEscrow
  )

  return {
    lockId,
    userInput,
    setUserInput,
    duration,
    setDuration,
    locking,
    increased,
    setIncreased,
    extended,
    setExtended,
    handleSubmitIncrease,
    handleSubmitExtend,
    approvalState,
    approve,
    openMaxLockMode,
    setOpenMaxLockMode,
  }
}

export function LockDetailProvider({ children }: PropsWithChildren) {
  const value = _useLockDetail()
  return <LockDetailContext.Provider value={value}>{children}</LockDetailContext.Provider>
}

export const useLockDetail = (): UseLockDetailResult => useContext(LockDetailContext) as UseLockDetailResult
