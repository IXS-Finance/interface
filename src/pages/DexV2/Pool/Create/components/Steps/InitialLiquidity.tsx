import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { useDispatch } from 'react-redux'
import { Box } from 'rebass'

import TokenInput from '../TokenInput'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { setPoolCreationState, setTokenAmount } from 'state/dexV2/poolCreation'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { bnum } from 'lib/utils'
import BalCard from 'pages/DexV2/common/Card'
import BalStack from 'pages/DexV2/common/BalStack'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'

interface SetPoolFeesProps {}

const InitialLiquidity: React.FC<SetPoolFeesProps> = () => {
  const { balanceFor, nativeAsset, wrappedNativeAsset, balanceQueryLoading } = useTokens()
  const { fNum } = useNumbers()
  const {
    seedTokens,
    totalLiquidity,
    currentLiquidity,
    manuallySetToken,
    autoOptimiseBalances,
    scaledLiquidity,
    getOptimisedLiquidity,
    proceed,
    goBack,
    useNativeAsset,
    updateManuallySetToken,
    clearAmounts,
  } = usePoolCreation()
  const dispatch = useDispatch()

  const optimisedLiquidity = getOptimisedLiquidity()
  const tokenAddresses = [...seedTokens.map((token) => token.tokenAddress)]

  const isExceedingWalletBalance = useMemo(() => {
    return tokenAddresses.some((t, i) => bnum(seedTokens[i].amount).gt(balanceFor(t)))
  }, [JSON.stringify(seedTokens)])
  const hasZeroAmount = useMemo(() => {
    return seedTokens.some(
      (seedToken) => bnum(seedToken.amount).eq(0) || seedToken.amount === '' || seedToken.amount === 'NaN'
    )
  }, [JSON.stringify(seedTokens)])

  function checkLiquidityScaling() {
    if (!autoOptimiseBalances) return

    scaleLiquidity()
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

  function setAmount(index: number, value: string, address: string) {
    updateManuallySetToken(address)
    dispatch(setTokenAmount({ id: index, amount: value }))

    if (!value) {
      clearAmounts()
    }
  }

  // Watch dynamicDataLoading; when pricing data becomes available, update values.
  useEffect(() => {
    if (seedTokens.length > 0 && !balanceQueryLoading) {
      setNativeAssetIfRequired()
    }
  }, [balanceQueryLoading, seedTokens.length, JSON.stringify(optimisedLiquidity)])

  useEffect(() => {
    checkLiquidityScaling()
  }, [JSON.stringify(seedTokens), manuallySetToken])

  return (
    <BalCard shadow="xl" noBorder>
      <BalStack vertical spacing="sm">
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
                  updateAmount={(value: string) => setAmount(i, value, token.tokenAddress)}
                />
              )
            })}
          </>
        )}

        <SummaryContainer>
          <SummaryItem>
            <div>Total</div>
            <div>{fNum(currentLiquidity.toString(), FNumFormats.fiat)}</div>
          </SummaryItem>

          <SummaryItem>
            <div>Available: {fNum(totalLiquidity.toString(), FNumFormats.fiat)}</div>
            <Optimized>Optimized</Optimized>
          </SummaryItem>
        </SummaryContainer>

        <NavigationButtons>
          <BackButton onClick={() => goBack()}>Back</BackButton>
          <NextButton disabled={isExceedingWalletBalance || hasZeroAmount} onClick={() => saveAndProcessed()}>
            Next
          </NextButton>
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
