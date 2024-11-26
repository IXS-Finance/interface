import { Step, StepState } from 'pages/DexV2/types'
import React from 'react'
import styled from 'styled-components'

import { MouseoverTooltip } from 'components/Tooltip'

interface HorizStepsProps {
  steps: Step[]
}

const HorizSteps: React.FC<HorizStepsProps> = ({ steps }) => {
  console.log('HorizSteps', steps)
  return (
    <StepsContainer>
      {steps.map((step, i) => (
        <StepContent key={i}>
          {i !== 0 ? <ConnectedLine /> : null}

          <MouseoverTooltip text={step.tooltip} placement="top">
            <StepStyled>
              {step.state === StepState.Completed ? (
                <CheckIcon className="w-8 h-8" />
              ) : step.state === StepState.Pending ? (
                <>
                  <StepNumber className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    {i + 1}
                  </StepNumber>
                  <SpinnerIcon className="w-8 h-8 animate-spin" />
                </>
              ) : (
                <StepNumber>{i + 1}</StepNumber>
              )}
            </StepStyled>
          </MouseoverTooltip>
        </StepContent>
      ))}
    </StepsContainer>
  )
}

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
`

const StepContent = styled.div`
  display: flex;
  align-items: center;
`

const ConnectedLine = styled.div`
  width: 2.75rem;
  height: 1px;
  background-color: #e6e6ff;
`

const StepStyled = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: 1px solid #d1d5db;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`

const StepNumber = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

const CheckIcon = styled.div`
  width: 2rem;
  height: 2rem;
`

const SpinnerIcon = styled.div`
  width: 2rem;
  height: 2rem;
  animation: spin 1s linear infinite; /* animate-spin */
  /* Add your SpinnerIcon styles here */

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

export default HorizSteps
