// BalActionSteps.tsx
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/abstract-provider'

import useEthers from 'hooks/dex-v2/useEthers'
import { captureBalancerException, useErrorMsg } from 'lib/utils/errors'
import { TransactionAction, postConfirmationDelay } from 'hooks/dex-v2/useTransactions'
import { dateTimeLabelFor } from 'hooks/dex-v2/useTime'

// Import UI components (assumed React versions)
import BalAlert from 'pages/DexV2/Pool/components/BalAlert'
// import BalHorizSteps from '@/components/BalHorizSteps'
// import BalBtn from '@/components/BalBtn'
import signature from '@/assets/images/icons/signature.svg'

// Types (adjust imports as needed)
import type { TransactionActionInfo, TransactionActionState } from 'types/transactions'
import type { Step } from 'types'
import BalStack from 'pages/DexV2/common/BalStack'
import BalHorizSteps from 'pages/DexV2/common/BalHorizSteps'
import { NextButton } from 'pages/DexV2/Pool/Create'
import Loader from 'components/Loader'

enum StepState {
  Todo,
  Active,
  WalletOpen,
  Pending,
  Success,
  Warning,
  Error,
  Completed,
}

// --- Props & Types ---
type Props = {
  actions: TransactionActionInfo[]
  primaryActionType: TransactionAction
  disabled?: any
  isLoading?: boolean
  loadingLabel?: string
  onSuccess: (tx: TransactionReceipt, confirmedAt: string) => void
  onFailed: () => void
  onSetCurrentActionIndex?: (value: number) => void
}

// BalStepAction type
type BalStepAction = {
  label: string
  loadingLabel: string
  pending: boolean
  step: Step
  promise: () => Promise<void>
  isSignAction?: boolean
}

// Default state for each action
const defaultActionState: TransactionActionState = {
  init: false,
  confirming: false,
  confirmed: false,
  confirmedAt: '',
  error: null,
}

// --- Styled Components ---
const Container = styled.div`
  /* Container styles if needed */
`

