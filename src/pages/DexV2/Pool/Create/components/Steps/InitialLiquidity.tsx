import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'

import { Box, Flex } from 'rebass'
import Switch from '../../../components/Switch'
import TokenInput from '../TokenInput'
import { isGreaterThan } from 'lib/utils/validations'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { setPoolCreationState, setTokenAmount } from 'state/dexV2/poolCreation'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers from 'hooks/dex-v2/useNumbers'
import { bnum, isSameAddress } from 'lib/utils'
import BalCard from 'pages/DexV2/common/Card'
import BalStack from 'pages/DexV2/common/BalStack'
import { configService } from 'services/config/config.service'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'

interface SetPoolFeesProps {}

const InitialLiquidity: React.FC<SetPoolFeesProps> = () => {
  const { balanceFor, priceFor, nativeAsset, wrappedNativeAsset, balanceQueryLoading } = useTokens()
  const {
    seedTokens,
    manuallySetToken,
    autoOptimiseBalances,
    tokensList,
    scaledLiquidity,
    getOptimisedLiquidity,
    proceed,
    goBack,
    useNativeAsset,
    setAmountsToMaxBalances,
    setPoolCreation,
    updateManuallySetToken,
  } = usePoolCreation()
  const { fNum } = useNumbers()
  const dispatch = useDispatch()

  const networkName = configService.network.name
  const [isOptimised, setIsOptimised] = useState(false)
  const tokenAddresses = [...seedTokens.map((token) => token.tokenAddress)]
  const optimisedLiquidity = getOptimisedLiquidity()

  const areAmountsMaxed = seedTokens.every((t) => bnum(t.amount).eq(balanceFor(t.tokenAddress)))

  const handleAmountChange = (idx: number, amount: string) => {
    dispatch(setTokenAmount({ id: idx, amount }))
  }

  function checkLiquidityScaling() {
    if (!autoOptimiseBalances) return

    scaleLiquidity()
  }

  function toggleAutoOptimise() {
    setPoolCreation({ autoOptimiseBalances: !autoOptimiseBalances })
    checkLiquidityScaling()
  }

  function handleMax() {
    setAmountsToMaxBalances()
    setIsOptimised(false)
  }

  function optimiseLiquidity(force = false) {
    if (manuallySetToken && !force) return
    setIsOptimised(true)

    if (Object.keys(optimisedLiquidity).length === 0) return

    seedTokens.forEach((token, idx) => {
      dispatch(setTokenAmount({ id: idx, amount: optimisedLiquidity[token.tokenAddress].balanceRequired }))
    })
  }

  function scaleLiquidity() {
    if (!autoOptimiseBalances || !manuallySetToken) return

    seedTokens.forEach((token, idx) => {
      if (token.tokenAddress !== manuallySetToken) {
        dispatch(setTokenAmount({ id: idx, amount: scaledLiquidity[token.tokenAddress].balanceRequired }))
      }
    })
  }

  function saveAndProcessed() {
    proceed()
  }

  // If native asset conditions are met, update the token addresses accordingly.
  const setNativeAssetIfRequired = () => {
    const nativeAssetBalance = balanceFor(nativeAsset.address)
    const wrappedNativeAssetBalance = balanceFor(wrappedNativeAsset.address)
    if (useNativeAsset || bnum(nativeAssetBalance).gt(wrappedNativeAssetBalance)) {
      dispatch(
        setPoolCreationState({
          useNativeAsset: true,
        })
      )
    }
  }

  // Watch dynamicDataLoading; when pricing data becomes available, update values.
  useEffect(() => {
    if (seedTokens.length > 0 && !balanceQueryLoading) {
      setNativeAssetIfRequired()
      optimiseLiquidity(true)
      scaleLiquidity()
    }
  }, [balanceQueryLoading, seedTokens.length, JSON.stringify(optimisedLiquidity)])

  useEffect(() => {
    checkLiquidityScaling()
  }, [JSON.stringify(seedTokens), manuallySetToken])

  return (
    <BalCard shadow="xl" noBorder>
      <BalStack vertical spacing="sm">
        <Box color="#b8b8d2" fontSize="14px" fontWeight={500}>
          {networkName}
        </Box>
        <Box color="rgba(41, 41, 51, 0.9)" fontSize="20px" fontWeight={600}>
          Set initial liquidity
        </Box>

        {seedTokens.length === 0 && balanceQueryLoading ? (
          <>
            <LoadingBlock className="h-30" />
            <LoadingBlock className="h-30" />
          </>
        ) : (
          <>
            {seedTokens.map((token, i) => {
              return (
                <TokenInput
                  key={`tokenweight-${token.id}`}
                  name={`initial-token-${token.tokenAddress}`}
                  weight={token.weight}
                  address={token.tokenAddress}
                  amount={token.amount}
                  rules={[]}
                  updateAmount={(amount: any) => {
                    updateManuallySetToken(token.tokenAddress)
                    handleAmountChange(i, amount)
                  }}
                />
              )
            })}
          </>
        )}

        <Flex alignItems="center" style={{ gap: 8 }} marginTop={16}>
          <Switch checked={autoOptimiseBalances} onChange={toggleAutoOptimise} />
          <SwitchText>Auto optimize liquidity</SwitchText>
        </Flex>

        <SummaryContainer>
          <SummaryItem>
            <div>Total</div>
            <div>$0.00</div>
          </SummaryItem>

          <SummaryItem>
            <div>Available: $0.00 {areAmountsMaxed ? <Maxed>Maxed</Maxed> : <Max onClick={handleMax}>Max</Max>}</div>
            {isOptimised ? (
              <Optimized>Optimized</Optimized>
            ) : (
              <Optimize onClick={() => optimiseLiquidity(true)}>Optimize</Optimize>
            )}
          </SummaryItem>
        </SummaryContainer>

        <NavigationButtons>
          <BackButton onClick={() => goBack()}>Back</BackButton>
          <NextButton onClick={() => saveAndProcessed()}>Next</NextButton>
        </NavigationButtons>
      </BalStack>
    </BalCard>
  )
}

export default InitialLiquidity

const NavigationButtons = styled.div`
  display: flex;
  margin-top: 16px;
  gap: 8px;
`

const BackButton = styled.button`
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

const NextButton = styled.button`
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

const SwitchText = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const SummaryContainer = styled.div`
  margin-top: 16px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  padding: 16px;
  flex-direction: column;
  gap: 8px;
  align-self: stretch;
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
`

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`

const Optimized = styled.div`
  color: #b8b8d2;
`

const Optimize = styled.div`
  color: #6666ff;
  cursor: pointer;
`

const Max = styled.span`
  color: #6666ff;
  cursor: pointer;
`

const Maxed = styled.span`
  color: #b8b8d2;
`
