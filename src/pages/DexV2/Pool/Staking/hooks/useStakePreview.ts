import { useState, useEffect, useCallback } from 'react'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import { AnyPool } from 'services/pool/types'
import { TransactionActionStakingInfo } from 'types/transactions'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import useTokenApprovalActions from 'hooks/dex-v2/approvals/useTokenApprovalActions'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { usePoolStaking } from 'state/dexV2/poolStaking/usePoolStaking'
import useTransactions from 'hooks/dex-v2/useTransactions'
import { fiatValueOf } from 'hooks/dex-v2/usePoolHelpers'
import { ApprovalAction } from 'hooks/dex-v2/approvals/types'
import { Address } from 'viem'
import { TokenInfo } from 'types/TokenList'
import { BigNumber } from 'ethers'

export type StakeAction = 'stake' | 'unstake'
export type StakePreviewPoolProps = Pick<AnyPool, 'totalLiquidity' | 'totalShares' | 'address' | 'name'>
export type StakePreviewProps = {
  pool: StakePreviewPoolProps
  action: StakeAction
}

export type LpToken = Pick<TokenInfo, 'address' | 'symbol' | 'decimals'>

// In React we pass callbacks instead of using Vue emits.
export type UseStakePreviewProps = StakePreviewProps & {
  currentShares: string
  gaugeAddress?: Address
  lpToken: LpToken
  amountToSubmit?: BigNumber
  onSuccess: () => void
  onClose: () => void
}

export function useStakePreview(props: UseStakePreviewProps) {
  // STATE
  const { currentShares, gaugeAddress, lpToken } = props
  const [isLoadingApprovalsForGauge, setIsLoadingApprovalsForGauge] = useState(false)
  const [isActionConfirmed, setIsActionConfirmed] = useState(false)
  const [isActionConfirming, setIsActionConfirming] = useState(false)
  const [confirmationReceipt, setConfirmationReceipt] = useState<TransactionReceipt | undefined>(undefined)
  const [stakeActions, setStakeActions] = useState<TransactionActionStakingInfo[]>([])

  // COMPOSABLES (React hooks)
  const { refetchBalances, tokens } = useTokens()
  const { fNum } = useNumbers()
  const { addTransaction } = useTransactions()
  const { getTokenApprovalActions } = useTokenApprovalActions()
  const {
    isLoading: isPoolStakingLoading,
    stake,
    unstake,
    refetchAllPoolStakingData,
    stakedBalance,
    unstakeBalance,
    isFetchingStakedBalance,
  } = usePoolStaking({
    gaugeAddress,
  })

  // Define the stake and unstake actions.
  async function handleStake(amount: BigNumber): Promise<TransactionResponse> {
    try {
      const tx = await stake(amount)
      setIsActionConfirming(true)
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'stake',
        summary: `${fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat)} in ${props.pool.name}`,
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

  async function handleUnstake(amount: BigNumber): Promise<TransactionResponse> {
    try {
      const tx = await unstake(amount)
      setIsActionConfirming(true)
      addTransaction({
        id: tx.hash,
        type: 'tx',
        action: 'unstake',
        summary: `${fNum(fiatValueOf(props.pool, currentShares), FNumFormats.fiat)} from ${props.pool.name}`,
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
    action: (amount: BigNumber) => handleStake(amount),
    stepTooltip: 'Confirm staking of LP tokens to earn liquidity mining incentives on this pool',
  }

  const unstakeActionObj = {
    label: 'Unstake',
    loadingLabel: 'Unstaking...',
    confirmingLabel: 'Confirming..',
    action: (amount: BigNumber) => handleUnstake(amount),
    stepTooltip: `Confirm unstaking of LP tokens. You'll lose eligibility to earn liquidity mining incentives for this pool.`,
  }

  const isStakeAndZero = props.action === 'stake' && (currentShares === '0' || currentShares === '')

  const amountsToApprove = [
    {
      address: props.pool.address,
      amount: props.amountToSubmit || BigNumber.from('0'),
    },
  ]

  const isLoading = isLoadingApprovalsForGauge || isPoolStakingLoading

  const loadApprovalsForGauge = useCallback(async () => {
    if (!gaugeAddress) return
    setIsLoadingApprovalsForGauge(true)
    try {
      const approvalActions = await getTokenApprovalActions({
        tokens,
        amountsToApprove,
        spender: gaugeAddress, // dependency handled here
        actionType: ApprovalAction.Staking,
        forceMax: false,
      })

      if (props.action === 'stake') {
        setStakeActions([...approvalActions, stakeActionObj])
      } else if (props.action === 'unstake') {
        setStakeActions([...approvalActions, unstakeActionObj])
      }
    } catch (error) {
      console.error('Error loading approvals:', error)
    } finally {
      setIsLoadingApprovalsForGauge(false)
    }
  }, [gaugeAddress, props.amountToSubmit, props.action])

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
      if (props.action === 'unstake') return
      await loadApprovalsForGauge()
    }

    if (gaugeAddress && props.amountToSubmit?.gt(0)) {
      run()
    }
  }, [gaugeAddress, props.action, props.amountToSubmit])

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
