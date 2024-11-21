import React from 'react'

interface ActionStepsProps {
  steps: string[]
  currentStep: number
}

const ActionSteps: React.FC<ActionStepsProps> = ({ steps, currentStep }) => {
  return <div className="action-steps"></div>
}

export default ActionSteps
