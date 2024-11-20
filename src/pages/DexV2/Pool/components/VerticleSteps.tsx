import React from 'react'
import styled from 'styled-components'
import { StepLabels } from '../types'

interface VerticleStepsProps {
  activeStep: number
  steps: { [key: number]: StepLabels }
}

const VerticleSteps: React.FC<VerticleStepsProps> = ({ activeStep, steps }) => {
  return (
    <Container>
      {Object.entries(steps).map(([key, step], index) => (
        <Step key={key}>
          <Circle isActive={index === activeStep}>{index + 1}</Circle>
          <StepLabel isActive={index === activeStep}>{step}</StepLabel>
        </Step>
      ))}
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