// --- Component ---
const BalActionSteps: React.FC<Props> = (props) => {
  const { txListener, getTxConfirmedAt } = useEthers()
  const { formatErrorMsg } = useErrorMsg()

  // Local state: current action index, copy of actions, and an array of action states.
  const [currentActionIndex, setCurrentActionIndex] = useState<number>(0)
  const [actionsList, setActionsList] = useState<TransactionActionInfo[]>(props.actions)
  const [actionStates, setActionStates] = useState<TransactionActionState[]>(
    props.actions.map(() => ({ ...defaultActionState }))
  )

  // Update state when props.actions change.
  useEffect(() => {
    setActionsList(props.actions)
    setActionStates((prev) => {
      const newStates = [...prev]
      props.actions.forEach((_, i) => {
        if (!newStates[i]) {
          newStates[i] = { ...defaultActionState }
        }
      })
      return newStates
    })
  }, [props.actions])

  // Emit current action index to parent if callback provided.
  useEffect(() => {
    if (props.onSetCurrentActionIndex) {
      props.onSetCurrentActionIndex(currentActionIndex)
    }
  }, [currentActionIndex, props.onSetCurrentActionIndex])

  // Helper: update state of an action at a given index.
  function updateActionState(index: number, newProps: Partial<TransactionActionState>) {
    setActionStates((prev) => {
      const newStates = [...prev]
      newStates[index] = { ...newStates[index], ...newProps }
      return newStates
    })
  }

  // --- Compute Derived Values (computed on every render) ---
  const computedActions: BalStepAction[] = actionsList.map((actionInfo, idx) => {
    const state = actionStates[idx] || { ...defaultActionState }
    return {
      label: actionInfo.label,
      loadingLabel: state.init ? actionInfo.loadingLabel : actionInfo.confirmingLabel,
      pending: state.init || state.confirming,
      isSignAction: actionInfo.isSignAction,
      promise: () => submit(actionInfo, state),
      step: {
        tooltip: actionInfo.stepTooltip,
        state: getStepState(state, idx),
      },
    }
  })

  const currentAction = computedActions[currentActionIndex]
  const currentActionState = actionStates[currentActionIndex] || { ...defaultActionState }
  const lastActionState = actionStates.length > 0 ? actionStates[actionStates.length - 1] : { ...defaultActionState }
  const steps: Step[] = computedActions.map((action) => action.step)
  const spacerWidth: number = 13 - steps.length
  const _loadingLabel: string =
    currentAction && currentAction.pending ? currentAction.loadingLabel : props.loadingLabel || 'Loading....'

  // Determine the state of a step based on its action state.
  function getStepState(state: TransactionActionState, index: number): StepState {
    if (currentActionIndex < index) return StepState.Todo
    else if (state.confirming) return StepState.Pending
    else if (state.init) return StepState.WalletOpen
    else if (state.confirmed) return StepState.Success
    return StepState.Active
  }

  // --- Methods: submit, handleSignAction, handleTransaction ---
  async function submit(actionInfo: TransactionActionInfo, state: TransactionActionState): Promise<void> {
    const index = currentActionIndex
    try {
      updateActionState(index, { init: true, error: null })
      const tx = await actionInfo.action()
      updateActionState(index, { init: false, confirming: true })
      if (currentAction?.isSignAction) {
        handleSignAction(index)
        return
      }
      if (tx) {
        await handleTransaction(tx, index, actionInfo)
      }
    } catch (error: any) {
      updateActionState(index, { init: false, confirming: false, error: formatErrorMsg(error) })
      captureBalancerException({
        error: error?.cause || error,
        action: props.primaryActionType,
        context: { level: 'fatal' },
      })
    }
  }

  function handleSignAction(index: number) {
    updateActionState(index, { confirming: false, confirmed: true })
    setCurrentActionIndex((prev) => prev + 1)
  }

  async function handleTransaction(
    tx: TransactionResponse,
    index: number,
    actionInfo: TransactionActionInfo
  ): Promise<void> {
    const { postActionValidation, actionInvalidReason } = actionInfo
    await txListener(tx, {
      onTxConfirmed: async (receipt: TransactionReceipt) => {
        updateActionState(index, { receipt })
        await postConfirmationDelay(tx)
        const isValid = postActionValidation ? await postActionValidation() : true
        if (isValid) {
          const confirmedAt = await getTxConfirmedAt(receipt)
          updateActionState(index, { confirmedAt: dateTimeLabelFor(confirmedAt), confirmed: true })
          if (index >= computedActions.length - 1) {
            props.onSuccess(receipt, dateTimeLabelFor(confirmedAt))
          } else {
            setCurrentActionIndex((prev) => prev + 1)
          }
        } else {
          if (actionInvalidReason) updateActionState(index, { error: actionInvalidReason, init: false })
        }
        updateActionState(index, { confirming: false })
      },
      onTxFailed: () => {
        updateActionState(index, { confirming: false })
        props.onFailed()
      },
    })
  }

  // --- Render ---
  return (
    <Container>
      {currentActionState.error && !props.isLoading && (
        <BalAlert
          type="error"
          title={currentActionState.error?.title}
          description={currentActionState.error?.description}
          block
          style={{ marginBottom: '1rem' }}
        />
      )}
      <BalStack vertical>
        {computedActions.length > 1 && !lastActionState.confirmed && (
          <BalHorizSteps
            steps={steps}
            spacerWidth={spacerWidth}
            style={{ display: 'flex', justifyContent: 'center' }}
          />
        )}
        {!lastActionState.confirmed && currentAction && (
          <NextButton
            disabled={props.disabled}
            color="gradient"
            onClick={() => {
              if (currentAction && currentAction.promise) {
                currentAction.promise()
              }
            }}
          >
            {currentAction.pending || props.isLoading ? <Loader /> : null}

            {currentAction.pending || props.isLoading ? (
              _loadingLabel
            ) : (
              <div
                style={
                  currentAction.isSignAction
                    ? { display: 'flex', flexGrow: 1, justifyContent: 'space-between', alignItems: 'center' }
                    : undefined
                }
              >
                {currentAction.isSignAction && (
                  <svg
                    stroke="currentColor"
                    fill="currentColor"
                    strokeWidth="0"
                    viewBox="0 0 576 512"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M218.17 424.14c-2.95-5.92-8.09-6.52-10.17-6.52s-7.22.59-10.02 6.19l-7.67 15.34c-6.37 12.78-25.03 11.37-29.48-2.09L144 386.59l-10.61 31.88c-5.89 17.66-22.38 29.53-41 29.53H80c-8.84 0-16-7.16-16-16s7.16-16 16-16h12.39c4.83 0 9.11-3.08 10.64-7.66l18.19-54.64c3.3-9.81 12.44-16.41 22.78-16.41s19.48 6.59 22.77 16.41l13.88 41.64c19.75-16.19 54.06-9.7 66 14.16 1.89 3.78 5.49 5.95 9.36 6.26v-82.12l128-127.09V160H248c-13.2 0-24-10.8-24-24V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24v-40l-128-.11c-16.12-.31-30.58-9.28-37.83-23.75zM384 121.9c0-6.3-2.5-12.4-7-16.9L279.1 7c-4.5-4.5-10.6-7-17-7H256v128h128v-6.1zm-96 225.06V416h68.99l161.68-162.78-67.88-67.88L288 346.96zm280.54-179.63l-31.87-31.87c-9.94-9.94-26.07-9.94-36.01 0l-27.25 27.25 67.88 67.88 27.25-27.25c9.95-9.94 9.95-26.07 0-36.01z"></path>
                  </svg>
                )}
                {currentAction.label}
                {currentAction.isSignAction && <div style={{ width: '2rem' }} />}
              </div>
            )}
          </NextButton>
        )}
      </BalStack>
    </Container>
  )
}

export default BalActionSteps
