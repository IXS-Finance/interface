import React, { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { useAccount } from 'wagmi'
import { getAddress, isAddress } from '@ethersproject/address'

import settingIcon from 'assets/images/dex-v2/setting.svg'
import chainIcon from 'assets/images/dex-v2/chain.svg'
import SwapPair from './SwapPair'
import { ButtonPrimary } from '../../common'
import SwapSettingsModal from './SwapSettingsModal'
import SwapDetails from './SwapDetails'
import useSwapping from 'state/dexV2/swap/useSwapping'
import { useSwapState } from 'state/dexV2/swap/useSwapState'
import { useSwapAssets } from 'state/dexV2/swap/useSwapAssets'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers from 'hooks/dex-v2/useNumbers'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useValidation from 'state/dexV2/swap/useValidation'
import { WrapType } from 'lib/utils/balancer/wrapper'
import { SubgraphPoolBase } from '@ixswap1/dex-v2-sdk'
import SwapPreviewModal from './SwapPreviewModal'
import { useIsMounted } from 'hooks/dex-v2/useIsMounted'
import BalAlert from 'pages/DexV2/Pool/components/BalAlert'

const SwapCard: React.FC = () => {
  const { inputAsset, outputAsset } = useSwapAssets()
  const { nativeAsset } = useTokens()
  const { fNum } = useNumbers()
  const { account, appNetworkConfig, isMismatchedNetwork } = useWeb3()
  const isMounted = useIsMounted()

  const [isOpenSwapSettings, setOpenSwapSettings] = useState(false)
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
  const swapDisabled = hasAmountsError || hasBalancerErrors || hasMismatchedNetwork

  const title = useMemo(() => {
    if (swapping.wrapType === WrapType.Wrap) {
      return `Wrap ${swapping.tokenIn?.symbol}`
    }
    if (swapping.wrapType === WrapType.Unwrap) {
      return `Unwrap ${swapping.tokenOut?.symbol}`
    }
    return 'Swap'
  }, [swapping.wrapType, swapping.tokenIn?.symbol, swapping.tokenOut?.symbol])
  const pools: SubgraphPoolBase[] = swapping.sor.pools
  console.log('pools', pools)
  const error = useMemo(() => {
    if (isMismatchedNetwork) {
      return {
        header: 'switchNetwork',
        body: 'networkMismatch appNetworkConfig.name',
      }
    }
    if (swapping.isBalancerSwap && !swapping.isLoading) {
      if (swapping.sor.validationErrors.noSwaps) {
        return {
          header: 'insufficientLiquidity',
          body: 'insufficientLiquidityDetailed',
        }
      }
    }
    if (swapping.isBalancerSwap) {
      if (isHighPriceImpact) {
        return {
          header: 'highPriceImpact',
          body: 'highPriceImpactDetailed',
          label: 'accept',
        }
      }
    }
    return undefined
  }, [isMismatchedNetwork, swapping.isBalancerSwap, swapping.isLoading, isHighPriceImpact])

  const isLoadingSwaps = swapping.isBalancerSwap ? swapping.isLoading : false
  const isLoading = isLoadingSwaps || !isMounted
  const loadingText = isLoading ? 'Fetching swap...' : undefined

  // METHODS
  function handleErrorButtonClick() {
    if (swapping.sor.validationErrors.highPriceImpact) {
      // dismissedErrors.highPriceImpact = true; // TODO: Move to global state
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
    // modalSwapPreviewIsOpen.value = true; TODO: Review UX
  }

  function handlePreviewModalClose() {
    swapping.resetSubmissionError()
    // modalSwapPreviewIsOpen.value = false;  TODO: Review UX
  }

  async function swap() {
    return swapping.swap(() => {
      swapping.resetAmounts()
      // emit('close');
    })
  }

  useEffect(() => {
    populateInitialTokens()
    setInitialized(true)
  }, [])

  return (
    <Container>
      <Flex justifyContent="space-between" alignItems="center">
        <Title>Swap</Title>

        <Flex alignItems="center">
          <Flex alignItems="center">
            <img src={chainIcon} alt="Settings" />
          </Flex>
          <HorizontalLine />
          <PercentText>0.05%</PercentText>
          <Flex alignItems="center" css={{ cursor: 'pointer' }} onClick={() => setOpenSwapSettings(true)}>
            <img src={settingIcon} alt="Settings" />
          </Flex>
        </Flex>
      </Flex>

      <SwapPair
        exactIn={exactIn}
        swapLoading={swapping.isBalancerSwap ? swapping.isLoading : false}
        effectivePriceMessage={swapping.effectivePriceMessage}
        amountChange={swapping.handleAmountChange}
        setExactIn={setExactIn}
      />

      <SwapDetails swapping={swapping} />

      {error ? <BalAlert
        className="p-3 mb-4"
        type="error"
        size="sm"
        title={error.header}
        description={error.body}
        block
        onActionClick={handleErrorButtonClick}
      /> : null}

      {/* {warning ? <BalAlert
        className="p-3 mb-4"
        type="warning"
        size="sm"
        title="warning.header"
        description="warning.body"
        block
      /> : null} */}


      <div>
        {account ? (
          <ButtonPrimary disabled={swapDisabled} onClick={() => setOpenSwapPreview(true)}>
            {loadingText ? 'Fetching swap' : 'Next'}
          </ButtonPrimary>
        ) : (
          <ButtonPrimary>Connect Wallet</ButtonPrimary>
        )}
      </div>

      {isOpenSwapSettings ? <SwapSettingsModal onClose={() => setOpenSwapSettings(false)} /> : null}
      {isOpenSwapPreview ? <SwapPreviewModal swapping={swapping} onClose={() => setOpenSwapPreview(false)} /> : null}
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
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 16px;

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
