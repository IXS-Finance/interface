// AddLiquidityActions.tsx
import React, { useEffect } from 'react'
import styled from 'styled-components'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'

import { Pool } from 'services/pool/types'
import { TransactionActionInfo } from 'types/transactions'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import useTransactions from 'hooks/dex-v2/useTransactions'
import { useJoinPool } from 'state/dexV2/pool/useJoinPool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'
import ActionSteps from './ActionSteps'
import ConfirmationIndicator, { ButtonReturnPool } from 'pages/DexV2/common/ConfirmationIndicator'
// import usePoolStaking from '@/hooks/usePoolStaking';

// // UI Components (assumed to be available as React components)
// import BalActionSteps from '@/components/BalActionSteps';
// import ConfirmationIndicator from '@/components/ConfirmationIndicator';
// import BalBtn from '@/components/BalBtn';
// import StarsIcon from '@/components/StarsIcon';
// import FeedbackCard from '@/components/FeedbackCard';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  pool: Pool
  onSuccess: (receipt: TransactionReceipt) => void
}

const Container = styled.div``

const AddLiquidityActions: React.FC<Props> = ({ pool, onSuccess }) => {
  // Hooks / Providers
  const { fNum } = useNumbers()
  const { addTransaction } = useTransactions()
  // const { isStakablePool } = usePoolStaking();
  const { isMismatchedNetwork } = useWeb3()
  // For helpers, pass the pool as needed (assumes hook accepts pool as argument)
  const { poolWeightsLabel } = usePoolHelpers(pool)
  const { rektPriceImpact, fiatValueOut, join, txState, approvalActions: joinPoolApprovalActions } = useJoinPool(pool)

  // Compute actions (without memoization)
  const actions: TransactionActionInfo[] = [
    ...joinPoolApprovalActions,
    {
      label: 'Add liquidity',
      loadingLabel: 'Confirm add liquidity in wallet',
      confirmingLabel: 'Confirming...',
      action: submit,
      stepTooltip: 'Confirm your liquidity add into this pool',
    },
  ]

  const returnRoute = { pathname: `/v2/pool/${pool.id}`, search: '' }
  const redirectLabel: string = 'View pool'

  // Methods
  async function handleSuccess(receipt: TransactionReceipt, confirmedAt: string): Promise<void> {
    // Update txState – assuming txState is mutable (from useJoinPool)
    txState.receipt = receipt
    txState.confirmedAt = confirmedAt
    txState.confirmed = true
    txState.confirming = false
    onSuccess(receipt)
  }

  function handleFailed(): void {
    txState.confirming = false
  }

  async function submit(): Promise<TransactionResponse> {
    txState.init = true
    try {
      const tx = await join()
      txState.confirming = true

      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'invest',
        summary: `${fNum(fiatValueOut, FNumFormats.fiat)} in ${poolWeightsLabel(pool)}`,
        details: {
          total: fNum(fiatValueOut, FNumFormats.fiat),
          pool: pool,
        },
      })

      return tx
    } catch (error: any) {
      txState.confirming = false
      throw new Error('Failed to submit transaction.', { cause: error })
    } finally {
      txState.init = false
    }
  }

  // // Cleanup: reset txState when component unmounts (similar to onUnmounted)
  // useEffect(() => {
  //   return () => {
  //     resetTxState()
  //   }
  // }, [resetTxState])

  return (
    <Container>
      {!txState.confirmed || !txState.receipt ? (
        <ActionSteps
          requiredActions={actions}
          primaryActionType="invest"
          disabled={!!rektPriceImpact || !!isMismatchedNetwork}
          onSuccess={(receipt: TransactionReceipt, confirmedAt: string) => handleSuccess(receipt, confirmedAt)}
          // onFailed={handleFailed}
        />
      ) : (
        <div>
          <ConfirmationIndicator txReceipt={txState.receipt} />
          <ButtonReturnPool to={`${returnRoute.pathname}${returnRoute.search}`}>{redirectLabel}</ButtonReturnPool>
        </div>
      )}
    </Container>
  )
}

export default AddLiquidityActions
