import React, { useEffect, useState } from 'react'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { useDispatch } from 'react-redux'

import { TransactionActionState } from 'pages/DexV2/types/transactions'
import HorizSteps, { Step, StepState } from './HorizSteps'
import { NavigationButtons } from 'pages/DexV2/Pool/Create'
import { captureBalancerException, useErrorMsg } from 'lib/utils/errors'
import useEthers from 'hooks/dex-v2/useEthers'
import { postConfirmationDelay } from 'hooks/dex-v2/useTransactions'
import { dateTimeLabelFor } from 'hooks/dex-v2/useTime'
import BalAlert from 'pages/DexV2/common/BalAlert'
import { useSwapState } from 'state/dexV2/swap/useSwapState'
import { setActionStates } from 'state/dexV2/swap'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import { TransactionActionStakingInfo } from 'types/transactions'
import { LpToken, StakeAction, StakePreviewPoolProps, useStakePreview } from './hooks/useStakePreview'
import { Box } from 'rebass'
import { BigNumber } from 'ethers'

export type BalStepAction = {
  label: string
  loadingLabel: string
  pending: boolean
  step: Step
  promise: () => Promise<void>
  isSignAction?: boolean
}

interface ActionStepsProps {
  pool: StakePreviewPoolProps
  gaugeAddress: string
  lpToken: LpToken
  primaryActionType: StakeAction
  disabled?: boolean
  amountToSubmit: BigNumber
  currentShares: string
  isLoading?: boolean
  loadingLabel?: string
  onClose: () => void
}

const defaultActionState: TransactionActionState = {
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: '',
}

const ActionSteps: React.FC<ActionStepsProps> = ({
  pool,
  lpToken,
  disabled = false,
  isLoading = false,
  amountToSubmit,
  currentShares,
  gaugeAddress,
  primaryActionType,
  onClose,
}) => {
  const dispatch = useDispatch()
  const { txListener, getTxConfirmedAt } = useEthers()
  const { formatErrorMsg } = useErrorMsg()
  const onSuccess = () => {}
  const { actionStates, updateActionState } = useSwapState()
  const {
    stakeActions,
    handleSuccess,
    isLoading: isStakePreviewLoading,
  } = useStakePreview({
    lpToken,
    gaugeAddress,
    currentShares,
    amountToSubmit,
    pool,
    action: primaryActionType,
    onClose,
    onSuccess,
  })

  const [loading, setLoading] = useState(false)
  const [currentActionIndex, setCurrentActionIndex] = useState(0)

  const actions: any = stakeActions
    .map((actionInfo, idx) => {
      const actionState = actionStates[idx]
      if (!actionState) return null
      return {
        label: actionInfo.label,
        loadingLabel: isStakePreviewLoading
          ? 'Validating...'
          : actionState.init
          ? actionInfo.loadingLabel
          : actionInfo.confirmingLabel,
        pending: actionState.init || actionState.confirming,
        isSignAction: actionInfo.isSignAction,
        promise: submit.bind(null, actionInfo, actionState, idx),
        step: {
          tooltip: actionInfo.stepTooltip,
          state: getStepState(actionState, idx),
        },
      }
    })
    .filter((item) => item !== null)

  const currentAction: BalStepAction | undefined = actions[currentActionIndex]
  const currentActionState: TransactionActionState = actionStates[currentActionIndex]
  const lastActionState: TransactionActionState = actionStates[actionStates.length - 1]
  const steps: Step[] = actions.map((action: any) => action.step)

  function getStepState(actionState: TransactionActionState, index: number): StepState {
    if (currentActionIndex < index) return StepState.Todo
    else if (actionState.confirming) return StepState.Pending
    else if (actionState.init) return StepState.WalletOpen
    else if (actionState.confirmed) return StepState.Success
    return StepState.Active
  }

  function handleSignAction(state: TransactionActionState) {
    setCurrentActionIndex((prevIndex: any) => prevIndex + 1)
    state.confirming = false
    state.confirmed = true
  }

  async function handleTransaction(
    tx: TransactionResponse,
    state: TransactionActionState,
    actionInfo: TransactionActionStakingInfo,
    actionIndex: number
  ): Promise<void> {
    const { postActionValidation, actionInvalidReason } = actionInfo

    await txListener(tx, {
      onTxConfirmed: async (receipt: TransactionReceipt) => {
        updateActionState(actionIndex, { receipt })

        await postConfirmationDelay(tx)

        const isValid = await postActionValidation?.()

        if (isValid || !postActionValidation) {
          const confirmedAt = await getTxConfirmedAt(receipt)
          updateActionState(actionIndex, { confirmedAt: dateTimeLabelFor(confirmedAt), confirmed: true })
          if (currentActionIndex >= actions.length - 1) {
            console.log('success', receipt, state.confirmedAt)
            handleSuccess(receipt)
            onClose()
          } else {
            setCurrentActionIndex(currentActionIndex + 1)
          }
        } else {
          if (actionInvalidReason) {
            updateActionState(actionIndex, { error: actionInvalidReason })
          }
          updateActionState(actionIndex, { init: false })
        }
        setLoading(false)
        updateActionState(actionIndex, { confirming: false })
      },
      onTxFailed: () => {
        updateActionState(actionIndex, { confirming: false, error: actionInvalidReason })
        setLoading(false)
      },
    })
  }

  async function submit(
    actionInfo: TransactionActionStakingInfo,
    state: TransactionActionState,
    actionIndex: number
  ): Promise<void> {
    const { action } = actionInfo
    try {
      setLoading(true)
      updateActionState(actionIndex, { init: true, error: null })

      const tx = await action(amountToSubmit)

      updateActionState(actionIndex, { init: false, confirming: true })

      if (currentAction?.isSignAction) {
        handleSignAction(state)
        return
      }
      if (tx) handleTransaction(tx, state, actionInfo, actionIndex)
    } catch (error) {
      console.log(error)
      updateActionState(actionIndex, { init: false, confirming: false, error: formatErrorMsg(error) })
      captureBalancerException({
        error: (error as Error)?.cause || error,
        action: primaryActionType,
        context: { level: 'fatal' },
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    const actionStatesData = stakeActions.map(() => ({ ...defaultActionState }))
    dispatch(setActionStates(actionStatesData))
  }, [JSON.stringify(stakeActions)])

  return (
    <Box mt="16px">
      {currentActionState && currentActionState?.error && !isLoading ? (
        <BalAlert type="error" title={currentActionState?.error?.title ?? 'Error'} className="mb-4">
          {currentActionState?.error?.description ?? 'An error occurred'}
        </BalAlert>
      ) : null}

      {actions && actions.length > 1 && !lastActionState?.confirmed && !disabled ? <HorizSteps steps={steps} /> : null}
      {!lastActionState?.confirmed ? (
        <NavigationButtons>
          <BalBtn outline block onClick={onClose} disabled={disabled || loading}>
            Cancel
          </BalBtn>
          <BalBtn
            block
            color={currentAction?.label === 'Unstake' ? 'red' : 'blue'}
            onClick={() => currentAction?.promise()}
            disabled={disabled || isStakePreviewLoading}
            loading={loading || isStakePreviewLoading}
            loadingLabel={currentAction?.loadingLabel}
          >
            {currentAction?.label}
          </BalBtn>
        </NavigationButtons>
      ) : null}
    </Box>
  )
}

export default ActionSteps
