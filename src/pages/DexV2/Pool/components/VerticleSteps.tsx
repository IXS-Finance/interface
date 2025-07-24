import React from 'react'
import styled from 'styled-components'
import { StepState } from 'types'

interface VerticleStepsProps {
  steps: any
}

const VerticleSteps: React.FC<VerticleStepsProps> = ({ steps }) => {
  const activeSteps = steps.filter((step: any) => step.isVisible)
  return (
    <Container>
      {activeSteps.map((step: any, index: number) =>
        step.isVisible ? (
          <Step key={step.id}>
            <Circle isActive={step.state === StepState.Active}>{index + 1}</Circle>
            <StepLabel isActive={step.state === StepState.Active}>{step.tooltip}</StepLabel>
          </Step>
        ) : null
      )}
    </Container>
  )
}

export default VerticleSteps

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const Step = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
`

const Circle = styled.div<{ isActive: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ isActive }) => (isActive ? '#007bff' : 'rgba(102, 102, 255, 0.20)')};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
`

const StepLabel = styled.div<{ isActive: boolean }>`
  margin-left: 8px;
  font-size: 14px;
  color: ${({ isActive }) => (isActive ? '#292933' : '#292933')};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.3)};
`
