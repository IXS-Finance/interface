import React, { useEffect } from 'react'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { Pool } from 'services/pool/types'
import { TransactionActionInfo } from 'types/transactions'
import useTransactions from 'hooks/dex-v2/useTransactions'
import useExitPool from 'state/dexV2/pool/useExitPool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import BalActionSteps from './BalActionSteps'
import ConfirmationIndicator, { ButtonReturnPool } from 'pages/DexV2/common/ConfirmationIndicator'

interface WithdrawActionsProps {
  pool: Pool
  onError: () => void
  onSuccess: (receipt: TransactionReceipt) => void
}

const WithdrawActions: React.FC<WithdrawActionsProps> = ({ pool, onSuccess, onError }) => {
  const { addTransaction } = useTransactions()
  const { blockNumber, isMismatchedNetwork } = useWeb3()
  const { fNum } = useNumbers()

  const {
    txState,
    txInProgress,
    exit,
    isLoadingQuery,
    queryExitQuery,
    fiatTotalOut,
    approvalActions: exitPoolApprovalActions,
    isTxPayloadReady,
  } = useExitPool(pool)

  const redirectLabel: string = 'View pool'
  const isBuildingTx = !isTxPayloadReady

  // Build actions: merge approval actions with the withdrawal action.
  const withdrawalAction: TransactionActionInfo = {
    label: 'Withdraw',
    loadingLabel: 'Confirm withdrawal in wallet',
    confirmingLabel: 'Confirming...',
    action: submit,
    stepTooltip: 'Confirm withdrawal from this pool',
  }

  const actions: TransactionActionInfo[] = [...exitPoolApprovalActions, withdrawalAction]

  // Compute return route inline.
  const returnRoute = { pathname: `/v2/pool/${pool.id}`, search: '' }

  // Submit function: executes exit transaction.
  async function submit(): Promise<any> {
    try {
      const tx = await exit()
      txState.confirming = true
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'withdraw',
        summary: '',
        details: {
          total: fNum(fiatTotalOut, FNumFormats.fiat),
          pool: pool,
        },
      })
      return tx
    } catch (error: any) {
      txState.confirming = false
      throw new Error('Failed to submit withdrawal transaction.', { cause: error })
    } finally {
      txState.init = false
    }
  }
  async function handleSuccess(receipt: TransactionReceipt, confirmedAt: string): Promise<void> {
    txState.confirmed = true
    txState.confirming = false
    txState.receipt = receipt
    txState.confirmedAt = confirmedAt
    onSuccess(receipt)
  }

  function handleFailed(): void {
    txState.confirming = false
    onError()
  }

  // Watch blockNumber changes: refetch query when blockNumber updates.
  useEffect(() => {
    if (!isLoadingQuery && !txInProgress) {
      queryExitQuery.refetch()
    }
  }, [blockNumber])

  return (
    <div>
      {!txState.confirmed || !txState.receipt ? (
        <BalActionSteps
          actions={actions}
          primaryActionType="withdraw"
          disabled={isMismatchedNetwork}
          isLoading={isBuildingTx}
          loadingLabel={isBuildingTx ? 'Confirm withdrawal in wallet' : undefined}
          onSuccess={handleSuccess}
          onFailed={handleFailed}
        />
      ) : (
        <div>
          <ConfirmationIndicator txReceipt={txState.receipt} />
          <ButtonReturnPool to={`${returnRoute.pathname}${returnRoute.search}`}>{redirectLabel}</ButtonReturnPool>
        </div>
      )}
    </div>
  )
}

export default WithdrawActions
