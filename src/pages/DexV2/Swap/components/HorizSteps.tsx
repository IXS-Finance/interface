import React from 'react'
import styled from 'styled-components'

import { MouseoverTooltip } from 'components/Tooltip'
import checkImg from 'assets/images/dex-v2/check.svg'
import { Box, Flex } from 'rebass'

/**
 * STEP TYPES
 */
export enum StepState {
  Success = 'Success',
  WalletOpen = 'WalletOpen',
  Pending = 'Pending',
  Active = 'Active',
  Todo = 'Todo',
}

export interface Step {
  tooltip: string
  state: StepState
}

interface Props {
  steps?: Step[]
  spacerWidth?: number
}

const defaultSteps: Step[] = [
  { tooltip: 'You did this', state: StepState.Success },
  { tooltip: 'Wallet is triggered', state: StepState.WalletOpen },
  { tooltip: 'This is pending', state: StepState.Pending },
  { tooltip: 'Do this now', state: StepState.Active },
  { tooltip: 'Do this next', state: StepState.Todo },
]

const HorizSteps: React.FC<Props> = ({ steps = defaultSteps, spacerWidth = 16 }) => {
  return (
    <Flex alignItems="center" justifyContent="center" css={{ cursor: 'pointer' }}>
      {steps.map((step, i) => (
        <Flex alignItems="center" key={i}>
          {i !== 0 && <Spacer spacerWidth={spacerWidth} />}
          <Tooltip data-tooltip={step.tooltip}>
            <StepCircle state={step.state}>
              {step.state === StepState.Success ? (
                // Replace with your check icon component or image
                <IconCheck>
                  <polyline points="20 6 9 17 4 12" />
                </IconCheck>
              ) : step.state === StepState.Pending ? (
                <>
                  <CenteredSpan>{i + 1}</CenteredSpan>
                  <SpinnerIcon />
                </>
              ) : (
                <NumberText state={step.state}>{i + 1}</NumberText>
              )}
            </StepCircle>
          </Tooltip>
        </Flex>
      ))}
    </Flex>
  )
}

const Spacer = styled.div<{ spacerWidth: number }>`
  height: 1px;
  background-color: #d3d3d3;
  width: ${(props) => props.spacerWidth}px;
`

const StepCircle = styled.div<{ state: StepState }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid
    ${(props) => {
      switch (props.state) {
        case StepState.Success:
          return '#22c55e' // green-500
        case StepState.Pending:
          return 'transparent'
        case StepState.Active:
        case StepState.WalletOpen:
          return '#8b5cf6' // purple-500
        default:
          return '#d1d5db' // fallback gray
      }
    }};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* Default text color */
  color: ${(props) => {
    switch (props.state) {
      case StepState.Success:
        return '#22c55e'
      case StepState.Pending:
        return '#f97316' // orange-500
      default:
        return '#000'
    }
  }};
`

const IconCheck = styled.svg.attrs({
  viewBox: '0 0 24 24',
  width: '24',
  height: '24',
  stroke: 'currentColor',
  strokeWidth: '2',
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})`
  /* Add any additional styling here if needed */
`

const NumberText = styled.span<{ state: StepState }>`
  ${(props) =>
    (props.state === StepState.Active || props.state === StepState.WalletOpen) &&
    `
    background: linear-gradient(45deg, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  `}
`

const CenteredSpan = styled.span`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

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

const Tooltip = styled.div`
  position: relative;
  display: inline-block;

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: #fff;
    padding: 4px 8px;
    border-radius: 4px;
    white-space: nowrap;
    font-size: 12px;
    z-index: 100;
  }
`

export default HorizSteps
