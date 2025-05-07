import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import ChooseWeights from './components/Steps/ChooseWeights'
import SetPoolFees from './components/Steps/SetPoolFees'
import InitialLiquidity from './components/Steps/InitialLiquidity'
import PreviewPool from './components/Steps/PreviewPool'

import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import UnknownTokenPriceModal from './components/UnknownTokenPriceModal'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { StepState } from 'types'
import VerticleSteps from '../components/VerticleSteps'
import TokenPrices from '../components/TokenPrices'
import SimilarPool from './components/Steps/SimilarPool'
import DexV2Layout from 'pages/DexV2/common/Layout'
import { selectByAddress } from 'lib/utils'

const Create: React.FC = () => {
  const { activeStep, similarPools, tokensList, resetPoolCreationState, updateTokenWeights } = usePoolCreation()
  const { priceFor, injectedPrices } = useTokens()

  const [isUnknownTokenModalVisible, setIsUnknownTokenModalVisible] = useState(false)

  const validTokens = tokensList.filter((t: string) => t !== '')
  const unknownTokens = validTokens.filter((token) => {
    return priceFor(token) === 0 || selectByAddress(injectedPrices, token)
  })

  const doSimilarPoolsExist = similarPools.length > 0
  const hasUnknownToken = validTokens.some((t: any) => priceFor(t) === 0)

  /**
   * FUNCTIONS
   */
  function getStepState(idx: number) {
    if (activeStep === idx) {
      return StepState.Active
    } else {
      if (activeStep > idx) {
        return StepState.Completed
      } else {
        return StepState.Todo
      }
    }
  }

  const steps = [
    {
      tooltip: 'Choose tokens & weights',
      state: getStepState(0),
      id: 0,
      isVisible: true,
      component: ChooseWeights,
    },
    {
      tooltip: 'Set pool fees',
      state: getStepState(1),
      id: 1,
      isVisible: true,
      component: SetPoolFees,
    },
    {
      tooltip: 'Similar pools',
      state: getStepState(2),
      id: 2,
      isVisible: activeStep === 2 && doSimilarPoolsExist,
      component: SimilarPool,
    },
    {
      tooltip: 'Set initial liquidity',
      state: getStepState(3),
      id: 3,
      isVisible: true,
      component: InitialLiquidity,
    },
    {
      tooltip: 'Confirm pool creation',
      state: getStepState(4),
      id: 4,
      isVisible: true,
      component: PreviewPool,
    },
  ]
  const CurrentStepComponent = steps[activeStep].component

  function handleUnknownModalClose() {
    setIsUnknownTokenModalVisible(false)
  }

  function showUnknownTokenModal() {
    setIsUnknownTokenModalVisible(true)
  }

  useEffect(() => {
    if (hasUnknownToken) {
      showUnknownTokenModal()
    }
  }, [activeStep])

  /**
   * Reset pool create state when component is unmounted
   */
  useEffect(() => {
    return () => {
      resetPoolCreationState()
    }
  }, [])

  return (
    <DexV2Layout>
      <WidthFull>
        <LayoutContainer>
          <LeftContent>
            <VerticleSteps steps={steps} activeStep={activeStep} />
          </LeftContent>
          <CenterContent>{steps[activeStep].isVisible ? <CurrentStepComponent /> : null}</CenterContent>

          {validTokens.length > 0 ? (
            <RightContent>
              {/* <PoolSummary /> */}
              <TokenPrices toggleUnknownPriceModal={showUnknownTokenModal} />
            </RightContent>
          ) : null}
        </LayoutContainer>

        {isUnknownTokenModalVisible ? (
          <UnknownTokenPriceModal
            visible={isUnknownTokenModalVisible}
            unknownTokens={unknownTokens}
            onClose={handleUnknownModalClose}
          />
        ) : null}
      </WidthFull>
    </DexV2Layout>
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
    margin-top: 32px;
  }
`

const LeftContent = styled.div`
  grid-column: span 2 / span 2;
  display: none;

  @media (min-width: 1024px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
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

  display: flex;
  width: 334px;
  padding: 48px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 32px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(40px);
`

export const Line = styled.div`
  border: 1px solid #e6e6ff;
  margin-top: 16px;
  margin-bottom: 16px;
`

export const NavigationButtons = styled.div`
  display: flex;
  margin-top: 16px;
  gap: 8px;
`

export const BackButton = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  color: #66f;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  cursor: pointer;

  &:hover {
    transform: scale(0.99);
  }
`

export const NextButton = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex: 1 0 0;
  border-radius: 8px;
  background: #66f;
  font-family: Inter;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  cursor: pointer;
  border: none;

  &:hover {
    transform: scale(0.99);
  }

  &:disabled {
    background: #ececfb;
  }
`
