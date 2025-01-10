import React from 'react'
import styled from 'styled-components'
import { createLockSteps } from '../constants/processes'
import { useLock } from '../LockProvider'

interface VerticleStepsProps {
}

const VerticleSteps: React.FC<VerticleStepsProps> = () => {
  const { step } = useLock()

  return (
    <Container>
      {createLockSteps.map(({ label, icon }, index) => {
        const Icon = icon
        const isActive = step >= index
        return (
          <Step key={label}>
            <Circle isActive={isActive}>
              <Icon />
            </Circle>
            <StepLabel isActive={isActive}>{label}</StepLabel>
          </Step>
        )
      })}
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
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg26 : theme.white)};
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;

  svg {
    path {
      stroke: ${({ isActive, theme }) => (isActive ? theme.white : theme.blue5)};
    }
  }
`

const StepLabel = styled.div<{ isActive: boolean }>`
  margin-left: 8px;
  font-size: 14px;
  color: ${({ isActive }) => (isActive ? '#292933' : '#292933')};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.3)};
`
