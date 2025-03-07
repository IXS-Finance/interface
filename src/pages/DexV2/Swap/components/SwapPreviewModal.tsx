import React, { useEffect, useMemo, useState } from 'react'
import Portal from '@reach/portal'
import styled from 'styled-components'
import { formatUnits } from '@ethersproject/units'
import { mapValues } from 'lodash'

import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'
import useTokenApprovalActions from 'hooks/dex-v2/approvals/useTokenApprovalActions'
import { UseSwapping } from 'state/dexV2/swap/useSwapping'
import { configService } from 'services/config/config.service'
import { TransactionActionInfo, TransactionActionState } from 'pages/DexV2/types/transactions'
import Loader from 'components/Loader'
import { useErrorMsg } from 'lib/utils/errors'
import { toast } from 'react-toastify'
import { ApprovalAction } from 'hooks/dex-v2/approvals/types'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import useNetwork from 'hooks/dex-v2/useNetwork'
import { SwapQuote } from 'state/dexV2/swap/types'
import { bnum, bnumZero } from 'lib/utils'
import { getWrapAction, WrapType } from 'lib/utils/balancer/wrapper'
import BalAlert from 'pages/DexV2/Pool/components/BalAlert'
import { Box, Flex } from 'rebass'
import Asset from 'pages/DexV2/common/Asset'
import BalCard from 'pages/DexV2/common/Card'
import { FiatCurrency } from 'constants/dexV2/currency'
import { ButtonPrimary } from 'pages/DexV2/common'
import ActionSteps from './ActionSteps'
import SwapRoute from './SwapRoute'

interface SwapSettingsModalProps {
  swapping: UseSwapping
  error?: any
  warning?: any
  onClose: () => void
}

const PRICE_UPDATE_THRESHOLD = 0.02

