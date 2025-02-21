import React, { useEffect, useState } from 'react'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'
import { useDispatch } from 'react-redux'

import { TransactionActionInfo, TransactionActionState } from 'pages/DexV2/types/transactions'
import HorizSteps, { Step, StepState } from './HorizSteps'
import { BackButton, NavigationButtons, NextButton } from '../Create'
import { useErrorMsg } from 'lib/utils/errors'
import { toast } from 'react-toastify'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import Loader from 'components/Loader'
import useEthers from 'hooks/dex-v2/useEthers'
import { TransactionAction, postConfirmationDelay } from 'hooks/dex-v2/useTransactions'
import { dateTimeLabelFor } from 'hooks/dex-v2/useTime'
import { setActionStates } from 'state/dexV2/poolCreation'
import BalAlert from './BalAlert'

export type BalStepAction = {
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
  const dispatch = useDispatch()
  const { txListener, getTxConfirmedAt } = useEthers()
  const { formatErrorMsg } = useErrorMsg()
  const { actionStates, hasRestoredFromSavedState, poolTypeString, createPool, joinPool, updateActionState } =
    usePoolCreation()

  const [loading, setLoading] = useState(false)
  const [currentActionIndex, setCurrentActionIndex] = useState(0)

  const actions: BalStepAction[] = []

  requiredActions.forEach((actionInfo, idx) => {
    const actionState = actionStates[idx]
    console.log('actionState', actionState)
    if (!actionState) {
      return
    }

    actions.push({
      label: actionInfo.label,
      loadingLabel: actionState.init ? actionInfo.loadingLabel : actionInfo.confirmingLabel,
      pending: actionState.init || actionState.confirming,
      isSignAction: actionInfo.isSignAction,
      promise: submit.bind(null, actionInfo, actionState, idx),
      step: {
        tooltip: actionInfo.stepTooltip,
        state: getStepState(actionState, idx),
      },
    })
  })

  console.log('actions', actions)

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
    actionInfo: TransactionActionInfo,
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
            toast.success(`Pool created successfully `)
            console.log('success', receipt, state.confirmedAt);
          } else {
            setCurrentActionIndex((prevIndex: any) => prevIndex + 1)
          }
        } else {
          // post action validation failed, display reason.
          if (actionInvalidReason) {
            updateActionState(actionIndex, { error: actionInvalidReason })
          }
          updateActionState(actionIndex, { init: false })
        }
        updateActionState(actionIndex, { confirming: false })
      },
      onTxFailed: () => {
        updateActionState(actionIndex, { confirming: false })
        debugger
        // emit('failed');
      },
    })
  }

  async function submit(
    actionInfo: TransactionActionInfo,
    state: TransactionActionState,
    actionIndex: number
  ): Promise<void> {
    const { action } = actionInfo
    try {
      updateActionState(actionIndex, { init: true, error: null })

      let tx: any;
      if (actionInfo.label === 'Fund pool') {
        tx = await joinPool() // Because joinPool is async
      } else {
        tx = await action()
      }

      updateActionState(actionIndex, { init: false, confirming: true })

      if (currentAction?.isSignAction) {
        handleSignAction(state)
        return
      }

      if (tx) handleTransaction(tx, state, actionInfo, actionIndex)
    } catch (error) {
      console.log(error)
      updateActionState(actionIndex, { init: false, confirming: false, error: formatErrorMsg(error) })
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

  useEffect(() => {
    const actionStatesData = requiredActions.map(() => ({ ...defaultActionState }))
    dispatch(setActionStates(actionStatesData))
  }, [JSON.stringify(requiredActions)])

  console.log('currentActionState', currentActionState)
  console.log('test', lastActionState)
  return (
    <div>
      {currentActionState && currentActionState?.error && !isLoading ? (
        <BalAlert type="error" title={currentActionState?.error?.title ?? 'Error'}>
          {currentActionState?.error?.description ?? 'An error occurred'}
        </BalAlert>
      ) : null}

      {actions.length > 1 && !lastActionState?.confirmed ? <HorizSteps steps={steps} /> : null}
      {!lastActionState?.confirmed ? (
        <NavigationButtons>
          <BackButton onClick={goBack}>Back</BackButton>
          <NextButton onClick={() => currentAction?.promise()} disabled={currentAction?.pending || loading}>
            {loading ? <Loader /> : null}
            {currentAction?.label}
          </NextButton>
        </NavigationButtons>
      ) : null}
    </div>
  )
}

export default ActionSteps
