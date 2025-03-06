import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'
import { useAccount } from 'wagmi'
import { getAddress, isAddress } from '@ethersproject/address'

import settingIcon from 'assets/images/dex-v2/setting.svg'
import chainIcon from 'assets/images/dex-v2/chain.svg'
import SwapPair from './SwapPair'
import { ButtonPrimary } from '../../common'
import SwapDetails from './SwapDetails'
import useSwapping from 'state/dexV2/swap/useSwapping'
import { useSwapState } from 'state/dexV2/swap/useSwapState'
import { useSwapAssets } from 'state/dexV2/swap/useSwapAssets'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers from 'hooks/dex-v2/useNumbers'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useValidation, { SwapValidation } from 'state/dexV2/swap/useValidation'
import { WrapType } from 'lib/utils/balancer/wrapper'
import { SubgraphPoolBase } from '@ixswap1/dex-v2-sdk'
import SwapPreviewModal from './SwapPreviewModal'
import { useIsMounted } from 'hooks/dex-v2/useIsMounted'
import BalAlert from 'pages/DexV2/Pool/components/BalAlert'
import SwapSettingsPopover, { SwapSettingsContext } from 'pages/DexV2/common/popovers/SwapSettingsPopover'
import SwapRoute from './SwapRoute'

const SwapCard: React.FC = () => {
  const { inputAsset, outputAsset } = useSwapAssets()
  const { appNetworkConfig, isMismatchedNetwork } = useWeb3()
  const { nativeAsset } = useTokens()
  const isMounted = useIsMounted()

  const [isOpenSwapPreview, setOpenSwapPreview] = useState(false)
  const [exactIn, setExactIn] = useState(true)
  const [dismissedErrors, setDismissedErrors] = useState({
    highPriceImpact: false,
  })
  const {
    tokenInAddress,
    tokenOutAddress,
    tokenInAmount,
    tokenOutAmount,
    setTokenInAddress,
    setTokenOutAddress,
    setTokenInAmount,
    setTokenOutAmount,
    setInitialized,
  } = useSwapState()
  const swapping = useSwapping(
    exactIn,
    tokenInAddress,
    tokenInAmount,
    tokenOutAddress,
    tokenOutAmount,
    setTokenInAmount,
    setTokenOutAmount
  )

  const { errorMessage } = useValidation(tokenInAddress, tokenInAmount, tokenOutAddress, tokenOutAmount)
  const isHighPriceImpact = swapping.sor.validationErrors.highPriceImpact && !dismissedErrors.highPriceImpact
  const hasMismatchedNetwork = isMismatchedNetwork
  const hasAmountsError = !tokenInAmount || !tokenOutAmount
  const hasBalancerErrors = swapping.isBalancerSwap && isHighPriceImpact
  const swapDisabled =
    hasAmountsError || hasBalancerErrors || hasMismatchedNetwork || errorMessage !== SwapValidation.VALID

  const title =
    swapping.wrapType === WrapType.Wrap
      ? `Wrap ${swapping.tokenIn?.symbol}`
      : swapping.wrapType === WrapType.Unwrap
      ? `Unwrap ${swapping.tokenOut?.symbol}`
      : 'Swap'
  const pools: SubgraphPoolBase[] = swapping.sor.pools

  let error
  if (isMismatchedNetwork) {
    error = {
      header: 'Switch network',
      body: `Please switch to ${appNetworkConfig.name}`,
    }
  } else if (swapping.isBalancerSwap && !swapping.isLoading && swapping.sor.validationErrors.noSwaps) {
    error = {
      header: 'Not enough liquidity',
      body: 'Try swapping with a smaller amount or check back when liquidity for this pool has increased.',
    }
  } else if (swapping.isBalancerSwap && isHighPriceImpact) {
    error = {
      header: 'High price impact',
      body: 'This swap is significantly moving the market price.',
      label: 'accept',
    }
  } else {
    error = undefined
  }

  // METHODS
  function handleErrorButtonClick() {
    if (swapping.sor.validationErrors.highPriceImpact) {
      setDismissedErrors({ ...dismissedErrors, highPriceImpact: true })
    }
  }

  function isNativeAssetIdentifier(assetParam: string | undefined): boolean {
    return (
      assetParam?.toLowerCase() === nativeAsset.deeplinkId?.toLowerCase() ||
      assetParam?.toLowerCase() === nativeAsset.symbol?.toLowerCase()
    )
  }

  function getFirstValidAddress(assets: string[]): string | undefined {
    for (const asset of assets) {
      if (isNativeAssetIdentifier(asset)) {
        return nativeAsset.address
      }
      if (isAddress(asset)) {
        return getAddress(asset)
      }
    }
  }

  function populateInitialTokens(): void {
    const assetIn = getFirstValidAddress([
      '', // TODO: Router.currentRoute.value.params.assetIn
      inputAsset,
      appNetworkConfig.tokens.InitialSwapTokens.input,
    ])

    if (assetIn) {
      setTokenInAddress(assetIn)
    }
    const assetOut = getFirstValidAddress([
      '', // TODO: router.currentRoute.value.params.assetOut,
      outputAsset,
      appNetworkConfig.tokens.InitialSwapTokens.output,
    ])
    if (assetOut) {
      setTokenOutAddress(assetOut)
    }
    let assetInAmount = undefined // TODO: router.currentRoute.value.query?.inAmount as string;
    let assetOutAmount = undefined // TODO: router.currentRoute.value.query?.outAmount as string;
    if (assetInAmount) {
      setTokenInAmount(assetInAmount)
    }
    if (!assetInAmount && assetOutAmount) {
      setTokenOutAmount(assetOutAmount)
    }
  }

  function handlePreviewButton() {
    swapping.resetSubmissionError()
    setOpenSwapPreview(true)
  }

  function handlePreviewModalClose() {
    swapping.resetSubmissionError()
    setOpenSwapPreview(false)
  }

  useEffect(() => {
    populateInitialTokens()
    setInitialized(true)
  }, [])

  const isLoadingSwaps = swapping.isBalancerSwap ? swapping.isLoading : false
  const isLoading = isLoadingSwaps || !isMounted
  const loadingText = isLoading ? 'Fetching swap...' : 'Next'
  const showSwapRoute = swapping.isBalancerSwap

  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <Title>{title}</Title>

        <Flex alignItems="center">
          <Flex alignItems="center">
            <img src={chainIcon} alt="link" />
          </Flex>
          <HorizontalLine />
          <SwapSettingsPopover context={SwapSettingsContext.swap} isGasless={swapping.swapGasless} />
        </Flex>
      </Flex>

      <SwapPair
        exactIn={exactIn}
        swapLoading={swapping.isBalancerSwap ? swapping.isLoading : false}
        effectivePriceMessage={swapping.effectivePriceMessage}
        amountChange={swapping.handleAmountChange}
        setExactIn={setExactIn}
      />

      {error && tokenInAmount ? (
        <BalAlert
          className="p-3 mb-4"
          type="error"
          size="sm"
          title={error.header}
          description={error.body}
          block
          onActionClick={handleErrorButtonClick}
        />
      ) : null}

      {pools.length > 0 ? <SwapDetails pools={pools} swapping={swapping} /> : null}

      <Box>
        <ButtonPrimary disabled={!!swapDisabled} onClick={handlePreviewButton}>
          {loadingText}
        </ButtonPrimary>
      </Box>

      {showSwapRoute && swapping?.tokenIn && swapping?.tokenOut ? (
        <SwapRoute
          addressIn={swapping?.tokenIn?.address}
          addressOut={swapping?.tokenOut?.address}
          amountIn={swapping?.tokenInAmountInput}
          amountOut={swapping?.tokenOutAmountInput}
          pools={pools}
          sorReturn={swapping.sor.sorReturn}
        />
      ) : null}

      {isOpenSwapPreview ? <SwapPreviewModal swapping={swapping} onClose={handlePreviewModalClose} /> : null}
    </Container>
  )
}

export default SwapCard

const Container = styled.div`
  width: 480px;
  margin: 0 auto;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
  padding: 32px 36px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    padding: 24px 16px;
    margin-top: 48px;
  `};

  .p-3 {
    padding: 12px;
  }

  .mb-4 {
    margin-bottom: 16px;
  }
`

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  letter-spacing: -0.6px;
`

const PercentText = styled.div`
  color: #b8b8cc;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: -0.42px;
  margin-right: 4px;
`

const HorizontalLine = styled.div`
  border: 1px solid #e6e6ff;
  height: 18px;
  margin-right: 16px;
  margin-left: 16px;
`
