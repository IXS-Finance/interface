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
  disabled = false,
  isLoading = false,
  loadingLabel = '',
  requiredActions,
  goBack,
}) => {
  const { formatErrorMsg } = useErrorMsg()
  const { hasRestoredFromSavedState, poolTypeString, createPool, joinPool } = usePoolCreation()
  const { needsSeeding, poolId } = usePoolCreationState()

  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  const [actionStates, setActionStates] = useState<TransactionActionState[]>([])
  const [actions, setActions] = useState<BalStepAction[]>([])

  function getStepState(actionState: TransactionActionState, index: number): StepState {
    if (currentActionIndex < index) return StepState.Todo
    else if (actionState.confirming) return StepState.Pending
    else if (actionState.init) return StepState.WalletOpen
    else if (actionState.confirmed) return StepState.Success
    return StepState.Active
  }

  async function submit(actionInfo: TransactionActionInfo, state: TransactionActionState): Promise<void> {
    const { action } = actionInfo
    try {
      state.init = true
      state.error = null
      if (actionInfo.label === 'Fund pool') {
        joinPool()
        toast.success('Create pool success')
        return;
      } else {
        await action()
        setCurrentActionIndex(currentActionIndex + 1)
      }
      state.init = false
      state.confirming = true
    } catch (error) {
      state.init = false
      state.confirming = false
      state.error = formatErrorMsg(error)
    }
  }

  const steps = useMemo((): Step[] => actions.map((action) => action.step), [JSON.stringify(actions)])

  const currentAction = useMemo(
    (): BalStepAction | undefined => actions[currentActionIndex],
    [currentActionIndex, JSON.stringify(actions)]
  )

  useEffect(() => {
    const newActionStates = requiredActions.map(() => ({
      ...defaultActionState,
    }))

    const newActions = requiredActions.map((actionInfo, idx) => {
      const actionState = newActionStates[idx]

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
    setActionStates(newActionStates)
    setActions(newActions)
  }, [JSON.stringify(requiredActions)])

  return (
    <div>
      {actions.length > 1 ? <HorizSteps steps={steps} /> : null}{' '}
      <NavigationButtons>
        <BackButton onClick={goBack}>Back</BackButton>
        <NextButton onClick={() => currentAction?.promise()}>{currentAction?.label}</NextButton>
      </NavigationButtons>
    </div>
  )
}

export default ActionSteps
