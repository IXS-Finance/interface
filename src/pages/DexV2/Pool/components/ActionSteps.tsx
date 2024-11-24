import React from 'react'

import { TransactionActionInfo } from 'pages/DexV2/types/transactions'
import { Step, TransactionAction } from 'pages/DexV2/types'

interface ActionStepsProps {
  actions: TransactionActionInfo[]
  primaryActionType: TransactionAction
  disabled?: boolean
  // override action state loading prop and show
  // loading for all steps
  isLoading?: boolean
  // override action state loading label
  // for all steps
  loadingLabel?: string
}

type StepAction = {
  label: string
  loadingLabel: string
  pending: boolean
  step: Step
  promise: () => Promise<void>
  isSignAction?: boolean
}

const ActionSteps: React.FC<ActionStepsProps> = ({ disabled = false, isLoading = false, loadingLabel = '' }) => {
  return <div className="action-steps"></div>
}

export default ActionSteps