const SwapPreviewModal: React.FC<SwapSettingsModalProps> = ({ swapping, error, warning, onClose }) => {
  const { fNum, toFiat } = useNumbers()
  const { balanceFor, allowances } = useTokens()
  const { blockNumber, account, startConnectWithInjectedProvider } = useWeb3()
  const { slippage } = useUserSettings()
  const { networkConfig } = useNetwork()

  // Local state (replacing Vue refs)
  const [lastQuote, setLastQuote] = useState<SwapQuote | null>(swapping.isWrapUnwrapSwap ? null : swapping.getQuote())
  const [priceUpdated, setPriceUpdated] = useState(false)
  const [priceUpdateAccepted, setPriceUpdateAccepted] = useState(false)
  const [showSummaryInFiat, setShowSummaryInFiat] = useState(false)
  const [loadingApprovals, setLoadingApprovals] = useState(true)
  const [tokenApprovalActions, setTokenApprovalActions] = useState<TransactionActionInfo[]>([])

  // Inline computed values (without useMemo)
  const quote = swapping.getQuote()
  const slippageRatePercent = fNum(slippage, FNumFormats.percent)
  const addressIn = swapping.tokenIn.address
  const tokenInFiatValue = fNum(toFiat(swapping.tokenInAmountInput, swapping.tokenIn.address), FNumFormats.fiat)
  const tokenOutFiatValue = fNum(toFiat(swapping.tokenOutAmountInput, swapping.tokenOut.address), FNumFormats.fiat)
  const showSwapRoute = swapping.isBalancerSwap
  const zeroFee = showSummaryInFiat ? fNum('0', FNumFormats.fiat) : '0.0 ETH'
  const exceedsBalance =
    account && bnum(swapping.tokenInAmountInput).isGreaterThan(balanceFor(swapping.tokenInAddressInput))
  const disableSubmitButton = !!exceedsBalance || !!error || !!loadingApprovals
  let amountToApprove = swapping.tokenInAmountInput
  const summary = (() => {
    const summaryItems: Record<string, string> = {
      amountBeforeFees: '',
      swapFees: '',
      totalWithoutSlippage: '',
      totalWithSlippage: '',
    }

    const exactIn = swapping.exactIn
    const tokenIn = swapping.tokenIn
    const tokenOut = swapping.tokenOut
    const tokenInAmountInput = swapping.tokenInAmountInput
    const tokenOutAmountInput = swapping.tokenOutAmountInput

    if (swapping.isWrapUnwrapSwap) {
      summaryItems.amountBeforeFees = tokenOutAmountInput
      summaryItems.swapFees = '0'
      summaryItems.totalWithoutSlippage = tokenOutAmountInput
      summaryItems.totalWithSlippage = tokenOutAmountInput
    } else {
      if (exactIn) {
        summaryItems.amountBeforeFees = tokenOutAmountInput
        summaryItems.swapFees = formatUnits(quote.feeAmountOutToken, tokenOut.decimals)
        summaryItems.totalWithoutSlippage = bnum(summaryItems.amountBeforeFees).minus(summaryItems.swapFees).toString()
        summaryItems.totalWithSlippage = formatUnits(quote.minimumOutAmount, tokenOut.decimals)
      } else {
        summaryItems.amountBeforeFees = tokenInAmountInput
        summaryItems.swapFees = formatUnits(quote.feeAmountInToken, tokenIn.decimals)
        summaryItems.totalWithoutSlippage = bnum(summaryItems.amountBeforeFees).plus(summaryItems.swapFees).toString()
        summaryItems.totalWithSlippage = formatUnits(quote.maximumInAmount, tokenIn.decimals)
      }
    }
    amountToApprove = summaryItems.totalWithSlippage
    if (showSummaryInFiat) {
      return mapValues(
        summaryItems,
        (itemValue) => `${fNum(toFiat(itemValue, exactIn ? tokenOut.address : tokenIn.address), FNumFormats.fiat)}`
      )
    } else {
      return mapValues(
        summaryItems,
        (itemValue) =>
          `${fNum(itemValue, FNumFormats.token)} ${
            exactIn || swapping.isWrapUnwrapSwap ? tokenOut.symbol : tokenIn.symbol
          }`
      )
    }
  })()

  const labels = (() => {
    if (swapping.isWrap) {
      return {
        modalTitle: `Preview ${swapping.tokenIn.symbol} Wrap`,
        confirmSwap: `Confirm ${swapping.tokenIn.symbol} Wrap`,
        swapSummary: {
          title: `Summary`,
          swapFees: `Wrap fees`,
          totalBeforeFees: `Amount before fees`,
          totalAfterFees: `Total to receive`,
          totalWithSlippage: `Zero slippage to wrap ${swapping.tokenIn.symbol}`,
        },
      }
    } else if (swapping.isUnwrap) {
      return {
        modalTitle: `Preview ${swapping.tokenOut.symbol} Unwrap`,
        confirmSwap: `Confirm ${swapping.tokenOut.symbol} Unwrap`,
        swapSummary: {
          title: `Summary`,
          swapFees: `Unwrap fees`,
          totalBeforeFees: `Amount before fees`,
          totalAfterFees: `Total to receive`,
          totalWithSlippage: `Zero slippage to unwrap ${swapping.tokenOut.symbol}`,
        },
      }
    } else if (swapping.exactIn) {
      return {
        modalTitle: `Preview swap`,
        confirmSwap: `Confirm swap`,
        swapSummary: {
          title: `Swap from ${swapping.tokenIn.symbol} details`,
          swapFees: `Swap fees`,
          totalBeforeFees: `Total to receive before fees`,
          totalAfterFees: `Total expected after fees`,
          totalWithSlippage: `The least you’ll get at ${slippageRatePercent} slippage`,
        },
      }
    }
    // exact out
    return {
      modalTitle: `Preview swap`,
      confirmSwap: `Confirm swap`,
      swapSummary: {
        title: `Swap to ${swapping.tokenOut.symbol} details`,
        swapFees: `Swap fees`,
        totalBeforeFees: `Total to swap before fees`,
        totalAfterFees: `Total expected to swap after fees`,
        totalWithSlippage: `The most you’ll send at ${slippageRatePercent} slippage`,
      },
    }
  })()

  const { getTokenApprovalActions } = useTokenApprovalActions()
  const pools = swapping.sor.pools
  const showPriceUpdateError = priceUpdated && !priceUpdateAccepted
  const actions: TransactionActionInfo[] = [
    ...tokenApprovalActions,
    {
      label: labels.confirmSwap,
      loadingLabel: 'Confirm swap in wallet',
      confirmingLabel: 'Confirming',
      action: swap,
      stepTooltip: 'Finalize the transaction by submitting it for inclusion on the blockchain.',
    },
  ]

  console.log('actions', actions)
  // METHODS
  async function swap() {
    await swapping.swap(() => {
      swapping.resetAmounts()
      onClose()
    })
  }

  function confirmPriceUpdate() {
    setPriceUpdated(false)
    setPriceUpdateAccepted(true)
    setLastQuote(swapping.getQuote())
  }

  function handlePriceUpdate() {
    if (lastQuote) {
      const newQuote = swapping.getQuote()
      if (swapping.exactIn) {
        const lastQuoteMin = bnum(lastQuote.minimumOutAmount.toString())
        const newQuoteMin = bnum(newQuote.minimumOutAmount.toString())
        if (lastQuoteMin.eq(bnumZero)) {
          setPriceUpdated(!newQuoteMin.eq(bnumZero))
        } else {
          const priceDiff = lastQuoteMin.minus(newQuoteMin).abs().div(lastQuoteMin)
          setPriceUpdated(priceDiff.gt(PRICE_UPDATE_THRESHOLD))
        }
      } else {
        const lastQuoteMax = bnum(lastQuote.maximumInAmount.toString())
        const newQuoteMax = bnum(newQuote.maximumInAmount.toString())
        if (lastQuoteMax.eq(bnumZero)) {
          setPriceUpdated(!newQuoteMax.eq(bnumZero))
        } else {
          const priceDiff = lastQuoteMax.minus(newQuoteMax).abs().div(lastQuoteMax)
          setPriceUpdated(priceDiff.gt(PRICE_UPDATE_THRESHOLD))
        }
      }
      if (priceUpdated) {
        setPriceUpdateAccepted(false)
      }
    }
  }

  const tokenApprovalSpender =
    swapping.isWrap && !swapping.isNativeAssetSwap ? swapping.tokenOut.address : networkConfig.addresses.vault

  // Watcher: update price when blockNumber changes
  useEffect(() => {
    handlePriceUpdate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber])

  // Lifecycle: on mount, fetch token approval actions
  useEffect(() => {
    async function fetchTokenApprovalActions() {
      const actions = await getTokenApprovalActions({
        amountsToApprove: [
          {
            address: addressIn,
            amount: amountToApprove,
          },
        ],
        spender: tokenApprovalSpender,
        actionType: ApprovalAction.Swapping,
        forceMax: false,
      })
      setTokenApprovalActions(actions)
      setLoadingApprovals(false)
    }

    fetchTokenApprovalActions()
  }, [addressIn, swapping.tokenInAmountInput, tokenApprovalSpender, JSON.stringify(allowances)])

  return (
    <Portal>
      <CenteredFixed width="100vw" height="100vh">
        <ModalContent>
          <HeaderModal>
            <TitleWrapper>
              <Title>{labels.modalTitle}</Title>
              <CloseButton onClick={onClose}>
                <CloseIcon />
              </CloseButton>
            </TitleWrapper>
          </HeaderModal>

          <BodyModal>
            <div>
              <BalCard noPad className="overflow-auto relative mb-6">
                {error ? (
                  <BalAlert
                    className="p-3 mb-2"
                    type="error"
                    size="sm"
                    title={error.header}
                    description={error.body}
                    actionLabel={error.label}
                    block
                  />
                ) : null}
                {!error && warning && (
                  <BalAlert
                    className="p-3 mb-2"
                    type="warning"
                    size="sm"
                    title={warning.header}
                    description={warning.body}
                    block
                  />
                )}
                <Box
                  p={3}
                  width="100%" // equivalent to w-full
                  fontSize={1} // adjust this value based on your theme (text-sm)
                  bg="#f8fafc" // light-mode background
                  css={{ borderBottom: 'solid 1px #e2e8f0' }} // light-mode text color
                >
                  {`Effective price: ${
                    swapping.exactIn ? swapping.effectivePriceMessage.tokenIn : swapping.effectivePriceMessage.tokenOut
                  }`}
                </Box>

                <Box css={{ position: 'relative' }}>
                  {exceedsBalance && (
                    <BalAlert
                      className="p-3"
                      type="error"
                      size="sm"
                      title={`Exceeds wallet balance ${fNum(
                        balanceFor(swapping.tokenInAddressInput),
                        FNumFormats.token
                      )} ${swapping.tokenIn.symbol}`}
                      block
                      square
                    />
                  )}

                  <Box
                    css={{
                      position: 'relative',
                      padding: '12px',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <Flex alignItems="center">
                      <Box mr="12px">
                        <Asset address={swapping.tokenIn.address} size={36} />
                      </Box>
                      <div>
                        <div>
                          {fNum(swapping.tokenInAmountInput, FNumFormats.token)}
                          {swapping.tokenIn.symbol}
                        </div>
                        <div>{tokenInFiatValue}</div>
                      </div>
                    </Flex>
                  </Box>

                  <ArrowDown>
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                  </ArrowDown>

                  <Box
                    css={{
                      padding: '12px',
                      borderBottom: '1px solid #e2e8f0',
                    }}
                  >
                    <Flex alignItems="center">
                      <Box mr="12px">
                        <Asset address={swapping.tokenOut.address} size={36} />
                      </Box>
                      <div>
                        <div>
                          {fNum(swapping.tokenOutAmountInput, FNumFormats.token)}
                          {swapping.tokenOut.symbol}
                        </div>
                        <div>
                          {tokenInFiatValue}{' '}
                          {swapping.isBalancerSwap || swapping.isWrapUnwrapSwap ? (
                            <span>
                              / Price impact:
                              {fNum(swapping.sor.priceImpact, FNumFormats.percent)}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </Flex>
                  </Box>
                </Box>
              </BalCard>

              <BalCard noPad shadow="none" className="mb-3">
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  p="12px"
                  width="100%"
                  css={{ borderBottom: '1px solid #e2e8f0' }}
                >
                  <Box fontWeight={600}>{labels.swapSummary.title}</Box>
                  <Box
                    display="flex" // Equivalent to 'flex'
                    fontSize="12px" // Tailwind 'text-xs' is usually 0.75rem (12px)
                    sx={{
                      // This applies a left border to every child element except the first,
                      // simulating Tailwind's 'divide-x'
                      '& > * + *': {
                        borderLeft: '1px solid',
                        borderColor: 'gray.200',
                      },
                    }}
                    css={{ textTransform: 'uppercase' }}
                  >
                    <Flex>
                      <Box
                        pr={2} // padding-right, equivalent to Tailwind's pr-2
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 500, // Tailwind's font-medium
                          color: !showSummaryInFiat ? 'blue.600' : 'inherit', // text-blue-600 when not showing fiat
                        }}
                        onClick={() => setShowSummaryInFiat(false)}
                      >
                        Token
                      </Box>
                      <Box
                        pl={2} // padding-left, equivalent to Tailwind's pl-2
                        sx={{
                          cursor: 'pointer',
                          fontWeight: 500, // Tailwind's font-medium
                          textTransform: 'uppercase', // uppercase text
                          color: showSummaryInFiat ? 'blue.600' : 'inherit', // text-blue-600 when showing fiat
                        }}
                        onClick={() => setShowSummaryInFiat(true)}
                      >
                        {FiatCurrency.usd}
                      </Box>
                    </Flex>
                  </Box>
                </Flex>

                <Box
                  p={3} // p-3
                  width="100%" // w-full
                  fontSize={1} // text-sm (adjust based on your theme)
                  bg="white" // light mode background
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    fontWeight="medium" // font-medium
                    mb={2}
                    className="summary-item-row"
                  >
                    <Box width={256}>
                      {' '}
                      {/* w-64: 16rem equals 256px */}
                      {labels.swapSummary.totalAfterFees}
                    </Box>
                    <Box
                      // replicates v-html="summary.totalWithoutSlippage"
                      dangerouslySetInnerHTML={{ __html: summary.totalWithoutSlippage }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    color="secondary" // text-secondary (ensure this exists in your theme)
                    className="summary-item-row"
                  >
                    <Box width={256}>{labels.swapSummary.totalWithSlippage}</Box>
                    <Box
                      // replicate v-html based on condition
                      dangerouslySetInnerHTML={{
                        __html: swapping.isWrapUnwrapSwap ? '' : summary.totalWithSlippage,
                      }}
                    />
                  </Box>
                </Box>
              </BalCard>

              {showPriceUpdateError && (
                <BalAlert
                  className="p-3 mb-4"
                  type="error"
                  size="md"
                  title="Price updated"
                  description={`The swap price has updated by more than ${fNum(
                    PRICE_UPDATE_THRESHOLD,
                    FNumFormats.percent
                  )}`}
                  actionLabel="Accept"
                  block
                  onActionClick={confirmPriceUpdate}
                />
              )}

              {!account ? (
                <ButtonPrimary onClick={startConnectWithInjectedProvider}>Connect Wallet</ButtonPrimary>
              ) : (
                <ActionSteps
                  requiredActions={actions}
                  primaryActionType="swap"
                  disabled={disableSubmitButton || showPriceUpdateError}
                />
              )}

              {swapping.submissionError != null && (
                <BalAlert
                  className="p-3 mt-4"
                  type="error"
                  size="md"
                  title="Swap submission error"
                  description={swapping.submissionError}
                  block
                  actionLabel="Dismiss"
                  onActionClick={swapping.resetSubmissionError}
                />
              )}
            </div>
            {showSwapRoute ? (
              <SwapRoute
                addressIn={swapping?.tokenIn?.address}
                addressOut={swapping?.tokenOut?.address}
                amountIn={swapping?.tokenInAmountInput}
                amountOut={swapping?.tokenOutAmountInput}
                pools={pools}
                sorReturn={swapping.sor.sorReturn}
              />
            ) : null}
          </BodyModal>
        </ModalContent>
      </CenteredFixed>
    </Portal>
  )
}

export default SwapPreviewModal

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 480px;

  .p3 {
    padding: 12px;
  }

  .mb-2 {
    margin-bottom: 16px;
  }

  .overflow-auto {
    overflow: auto;
  }

  .relative {
    position: relative;
  }

  .mb-6 {
    margin-bottom: 24px;
  }

  .mt-4 {
    margin-top: 16px;
  }
`

const HeaderModal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  padding-top: 32px;
  padding-left: 32px;
  padding-right: 32px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`

const BodyModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  padding-left: 32px;
  padding-right: 32px;
  padding-bottom: 32px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`

const CloseButton = styled.div`
  cursor: pointer;
  color: rgba(41, 41, 51, 0.5);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
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

export const Button = styled.button`
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

const ArrowDown = styled.div`
  position: absolute;
  right: 0;
  border-radius: 9999px; /* rounded-full */
  border: 1px solid #f3f4f6; /* border-gray-100 */
  display: flex;
  align-items: center;
  height: 2rem; /* h-8 */
  width: 2rem; /* w-8 */
  justify-content: center;
  background-color: #ffffff; /* bg-white */
  margin-right: 0.75rem; /* mr-3 */
  transform: translateY(-50%);
`
