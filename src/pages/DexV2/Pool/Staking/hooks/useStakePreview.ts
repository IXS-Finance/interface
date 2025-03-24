import { useState, useEffect } from 'react'
// import { ApprovalAction } from 'composables/approvals/types'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { bnum } from 'lib/utils'
import { AnyPool } from 'services/pool/types'
import { TransactionActionInfo } from 'types/transactions'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'
import useTokenApprovalActions from 'hooks/dex-v2/approvals/useTokenApprovalActions'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { usePoolStaking } from 'state/dexV2/poolStaking/usePoolStaking'
import useTransactions from 'hooks/dex-v2/useTransactions'
import { fiatValueOf } from 'hooks/dex-v2/usePoolHelpers'
import { ApprovalAction } from 'hooks/dex-v2/approvals/types'

export type StakeAction = 'stake' | 'unstake' | 'restake'
export type StakePreviewProps = {
  pool: AnyPool
  action: StakeAction
}

// In React we pass callbacks instead of using Vue emits.
export type UseStakePreviewProps = StakePreviewProps & {
  onSuccess: () => void
  onClose: () => void
}

export function useStakePreview(props: UseStakePreviewProps) {
  // STATE
  const [isLoadingApprovalsForGauge, setIsLoadingApprovalsForGauge] = useState(false)
  const [isActionConfirmed, setIsActionConfirmed] = useState(false)
  const [isActionConfirming, setIsActionConfirming] = useState(false)
  const [confirmationReceipt, setConfirmationReceipt] = useState<TransactionReceipt | undefined>(undefined)
  const [stakeActions, setStakeActions] = useState<TransactionActionInfo[]>([])

  // COMPOSABLES (React hooks)
  const { balanceFor, refetchBalances } = useTokens()
  const { fNum } = useNumbers()
  const { addTransaction } = useTransactions()
  const { getTokenApprovalActions } = useTokenApprovalActions()
  const {
    isLoading: isPoolStakingLoading,
    stake,
    unstake,
    stakedShares,
    refetchAllPoolStakingData,
    preferentialGaugeAddress,
  } = usePoolStaking()

  // Determine current shares: if action is 'stake', use token balance; otherwise use staked shares.
  const currentShares = props.action === 'stake' ? balanceFor(getAddress(props.pool.address)) : stakedShares // assumed to be a string

  // Define the stake and unstake actions.
  async function txWithNotification(
    actionFn: () => any,
    actionType: StakeAction
  ): Promise<TransactionResponse> {
    try {
      const tx = await actionFn()
      setIsActionConfirming(true)
      // addTransaction({
      //   id: tx.hash,
      //   type: 'tx',
      //   action: actionType,
      //   summary: t(`transactionSummary.${actionType}`, {
      //     pool: props.pool.symbol,
      //     amount: fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat),
      //   }),
      //   details: {
      //     total: fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat),
      //     pool: props.pool,
      //   },
      // })
      return tx
    } catch (error: any) {
      setIsActionConfirming(false)
      throw new Error(`Failed create ${actionType} transaction`, { cause: error })
    }
  }

  const stakeActionObj = {
    label: 'Stake',
    loadingLabel: 'Staking',
    confirmingLabel: 'Confirming..',
    action: () => txWithNotification(stake, 'stake'),
    stepTooltip: 'Confirm staking of LP tokens to earn liquidity mining incentives on this pool',
  }

  const unstakeActionObj = {
    label: 'Staked',
    loadingLabel: 'Unstaking',
    confirmingLabel: 'Confirming..',
    action: () => txWithNotification(unstake, 'unstake'),
    stepTooltip:
      props.action === 'restake'
        ? `Confirm restaking of LP tokens. You'll be again able to earn liquidity mining incentives for this pool.`
        : `Confirm unstaking of LP tokens. You'll lose eligibility to earn liquidity mining incentives for this pool.`,
  }

  // Computed values.
  const isStakeAndZero = props.action === 'stake' && (currentShares === '0' || currentShares === '')
  // const totalUserPoolSharePct = bnum(bnum(stakedShares).plus(balanceFor(getAddress(props.pool.address))))
  //   .div(props.pool.totalShares)
  //   .toString()

  const amountsToApprove = [
    {
      address: props.pool.address,
      amount: currentShares,
    },
  ]

  const isLoading = isLoadingApprovalsForGauge || isPoolStakingLoading

  // METHODS
  async function loadApprovalsForGauge() {
    const approvalActions = await (async () => {
      setIsLoadingApprovalsForGauge(true)
      const res = await getTokenApprovalActions({
        amountsToApprove: amountsToApprove,
        spender: preferentialGaugeAddress,
        actionType: ApprovalAction.Staking,
      })

      setIsLoadingApprovalsForGauge(false)
      return res
    })()

    if (approvalActions) {
      setStakeActions((prev) => [...approvalActions, ...prev])
    }
  }

  async function handleSuccess(receipt: TransactionReceipt) {
    setIsActionConfirmed(true)
    setIsActionConfirming(false)
    setConfirmationReceipt(receipt)
    await Promise.all([refetchBalances(), refetchAllPoolStakingData()])
    props.onSuccess()
  }

  function handleClose() {
    setIsActionConfirmed(false)
    setIsActionConfirming(false)
    setConfirmationReceipt(undefined)
    props.onClose()
  }

  // WATCHERS

  // Watch for changes in the action prop.
  useEffect(() => {
    if (props.action === 'stake') {
      setStakeActions([stakeActionObj])
    } else if (props.action === 'unstake') {
      setStakeActions([unstakeActionObj])
    } else if (props.action === 'restake') {
      setStakeActions([unstakeActionObj, stakeActionObj])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.action, currentShares])

  // Watch for changes in the preferentialGaugeAddress.
  useEffect(() => {
    async function run() {
      if (props.action === 'unstake') return
      await loadApprovalsForGauge()
    }
    run()
  }, [preferentialGaugeAddress, props.action])

  // On mount: load approvals if needed.
  useEffect(() => {
    async function run() {
      if (props.action !== 'unstake') {
        await loadApprovalsForGauge()
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    // State values
    isActionConfirmed,
    isActionConfirming,
    confirmationReceipt,
    isLoading,
    currentShares,
    stakeActions,
    // totalUserPoolSharePct,
    // Methods
    handleSuccess,
    handleClose,
    isStakeAndZero,
  }
}
