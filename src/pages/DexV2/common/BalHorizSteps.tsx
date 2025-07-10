import React from 'react'
import styled from 'styled-components'
import { Step, StepState } from 'types'

import BalTooltip from './BalTooltip'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  steps?: Step[]
  spacerWidth?: number
}

// Default steps and spacerWidth if not provided.
const defaultSteps: Step[] = [
  { tooltip: 'You did this', state: StepState.Success },
  { tooltip: 'Wallet is triggered', state: StepState.WalletOpen },
  { tooltip: 'This is pending', state: StepState.Pending },
  { tooltip: 'Do this now', state: StepState.Active },
  { tooltip: 'Do this next', state: StepState.Todo },
]
const defaultSpacerWidth = 16

const BalHorizSteps: React.FC<Props> = ({ steps = defaultSteps, spacerWidth = defaultSpacerWidth }) => {
  return (
    <Container>
      {steps.map((step, i) => (
        <StepWrapper key={i}>
          {i !== 0 && <Spacer spacerWidth={spacerWidth} />}
          <BalTooltip text={step.tooltip} width="44px" textAlign="center">
            <StepDot stepState={step.state}>
              {step.state === StepState.Success ? (
                <svg
                  stroke="currentColor"
                  fill="currentColor"
                  strokeWidth="0"
                  viewBox="0 0 512 512"
                  height="1em"
                  width="1em"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path>
                </svg>
              ) : step.state === StepState.Pending ? (
                <>
                  <span
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {i + 1}
                  </span>
                  <SpinnerIcon
                    style={{
                      width: '2rem',
                      height: '2rem',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                </>
              ) : (
                <span>{i + 1}</span>
              )}
            </StepDot>
          </BalTooltip>
        </StepWrapper>
      ))}
    </Container>
  )
}

export default BalHorizSteps

const SpinnerIcon = styled.div`
  width: 32px;
  height: 32px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const Container = styled.div`
  display: flex;
  align-items: center;
`

// Spacer between steps – we multiply the spacerWidth value by 0.25 rem (as in Tailwind, e.g. w-16 === 4rem)
const Spacer = styled.div<{ spacerWidth: number }>`
  height: 1px;
  background-color: #e5e7eb;
  width: ${(props) => props.spacerWidth * 0.25}rem;
`

// A styled circle representing a step. It uses the step state to determine border and text colors.
const StepDot = styled.div<{ stepState: StepState }>`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid
    ${(props) => {
      switch (props.stepState) {
        case StepState.Success:
          return '#10B981' // green-500
        case StepState.Active:
        case StepState.WalletOpen:
          return '#8B5CF6' // purple-500
        default:
          return '#d1d5db' // gray-300 as default
      }
    }};
  color: ${(props) => {
    switch (props.stepState) {
      case StepState.Success:
        return '#10B981'
      case StepState.Pending:
        return '#F97316' // orange-500
      case StepState.Active:
      case StepState.WalletOpen:
        return '#8B5CF6'
      default:
        return '#6b7280'
    }
  }};
  ${(props) => props.stepState === StepState.Pending && `border: none;`}
`

const StepWrapper = styled.div`
  display: flex;
  align-items: center;
`
