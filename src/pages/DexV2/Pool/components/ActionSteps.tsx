import React, { useEffect, useMemo, useState } from 'react'

import { TransactionActionInfo, TransactionActionState } from 'pages/DexV2/types/transactions'
import { Step, StepState, TransactionAction } from 'pages/DexV2/types'
import HorizSteps from './HorizSteps'
import { BackButton, NavigationButtons, NextButton } from '../Create'
import { useTokensState } from 'state/dexV2/tokens/hooks'
import { useErrorMsg } from 'lib/utils/errors'
import { toast } from 'react-toastify'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'

type BalStepAction = {
  label: string
  loadingLabel: string
  pending: boolean
  step: Step
  promise: () => Promise<void>
  isSignAction?: boolean
}

interface ActionStepsProps {
  currentActionIndex: number
  requiredActions: TransactionActionInfo[]
  primaryActionType: TransactionAction
  disabled?: boolean
  // override action state loading prop and show
  // loading for all steps
  isLoading?: boolean
  // override action state loading label
  // for all steps
  loadingLabel?: string
  goBack: () => void
  setCurrentActionIndex: any
}

type StepAction = {
  label: string
  loadingLabel: string
  pending: boolean
  step: Step
  promise: () => Promise<void>
  isSignAction?: boolean
}

const defaultActionState: TransactionActionState = {
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: '',
}

const ActionSteps: React.FC<ActionStepsProps> = ({
  currentActionIndex,
  disabled = false,
  isLoading = false,
  loadingLabel = '',
  requiredActions,
  goBack,
  setCurrentActionIndex,
}) => {
  const { formatErrorMsg } = useErrorMsg()
  const { hasRestoredFromSavedState, poolTypeString, createPool, joinPool } = usePoolCreation()
  const { needsSeeding, poolId } = usePoolCreationState()


  const [actionStates, setActionStates] = useState<TransactionActionState[]>(
    requiredActions.map(() => ({ ...defaultActionState }))
  )

  const actions: BalStepAction[] = requiredActions.map((actionInfo, idx) => {
    const actionState = actionStates[idx]
    return {
      label: actionInfo.label,
      loadingLabel: actionState.init ? actionInfo.loadingLabel : actionInfo.confirmingLabel,
      pending: actionState.init || actionState.confirming,
      isSignAction: actionInfo.isSignAction,
      promise: submit.bind(null, actionInfo, actionState),
      step: {
        tooltip: actionInfo.stepTooltip,
        state: getStepState(actionState, idx),
      },
    }
  })
  const steps: Step[] = actions.map((action) => action.step)

  const currentAction: BalStepAction | undefined = actions[currentActionIndex]

  function getStepState(actionState: TransactionActionState, index: number): StepState {
    if (currentActionIndex < index) return StepState.Todo
    else if (actionState.confirming) return StepState.Pending
    else if (actionState.init) return StepState.WalletOpen
    else if (actionState.confirmed) return StepState.Success
    return StepState.Active
  }

  async function submit(actionInfo: TransactionActionInfo, state: TransactionActionState): Promise<void> {
    const { action, postActionValidation } = actionInfo
    try {
      state.init = true
      state.error = null
      if (actionInfo.label === 'Fund pool') {
        await joinPool(poolId)
        toast.success('Create pool success')
        return
      } else if (actionInfo.label === 'Create Pool') {
        await createPool()
      } else {
        await action()
        await postActionValidation?.();
      }
      debugger;
      setCurrentActionIndex(currentActionIndex + 1)
      state.init = false
      state.confirming = true
    } catch (error) {
      console.error('Error submitting action', error)
      state.init = false
      state.confirming = false
      state.error = formatErrorMsg(error)
    }
  }

  async function handleTransaction(
    // tx: TransactionResponse,
    state: TransactionActionState,
    actionInfo: TransactionActionInfo
  ): Promise<void> {
    // const { postActionValidation, actionInvalidReason } = actionInfo;
    // await txListener(tx, {
    //   onTxConfirmed: async (receipt: TransactionReceipt) => {
    //     state.receipt = receipt;
    //     await postConfirmationDelay(tx);
    //     const isValid = await postActionValidation?.();
    //     if (isValid || !postActionValidation) {
    //       const confirmedAt = await getTxConfirmedAt(receipt);
    //       state.confirmedAt = dateTimeLabelFor(confirmedAt);
    //       state.confirmed = true;
    //       if (currentActionIndex.value >= actions.value.length - 1) {
    //         emit('success', receipt, state.confirmedAt);
    //       } else {
    //         currentActionIndex.value += 1;
    //       }
    //     } else {
    //       // post action validation failed, display reason.
    //       if (actionInvalidReason) state.error = actionInvalidReason;
    //       state.init = false;
    //     }
    //     state.confirming = false;
    //   },
    //   onTxFailed: () => {
    //     state.confirming = false;
    //     emit('failed');
    //   },
    // });
  }

  console.log('currentActionIndex', currentActionIndex)
  return (
    <div>
      {actions.length > 1 ? <HorizSteps steps={steps} /> : null}
      <NavigationButtons>
        <BackButton onClick={goBack}>Back</BackButton>
        <NextButton onClick={() => currentAction?.promise()}>{currentAction?.label}</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default ActionSteps
