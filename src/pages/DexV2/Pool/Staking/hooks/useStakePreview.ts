import { useState, useEffect, useCallback } from 'react'
// import { ApprovalAction } from 'composables/approvals/types'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { formatUnits } from '@ethersproject/units'
import { bnum } from 'lib/utils'
import { AnyPool } from 'services/pool/types'
import { TransactionActionStakingInfo } from 'types/transactions'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { getAddress } from '@ethersproject/address'
import useTokenApprovalActions from 'hooks/dex-v2/approvals/useTokenApprovalActions'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { usePoolStaking } from 'state/dexV2/poolStaking/usePoolStaking'
import useTransactions from 'hooks/dex-v2/useTransactions'
import { fiatValueOf } from 'hooks/dex-v2/usePoolHelpers'
import { ApprovalAction } from 'hooks/dex-v2/approvals/types'
import { LiquidityGauge } from 'services/balancer/contracts/liquidity-gauge'
import useWeb3 from 'hooks/dex-v2/useWeb3'

export type StakeAction = 'stake' | 'unstake'
export type StakePreviewProps = {
  pool: AnyPool
  action: StakeAction
}

// In React we pass callbacks instead of using Vue emits.
export type UseStakePreviewProps = StakePreviewProps & {
  amountToSubmit?: string
  onSuccess: () => void
  onClose: () => void
}

export function useStakePreview(props: UseStakePreviewProps) {
  // STATE
  const [isLoadingApprovalsForGauge, setIsLoadingApprovalsForGauge] = useState(false)
  const [isActionConfirmed, setIsActionConfirmed] = useState(false)
  const [isActionConfirming, setIsActionConfirming] = useState(false)
  const [confirmationReceipt, setConfirmationReceipt] = useState<TransactionReceipt | undefined>(undefined)
  const [stakeActions, setStakeActions] = useState<TransactionActionStakingInfo[]>([])

  // COMPOSABLES (React hooks)
  const { balanceFor, refetchBalances, allowances } = useTokens()
  const { fNum } = useNumbers()
  const { addTransaction } = useTransactions()
  const { getTokenApprovalActions } = useTokenApprovalActions()
  const {
    isLoading: isPoolStakingLoading,
    stake,
    unstake,
    refetchAllPoolStakingData,
    preferentialGaugeAddress,
    stakedBalance,
    unstakeBalance,
    isFetchingStakedBalance,
  } = usePoolStaking()

  // Determine current shares: if action is 'stake', use token balance; otherwise use staked shares.
  const currentShares = balanceFor(getAddress(props.pool.address))
  // Define the stake and unstake actions.
  async function handleStake(amount: string): Promise<TransactionResponse> {
    try {
      const tx = await stake(amount)
      setIsActionConfirming(true)
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'stake',
        summary: `${fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat)} in ${props.pool.symbol}`,
        details: {
          total: fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat),
          pool: props.pool,
        },
      })
      return tx
    } catch (error: any) {
      setIsActionConfirming(false)
      throw new Error(`Failed create stake transaction`, { cause: error })
    }
  }

  async function handleUnstake(amount: string): Promise<TransactionResponse> {
    try {
      const tx = await unstake(amount)
      setIsActionConfirming(true)
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'unstake',
        summary: `${fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat)} from ${props.pool.symbol}`,
        details: {
          total: fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat),
          pool: props.pool,
        },
      })
      return tx
    } catch (error: any) {
      setIsActionConfirming(false)
      throw new Error(`Failed create Unstake transaction`, { cause: error })
    }
  }

  const stakeActionObj = {
    label: 'Stake',
    loadingLabel: 'Staking...',
    confirmingLabel: 'Confirming..',
    action: (amount: string) => handleStake(amount),
    stepTooltip: 'Confirm staking of LP tokens to earn liquidity mining incentives on this pool',
  }

  const unstakeActionObj = {
    label: 'Unstake',
    loadingLabel: 'Unstaking...',
    confirmingLabel: 'Confirming..',
    action: (amount: string) => handleUnstake(amount),
    stepTooltip: `Confirm unstaking of LP tokens. You'll lose eligibility to earn liquidity mining incentives for this pool.`,
  }

  const isStakeAndZero = props.action === 'stake' && (currentShares === '0' || currentShares === '')

  const amountsToApprove = [
    {
      address: props.pool.address,
      amount: props.amountToSubmit || '0',
    },
  ]

  const isLoading = isLoadingApprovalsForGauge || isPoolStakingLoading

  const loadApprovalsForGauge = useCallback(async () => {
    setIsLoadingApprovalsForGauge(true)
    try {
      const approvalActions = await getTokenApprovalActions({
        amountsToApprove,
        spender: preferentialGaugeAddress, // dependency handled here
        actionType: ApprovalAction.Staking,
        forceMax: false,
      })

      if (approvalActions) {
        setStakeActions((prev) => [...approvalActions, ...prev])
      }
    } catch (error) {
      console.error('Error loading approvals:', error)
    } finally {
      setIsLoadingApprovalsForGauge(false)
    }
  }, [preferentialGaugeAddress, props.amountToSubmit])

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

  // Watch for changes in the action prop.
  useEffect(() => {
    if (props.action === 'stake') {
      setStakeActions([stakeActionObj])
    } else if (props.action === 'unstake') {
      setStakeActions([unstakeActionObj])
    }
  }, [props.action, currentShares])

  // Watch for changes in the preferentialGaugeAddress.
  useEffect(() => {
    async function run() {
      debugger;
      if (props.action === 'unstake') return
      await loadApprovalsForGauge()
    }

    if (preferentialGaugeAddress && props.amountToSubmit !== '0') {
      run()
    }
  }, [preferentialGaugeAddress, props.action, props.amountToSubmit])

  return {
    isActionConfirmed,
    isActionConfirming,
    confirmationReceipt,
    isLoading,
    currentShares,
    stakeActions,
    handleSuccess,
    handleClose,
    isStakeAndZero,
    stakedBalance,
    isFetchingStakedBalance,
    unstakeBalance,
  }
}
