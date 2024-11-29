import React, { useEffect, useMemo, useState } from 'react'

import { TransactionActionInfo, TransactionActionState } from 'pages/DexV2/types/transactions'
import { Step, StepState, TransactionAction } from 'pages/DexV2/types'
import HorizSteps from './HorizSteps'
import { BackButton, NavigationButtons, NextButton } from '../Create'
import { useErrorMsg } from 'lib/utils/errors'
import { toast } from 'react-toastify'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import Loader from 'components/Loader'

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
  const [loading, setLoading] = useState(false)

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
      setLoading(true)
      if (actionInfo.label === 'Fund pool') {
        await joinPool(poolId)
        toast.success('Create pool success')
        return
      } else if (actionInfo.label === 'Create Pool') {
        await createPool()
      } else {
        await action()
        await postActionValidation?.()
      }
      setCurrentActionIndex(currentActionIndex + 1)
    } catch (error: any) {
      console.error('Error submitting action', error?.message)
      const errorMsg = formatErrorMsg(error?.message)
      debugger;
      if (errorMsg) {
        toast.error(errorMsg.title)
      }
    } finally {
      setLoading(false)
    }
  }

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
