import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { utils } from 'ethers'
import { useVotingEscrowContract } from 'hooks/useContract'
import useIXSCurrency from 'hooks/useIXSCurrency'
import { useTransactionAdder } from 'state/transactions/hooks'
import { safeParseUnits } from 'utils/formatCurrencyAmount'
import { WEEK } from './constants'
import { ApprovalState, useAllowance } from 'hooks/useApproveCallback'
import { useWeb3React } from 'hooks/useWeb3React'
import { IXS_ADDRESS } from 'constants/addresses'
import { configService } from 'services/config/config.service'

export type UseLockResult = ReturnType<typeof _useLock>
export const LockContext = createContext<UseLockResult | null>(null)

export function _useLock() {
  const [userInput, setUserInput] = useState('')
  const [duration, setDuration] = useState(604800) // 7 days
  const [locking, setLocking] = useState(false)
  const [locked, setLocked] = useState(false)

  const votingEscrowContract = useVotingEscrowContract()
  const addTransaction = useTransactionAdder()
  const currency = useIXSCurrency()

  const handleLock = useCallback(async () => {
    setLocking(true)
    try {
      const tx = await votingEscrowContract?.createLock(safeParseUnits(+userInput, currency?.decimals), duration)
      await tx.wait()

      if (!tx.hash) return
      setLocked(true)
      addTransaction(tx, {
        summary: `Lock ${userInput} IXS in ${Math.round(duration / WEEK)} weeks`,
      })
    } finally {
      setLocking(false)
    }
  }, [userInput, duration, votingEscrowContract, addTransaction, currency])

  const { chainId } = useWeb3React()
  const [approvalState, approve] = useAllowance(
    IXS_ADDRESS[chainId],
    utils.parseUnits(userInput || '0', currency?.decimals),
    configService.network.addresses.votingEscrow
  )

  const step = useMemo(() => {
    if (locked) return 3
    if (locking) return 2
    if (approvalState === ApprovalState.PENDING || approvalState === ApprovalState.APPROVED) return 1
    return 0
  }, [approvalState, locking, locked])

  return {
    userInput,
    setUserInput,
    duration,
    setDuration,
    locking,
    locked,
    handleLock,
    step,
    approvalState,
    approve,
  }
}

export function LockProvider({ children }: PropsWithChildren) {
  const value = _useLock()
  return <LockContext.Provider value={value}>{children}</LockContext.Provider>
}

export const useLock = (): UseLockResult => useContext(LockContext) as UseLockResult
