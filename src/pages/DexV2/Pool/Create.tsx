import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import _get from 'lodash/get'
import { Address } from 'viem'

import ChooseWeights from './Steps/ChooseWeights'
import SetPoolFees from './Steps/SetPoolFees'
import InitialLiquidity from './Steps/InitialLiquidity'
import config from 'lib/config'
import { useWeb3React } from 'hooks/useWeb3React'
import PreviewPool from './Steps/PreviewPool'
import { useDispatch } from 'react-redux'
import { useTokensState } from 'state/dexV2/tokens/hooks'
import PoolSummary from './components/PoolSummary'
import TokenPrices from './components/TokenPrices'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import UnknownTokenPriceModal from '../common/modals/UnknownTokenPriceModal'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { StepState } from 'types'
import VerticleSteps from './components/VerticleSteps'
import useWeb3 from 'hooks/dex-v2/useWeb3'

const SimilarPool = () => {
  return <div>SimilarPool</div>
}
const Create: React.FC = () => {
  const { chainId, account } = useWeb3React()
  const { activeStep, similarPools, tokensList, seedTokens, hasRestoredFromSavedState, resetPoolCreationState } =
    usePoolCreation()
  const { tokens, priceFor, getToken, injectTokens, injectSpenders } = useTokens()
  const dispatch = useDispatch()
  const networkConfig = config[chainId]
  const { appNetworkConfig, isWalletReady } = useWeb3()

  const [isUnknownTokenModalVisible, setIsUnknownTokenModalVisible] = useState(false)
  const [isLoading, setLoading] = useState(true)

  const validTokens = tokensList.filter((t: string) => t !== '')
  const doSimilarPoolsExist = similarPools.length > 0
  const hasUnknownToken = validTokens.some((t: any) => priceFor(t) === 0)
  const name = _get(networkConfig, 'name', '')

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
    // {
    //   tooltip: 'Similar pools',
    //   state: StepState.Warning,
    //   id: 2,
    //   isVisible: doSimilarPoolsExist && activeStep === 2,
    //   component: SimilarPool,
    // },
    {
      tooltip: 'Set initial liquidity',
      state: getStepState(2),
      id: 2,
      isVisible: true,
      component: InitialLiquidity,
    },
    {
      tooltip: 'Confirm pool creation',
      state: getStepState(3),
      id: 3,
      isVisible: true,
      component: PreviewPool,
    },
  ]
  const currentStep = steps[activeStep]
  const CurrentStepComponent = steps[activeStep].component

  function handleUnknownModalClose() {
    setIsUnknownTokenModalVisible(false)
  }

  function showUnknownTokenModal() {
    setIsUnknownTokenModalVisible(true)
  }

  async function injectUnknownPoolTokens() {
    const uninjectedTokens = seedTokens
      .filter((seedToken) => getToken(seedToken.tokenAddress) === undefined)
      .map((seedToken) => seedToken.tokenAddress)
      .filter((token) => token !== '')
    await injectTokens(uninjectedTokens)
  }

  useEffect(() => {
    if (hasUnknownToken && !hasRestoredFromSavedState) {
      showUnknownTokenModal()
    }
  }, [activeStep])

  useEffect(() => {
    injectSpenders([appNetworkConfig.addresses.vault])
  }, [isWalletReady])
  return (
    <WidthFull>
      <LayoutContainer>
        <LeftContent>
          <VerticleSteps steps={steps} activeStep={activeStep} />
        </LeftContent>
        <CenterContent>
          <Card>
            <NetworkText>{name}</NetworkText>
            <Title>{steps[activeStep].tooltip}</Title>
            {steps[activeStep].isVisible ? <CurrentStepComponent /> : null}
          </Card>
        </CenterContent>

        {validTokens.length > 0 ? (
          <RightContent>
            <PoolSummary />
            <TokenPrices toggleUnknownPriceModal={showUnknownTokenModal} />
          </RightContent>
        ) : null}
      </LayoutContainer>

      <UnknownTokenPriceModal visible={isUnknownTokenModalVisible} onClose={handleUnknownModalClose} />
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
