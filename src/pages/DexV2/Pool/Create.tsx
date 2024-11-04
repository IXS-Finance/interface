import React, { useState } from 'react'
import styled from 'styled-components'

import VerticleSteps from './components/VerticleSteps'
import { StepIds, StepLabels } from './types'
import TokensAndWeights from './Steps/TokensAndWeights'
import SetPoolFees from './Steps/SetPoolFees'
import SetInitialLiquidity from './Steps/SetInitialLiquidity'

const Create: React.FC = () => {
  const [activeStep, setActiveStep] = useState(StepIds.SetInitialLiquidity)

  const steps: { [key in StepIds]: StepLabels } = {
    [StepIds.TokensAndWeights]: StepLabels.TokensAndWeights,
    [StepIds.SetPoolFees]: StepLabels.SetPoolFees,
    [StepIds.SetInitialLiquidity]: StepLabels.SetInitialLiquidity,
    [StepIds.ConfirmPoolCreation]: StepLabels.ConfirmPoolCreation,
  }

  return (
    <WidthFull>
      <LayoutContainer>
        <LeftContent>
          <VerticleSteps steps={steps} activeStep={activeStep} />
        </LeftContent>
        <CenterContent>
          <Card>
            <NetworkText>Ethereum Mainnet</NetworkText>
            <Title>{steps[activeStep]}</Title>

            {activeStep === StepIds.TokensAndWeights ? <TokensAndWeights /> : null}
            {activeStep === StepIds.SetPoolFees ? <SetPoolFees /> : null}
            {activeStep === StepIds.SetInitialLiquidity ? <SetInitialLiquidity /> : null}
          </Card>
        </CenterContent>
        <RightContent></RightContent>
      </LayoutContainer>
    </WidthFull>
  )
}

export default Create

const WidthFull = styled.div`
  width: 100%;
`

const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  row-gap: 2rem;
  column-gap: 0px;
  margin-left: auto;
  margin-right: auto;
  max-width: 80rem;
  padding-left: 0px;
  padding-right: 0px;

  @media (min-width: 640px) {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(7, minmax(0, 1fr));
    column-gap: 2rem;
    margin-top: 146px;
  }
`

const LeftContent = styled.div`
  grid-column: span 2 / span 2;
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`

const CenterContent = styled.div`
  grid-column: span 3 / span 3;
  margin-left: auto;
  margin-right: auto;
  width: 100%;

  @media (min-width: 640px) {
    max-width: 36rem;
  }

  @media (min-width: 1024px) {
    margin-left: 0px;
    margin-right: 0px;
  }
`

const RightContent = styled.div`
  grid-column: span 2 / span 2;
  display: none;

  @media (min-width: 1024px) {
    display: block;
  }
`

const Card = styled.div`
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
  padding: 24px;

  @media (min-width: 640px) {
    padding: 32px;
  }

  @media (min-width: 1024px) {
    padding: 48px;
  }
`

const NetworkText = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  margin-bottom: 6px;
`

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

export const Line = styled.div`
  border: 1px solid #e6e6ff;
  margin-top: 16px;
  margin-bottom: 16px;
`
