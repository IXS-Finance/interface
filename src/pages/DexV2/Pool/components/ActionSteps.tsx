import React, { useEffect, useState } from 'react'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'

import { TransactionActionInfo, TransactionActionState } from 'pages/DexV2/types/transactions'
import { Step, StepState } from 'pages/DexV2/types'
import HorizSteps from './HorizSteps'
import { BackButton, NavigationButtons, NextButton } from '../Create'
import { useErrorMsg } from 'lib/utils/errors'
import { toast } from 'react-toastify'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import Loader from 'components/Loader'
import useEthers from 'hooks/dex-v2/useEthers'
import { TransactionAction, postConfirmationDelay } from 'hooks/dex-v2/useTransactions'
import { dateTimeLabelFor } from 'hooks/dex-v2/useTime'

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
  const { txListener, getTxConfirmedAt } = useEthers()
  const { formatErrorMsg } = useErrorMsg()
  const { hasRestoredFromSavedState, poolTypeString, createPool, joinPool } = usePoolCreation()
  const { needsSeeding, poolId } = usePoolCreationState()

  const [loading, setLoading] = useState(false)

  const actions: BalStepAction[] = []

  const actionStates = requiredActions.map(() => ({ ...defaultActionState }))

  requiredActions.forEach((actionInfo, idx) => {
    const actionState = actionStates[idx]
    if (!actionState) {
      return
    }

    actions.push({
      label: actionInfo.label,
      loadingLabel: actionState.init ? actionInfo.loadingLabel : actionInfo.confirmingLabel,
      pending: actionState.init || actionState.confirming,
      isSignAction: actionInfo.isSignAction,
      promise: submit.bind(null, actionInfo, actionState),
      step: {
        tooltip: actionInfo.stepTooltip,
        state: getStepState(actionState, idx),
      },
    })
  })

  const currentAction: BalStepAction | undefined = actions[currentActionIndex]
  const currentActionState: TransactionActionState = actionStates[currentActionIndex]
  const lastActionState: TransactionActionState = actionStates[actionStates.length - 1]
  const steps: Step[] = actions.map((action) => action.step)

  const _loadingLabel: string = currentAction?.pending ? currentAction.loadingLabel : loadingLabel || 'Loading...'

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
    actionInfo: TransactionActionInfo
  ): Promise<void> {
    const { postActionValidation, actionInvalidReason } = actionInfo;

    await txListener(tx, {
      onTxConfirmed: async (receipt: TransactionReceipt) => {
        state.receipt = receipt;

        await postConfirmationDelay(tx);

        const isValid = await postActionValidation?.();
        if (isValid || !postActionValidation) {
          const confirmedAt = await getTxConfirmedAt(receipt);
          state.confirmedAt = dateTimeLabelFor(confirmedAt);
          state.confirmed = true;
          if (currentActionIndex >= actions.length - 1) {
            debugger;
            // emit('success', receipt, state.confirmedAt);
          } else {
            setCurrentActionIndex((prevIndex: any) => prevIndex + 1);
          }
        } else {
          // post action validation failed, display reason.
          if (actionInvalidReason) state.error = actionInvalidReason;
          state.init = false;
        }
        state.confirming = false;
      },
      onTxFailed: () => {
        state.confirming = false;
        debugger;
        // emit('failed');
      },
    });
  }

  async function submit(actionInfo: TransactionActionInfo, state: TransactionActionState): Promise<void> {
    const { action } = actionInfo
    try {
      state.init = true
      state.error = null

      const tx = await action()

      state.init = false
      state.confirming = true

      if (currentAction?.isSignAction) {
        handleSignAction(state)
        return
      }

      if (tx) handleTransaction(tx, state, actionInfo)
    } catch (error) {
      state.init = false
      state.confirming = false
      state.error = formatErrorMsg(error)
      // captureBalancerException({
      //   error: (error as Error)?.cause || error,
      //   action: props.primaryActionType,
      //   context: { level: 'fatal' },
      // });
    }
  }

  // async function submit(actionInfo: TransactionActionInfo, state: TransactionActionState): Promise<void> {
  //   const { action, postActionValidation } = actionInfo
  //   // try {
  //   //   setLoading(true)
  //   //   if (actionInfo.label === 'Fund pool') {
  //   //     await joinPool(poolId)
  //   //     toast.success('Create pool success')
  //   //     return
  //   //   } else if (actionInfo.label === 'Create Pool') {
  //   //     await createPool()
  //   //   } else {
  //   //     await action()
  //   //     await postActionValidation?.()
  //   //   }
  //   //   setCurrentActionIndex(currentActionIndex + 1)
  //   // } catch (error: any) {
  //   //   console.error('Error submitting action', error?.message)
  //   //   const errorMsg = formatErrorMsg(error?.message)
  //   //   if (errorMsg) {
  //   //     toast.error(errorMsg.title)
  //   //   }
  //   // } finally {
  //   //   setLoading(false)
  //   // }
  // }

  return (
    <div>
      {actions.length > 1 ? <HorizSteps steps={steps} /> : null}
      <NavigationButtons>
        <BackButton onClick={goBack}>Back</BackButton>
        <NextButton onClick={() => currentAction?.promise()} disabled={loading}>
          {loading ? <Loader /> : null}
          {currentAction?.label}
        </NextButton>
      </NavigationButtons>
    </div>
  )
}

export default ActionSteps
