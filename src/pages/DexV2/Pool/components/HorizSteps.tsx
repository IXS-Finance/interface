import { Step, StepState } from 'pages/DexV2/types'
import React from 'react'
import styled from 'styled-components'

import { MouseoverTooltip } from 'components/Tooltip'
import checkImg from 'assets/images/dex-v2/check.svg'

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
              {step.state === StepState.Success ? <Image src={checkImg}>Check</Image> : null}
              {step.state === StepState.WalletOpen ? <Image src={checkImg}>Check</Image> : null}
              {step.state === StepState.Pending ? <Image src={checkImg}>Check</Image> : null}
              {![StepState.Success, StepState.WalletOpen, StepState.Pending].includes(step.state) ? (
                <StepNumber>{i + 1}</StepNumber>
              ) : null}
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
  width: 32px;
  height: 32px;
  border-radius: 9999px;
  border: 1px solid #E6E6FF;
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
  cursor: pointer;
  color: #B8B8D2;
  font-size: 14px;
`

const Image = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
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
