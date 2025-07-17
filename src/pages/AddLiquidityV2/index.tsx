import React, { useCallback, useContext, useMemo, useState } from 'react'
import { ReactComponent as Plus } from '../../assets/images/newAdd.svg'
import ReactGA from 'react-ga'
import { RouteComponentProps } from 'react-router-dom'
import { Box, Text } from 'rebass'
import { ThemeContext } from 'styled-components'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { t, Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, WETH9 } from '@ixswap1/sdk-core'
import { useConnectModal } from '@rainbow-me/rainbowkit'

import UnsupportedCurrencyFooter from 'components/swap/UnsupportedCurrencyFooter'
import { ConfirmationModalContent } from 'components/TransactionConfirmationModal/ConfirmationModalContent'
import { setPoolTransactionHash, useAddLiquidity, useMitigationEnabled } from 'state/pool/hooks'
import { routes } from 'utils/routes'

import { NewApproveButton, PinnedContentButton } from '../../components/Button'
import { AutoColumn, ColumnCenter } from '../../components/Column'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { AddRemoveTabs } from '../../components/NavigationTabs'
import { FixedHeightRow, MinimalPositionCard } from '../../components/PositionCard/MinimalPositionCard'
import { ButtonRow, RowFixed } from '../../components/Row'
import TransactionConfirmationModal from '../../components/TransactionConfirmationModal'
import { ZERO_PERCENT } from '../../constants/misc'
import { ApprovalState, useAllowanceV2 } from '../../hooks/useApproveCallback'
import { useLiquidityRouterContract } from '../../hooks/useContract'
import { useIsSwapUnsupported } from '../../hooks/useIsSwapUnsupported'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { PairState } from '../../hooks/useV2Pairs'
import { useWeb3React } from 'hooks/useWeb3React'
import { useWalletModalToggle } from '../../state/application/hooks'
import { Field } from '../../state/mint/actions'
import { useDerivedMintInfo, useMintActionHandlers, useMintState } from '../../state/mint/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { useAccreditedToken, useIsExpertMode, useUserSlippageToleranceWithDefault } from '../../state/user/hooks'
import { ModalBlurWrapper, ModalNewWrapper, TYPE } from '../../theme'
import { calculateGasMargin } from '../../utils/calculateGasMargin'
import { calculateSlippageAmount } from '../../utils/calculateSlippageAmount'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import AppBody from '../AppBody'
import { Dots } from '../Pool/styleds'
// import { MitigationToggle } from './MitigationToggle'
import { ModalBottom } from './ModalBottom'
import { ModalHeader } from './ModalHeader'
import { PricesAndPoolShare } from './PricesAndPoolShare'
import { SecToSecWarning } from './SecToSecWarning'
import { ToggleableBody } from './styleds'
import { Tip } from './Tip'
import { useHandleCurrencySelect } from './useHandleCurrencySelect'
import { ReactComponent as ExternalIcon } from '../../assets/images/rightcheck.svg'
import styled from 'styled-components/macro'
import { isMobile } from 'react-device-detect'
import { chainIdToNetworkName } from 'utils/chains'
import { TGE_CHAINS_WITH_SWAP } from 'constants/addresses'

const DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE = new Percent(50, 10_000)

const Title = styled(Text)`
  font-weight: 600;
  font-size: 13px;
  line-height: 24px;
  text-transform: capitalize;
  color: ${({ theme }) => theme.text12};
`

const plusIconStyle = {
  width: '50px',
  height: '50px',
  zIndex: '1',
  marginTop: '-27px',
  marginBottom: '-50px',
}

export default function AddLiquidity({
  match: {
    params: { currencyIdA, currencyIdB },
  },
  history,
}: RouteComponentProps<{ currencyIdA?: string; currencyIdB?: string }>) {
  const { account, chainId, provider: library } = useWeb3React()
  const theme = useContext(ThemeContext)
  const addLiquidity = useAddLiquidity()
  const { openConnectModal } = useConnectModal()

  const currencyA = useAccreditedToken({ currencyId: currencyIdA }) as any
  const currencyB = useAccreditedToken({ currencyId: currencyIdB }) as any
  const [enableMitigation, setEnableMitigation] = useState<boolean>(false)
  const disableToggleMitigation = useMemo(() => {
    if ((currencyA as any)?.isSecToken || (currencyB as any)?.isSecToken) {
      setEnableMitigation(true)
      return true
    } else {
      setEnableMitigation(false)
      return false
    }
  }, [currencyA, currencyB])

  const oneCurrencyIsWETH = Boolean(
    chainId &&
      WETH9[chainId] &&
      ((currencyA && currencyA.equals(WETH9[chainId])) || (currencyB && currencyB.equals(WETH9[chainId])))
  )

  const toggleWalletModal = useWalletModalToggle() // toggle wallet when disconnected

  const expertMode = useIsExpertMode()

  // mint state
  const { independentField, typedValue, otherTypedValue } = useMintState()
  const {
    dependentField,
    currencies,
    pair,
    pairState,
    currencyBalances,
    parsedAmounts,
    price,
    noLiquidity,
    liquidityMinted,
    poolTokenPercentage,
    error,
    areBothSecTokens,
  } = useDerivedMintInfo(currencyA ?? undefined, currencyB ?? undefined)
  const { onFieldAInput, onFieldBInput } = useMintActionHandlers(noLiquidity)
  const setCurrentPoolTransctionHash = setPoolTransactionHash()
  const isValid = !error
  const mitigationEnabled = useMitigationEnabled(pair?.liquidityToken?.address)
  // modal and loading
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [isOpenConnectWallet, setOpenConnectWallet] = useState(false)
  const toggleMitigation = useCallback(() => {
    setEnableMitigation(!enableMitigation)
  }, [enableMitigation, setEnableMitigation])
  // txn values
  const deadline = useTransactionDeadline() // custom from users settings
  const allowedSlippage = useUserSlippageToleranceWithDefault(DEFAULT_ADD_V2_SLIPPAGE_TOLERANCE) // custom from users
  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = {
    [independentField]: typedValue,
    [dependentField]: noLiquidity ? otherTypedValue : parsedAmounts[dependentField]?.toSignificant(6) ?? '',
  }

  // get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmountSpend(currencyBalances[field]),
      }
    },
    {}
  )

  const atMaxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = [Field.CURRENCY_A, Field.CURRENCY_B].reduce(
    (accumulator, field) => {
      return {
        ...accumulator,
        [field]: maxAmounts[field]?.equalTo(parsedAmounts[field] ?? '0'),
      }
    },
    {}
  )

  const router = useLiquidityRouterContract()

  // check whether the user has approved the router on the tokens
  const amountToApproveA = parsedAmounts[Field.CURRENCY_A]
  const amountToApproveB = parsedAmounts[Field.CURRENCY_B]
  const tokenAddressA = amountToApproveA?.currency?.isToken ? amountToApproveA.currency.address : undefined
  const tokenAddressB = amountToApproveB?.currency?.isToken ? amountToApproveB.currency.address : undefined
  const [approvalA, approveACallback] = useAllowanceV2(
    tokenAddressA,
    amountToApproveA ? BigNumber.from(amountToApproveA?.quotient?.toString()) : BigNumber.from(0),
    router?.address
  )
  const [approvalB, approveBCallback] = useAllowanceV2(
    tokenAddressB,
    amountToApproveB ? BigNumber.from(amountToApproveB?.quotient?.toString()) : BigNumber.from(0),
    router?.address
  )

  const addTransaction = useTransactionAdder()

  async function onAdd() {
    setCurrentPoolTransctionHash(null)
    if (!chainId || !library || !account || !router) return

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    if (!parsedAmountA || !parsedAmountB || !currencyA || !currencyB || !deadline) {
      return
    }

    const amountsMin = {
      [Field.CURRENCY_A]: calculateSlippageAmount(parsedAmountA, noLiquidity ? ZERO_PERCENT : allowedSlippage)[0],
      [Field.CURRENCY_B]: calculateSlippageAmount(parsedAmountB, noLiquidity ? ZERO_PERCENT : allowedSlippage)[0],
    }
    const isCreating = !Boolean(pair?.liquidityToken?.address)
    let estimate,
      method: (...args: any) => Promise<TransactionResponse>,
      args: Array<string | string[] | number | boolean>,
      value: BigNumber | null
    if (currencyA.isNative || currencyB.isNative) {
      const tokenBIsETH = currencyB.isNative
      estimate = router.estimateGas.addLiquidityETH
      method = router.addLiquidityETH
      args = [
        (tokenBIsETH ? currencyA : currencyB)?.wrapped?.address ?? '', // token
        (tokenBIsETH ? parsedAmountA : parsedAmountB).quotient.toString(), // token desired
        amountsMin[tokenBIsETH ? Field.CURRENCY_A : Field.CURRENCY_B].toString(), // token min
        amountsMin[tokenBIsETH ? Field.CURRENCY_B : Field.CURRENCY_A].toString(), // eth min
        account,
        deadline.toHexString(),
        isCreating ? enableMitigation : mitigationEnabled,
      ]
      value = BigNumber.from((tokenBIsETH ? parsedAmountB : parsedAmountA).quotient.toString())
    } else if (currencyB.symbol === 'wCT1') {
      estimate = router.estimateGas.addLiquidity
      method = router.addLiquidity
      args = [
        currencyB?.wrapped?.address ?? '',
        currencyA?.wrapped?.address ?? '',
        parsedAmountB.quotient.toString(),
        parsedAmountA.quotient.toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        account,
        deadline.toHexString(),
        isCreating ? enableMitigation : mitigationEnabled,
      ]
      value = null
    } else {
      estimate = router.estimateGas.addLiquidity
      method = router.addLiquidity
      args = [
        currencyA?.wrapped?.address ?? '',
        currencyB?.wrapped?.address ?? '',
        parsedAmountA.quotient.toString(),
        parsedAmountB.quotient.toString(),
        amountsMin[Field.CURRENCY_A].toString(),
        amountsMin[Field.CURRENCY_B].toString(),
        account,
        deadline.toHexString(),
        isCreating ? enableMitigation : mitigationEnabled,
      ]
      value = null
    }

    let secTokenId = 0

    if (currencyA.isSecToken) secTokenId = currencyA.tokenInfo.id
    if (currencyB.isSecToken) secTokenId = currencyB.tokenInfo.id

    setAttemptingTxn(true)
    await estimate(...args, value ? { value } : {})
      .then((estimatedGasLimit) =>
        method(...args, {
          ...(value ? { value } : {}),
          gasLimit: calculateGasMargin(estimatedGasLimit),
        }).then((response) => {
          setAttemptingTxn(false)
          response.wait().then((res: any) => {
            if (isCreating && secTokenId) {
              const last = res.events.length - 2
              addLiquidity({
                address: res.events[last].address,
                tokenId: secTokenId,
                token0: currencyA.wrapped.address,
                token1: currencyB.wrapped.address,
                network: chainIdToNetworkName(chainId),
                blockNumber: res.events[last].blockNumber,
                decimals: pair?.liquidityToken?.decimals || 18,
                txHash: response.hash,
              })
            }
          })

          addTransaction(response, {
            summary: `Add ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(3)} ${
              currencies[Field.CURRENCY_A]?.symbol
            } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(3)} ${currencies[Field.CURRENCY_B]?.symbol}`,
          })

          setTxHash(response.hash)
          setCurrentPoolTransctionHash(response.hash)

          ReactGA.event({
            category: 'Liquidity',
            action: 'Add',
            label: [currencies[Field.CURRENCY_A]?.symbol, currencies[Field.CURRENCY_B]?.symbol].join('/'),
          })
        })
      )
      .catch((error) => {
        setAttemptingTxn(false)
        // we only care if the error is something _other_ than the user rejected the tx
        if (error?.code !== 4001) {
          console.error(error)
        }
      })
  }

  const modalHeader = useCallback(
    () => (
      <ModalHeader
        noLiquidity={noLiquidity}
        currencies={currencies}
        liquidityMinted={liquidityMinted}
        allowedSlippage={allowedSlippage}
      />
    ),
    [noLiquidity, currencies, liquidityMinted, allowedSlippage]
  )

  const modalBottom = () => {
    return (
      <ModalBottom
        price={price}
        currencies={currencies}
        parsedAmounts={parsedAmounts}
        noLiquidity={noLiquidity}
        onAdd={onAdd}
        poolTokenPercentage={poolTokenPercentage}
      />
    )
  }

  const pendingText = `Supplying ${parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)} ${
    currencies[Field.CURRENCY_A]?.symbol
  } and ${parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)} ${currencies[Field.CURRENCY_B]?.symbol}`

  const { handleCurrencyASelect, handleCurrencyBSelect } = useHandleCurrencySelect({
    currencyIdA,
    currencyIdB,
    history,
  })

  const handleDismissConfirmation = useCallback(() => {
    setShowConfirm(false)
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
      history.push(routes.pool)
    }
    setTxHash('')
  }, [onFieldAInput, txHash, history])

  const isCreate = history.location.pathname.includes('/create')

  const addIsUnsupported = useIsSwapUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  return (
    <>
      {showConfirm && (
        <TransactionConfirmationModal
          isOpen={showConfirm}
          onDismiss={handleDismissConfirmation}
          attemptingTxn={attemptingTxn}
          hash={txHash}
          content={() => (
            // <ModalNewWrapper>
            <ConfirmationModalContent
              title={noLiquidity ? <Trans>You are creating a pool</Trans> : <Trans>You will receive</Trans>}
              onDismiss={handleDismissConfirmation}
              topContent={modalHeader}
              bottomContent={modalBottom}
            />
            // </ModalNewWrapper>
          )}
          pendingText={pendingText}
          currencyToAdd={pair?.liquidityToken}
        />
      )}

      <ToggleableBody style={{ marginTop: isMobile ? '0px' : '0px' }} isVisible={!showConfirm}>
        {/* <AddLiduidityContainer></AddLiduidityContainer> */}
        <Box>
          <AppBody
            page="liquidity"
            blurred={chainId !== undefined && !TGE_CHAINS_WITH_SWAP.includes(chainId)}
            style={{ padding: 0, marginTop: -40 }}
          >
            <AddRemoveTabs creating={isCreate} adding={true} showBadge={mitigationEnabled} />
            <>
              <AutoColumn gap="14px">
                <CurrencyInputPanel
                  value={formattedAmounts[Field.CURRENCY_A]}
                  onUserInput={onFieldAInput}
                  onMax={() => {
                    onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')
                  }}
                  onCurrencySelect={handleCurrencyASelect}
                  showMaxButton={!atMaxAmounts[Field.CURRENCY_A]}
                  currency={currencies[Field.CURRENCY_A]}
                  id="add-liquidity-input-tokena"
                  data-testid="add-liquidity-input-tokena"
                  showCommonBases={false}
                  title={<Trans>Choose token to create a pool</Trans>}
                />
                <ColumnCenter>
                  <Plus style={plusIconStyle} />
                </ColumnCenter>
                <CurrencyInputPanel
                  value={formattedAmounts[Field.CURRENCY_B]}
                  onUserInput={onFieldBInput}
                  onCurrencySelect={handleCurrencyBSelect}
                  onMax={() => {
                    onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')
                  }}
                  showMaxButton={!atMaxAmounts[Field.CURRENCY_B]}
                  currency={currencies[Field.CURRENCY_B]}
                  id="add-liquidity-input-tokenb"
                  data-testid="add-liquidity-input-tokenb"
                  showCommonBases={false}
                  title={<Trans>Choose token to create a pool</Trans>}
                />
                <AutoColumn gap="20px">
                  {currencies[Field.CURRENCY_A] && currencies[Field.CURRENCY_B] && pairState !== PairState.INVALID && (
                    <PricesAndPoolShare
                      noLiquidity={noLiquidity}
                      currencies={currencies}
                      poolTokenPercentage={poolTokenPercentage}
                      price={price}
                    />
                  )}
                  {/* {!Boolean(pair?.liquidityToken?.address) && (
                  <MitigationToggle
                    active={enableMitigation}
                    toggle={toggleMitigation}
                    disabled={disableToggleMitigation}
                  />
                )} */}
                  {areBothSecTokens && <SecToSecWarning />}
                  <Box marginTop={'23px'}>
                    {addIsUnsupported ? (
                      <PinnedContentButton disabled={true} data-testid="unsupported-asset">
                        <TYPE.main mb="4px">
                          <Trans>Unsupported Asset</Trans>
                        </TYPE.main>
                      </PinnedContentButton>
                    ) : !account ? (
                      <>
                        <PinnedContentButton onClick={openConnectModal} data-testid="connect-wallet-add-liquidity">
                          <Trans>Connect Wallet</Trans>
                        </PinnedContentButton>
                      </>
                    ) : (
                      <AutoColumn gap={'md'}>
                        {(approvalA === ApprovalState.NOT_APPROVED ||
                          approvalA === ApprovalState.PENDING ||
                          approvalA === ApprovalState.APPROVED ||
                          approvalB === ApprovalState.NOT_APPROVED ||
                          approvalB === ApprovalState.PENDING ||
                          approvalB === ApprovalState.APPROVED) &&
                          isValid && (
                            <ButtonRow marginBottom={'0.5rem'}>
                              {approvalA !== ApprovalState.APPROVED && (
                                <PinnedContentButton
                                  onClick={approveACallback}
                                  disabled={approvalA === ApprovalState.PENDING}
                                  data-testid="approve-currency-a"
                                  style={{ flexGrow: approvalB !== ApprovalState.APPROVED ? 1 : 2 }}
                                >
                                  {approvalA === ApprovalState.PENDING ? (
                                    <Dots>
                                      <Trans>Approving {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                                    </Dots>
                                  ) : (
                                    <Trans>Approve {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                                  )}
                                </PinnedContentButton>
                              )}
                              {approvalA === ApprovalState.APPROVED && (
                                <NewApproveButton
                                  data-testid="approved-currency-a"
                                  style={{
                                    flexGrow: approvalA !== ApprovalState.APPROVED ? 1 : 2,
                                    gap: '10px',
                                    height: '100%',
                                  }}
                                >
                                  <div style={{ width: 24 }}>
                                    <ExternalIcon />
                                  </div>
                                  <Trans>Approved {currencies[Field.CURRENCY_A]?.symbol}</Trans>
                                </NewApproveButton>
                              )}
                              {approvalB !== ApprovalState.APPROVED && (
                                <PinnedContentButton
                                  onClick={approveBCallback}
                                  disabled={approvalB === ApprovalState.PENDING}
                                  data-testid="approve-currency-b"
                                  style={{ flexGrow: approvalA !== ApprovalState.APPROVED ? 1 : 2 }}
                                >
                                  {approvalB === ApprovalState.PENDING ? (
                                    <Dots>
                                      <Trans>Approving {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                                    </Dots>
                                  ) : (
                                    <Trans>Approve {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                                  )}
                                </PinnedContentButton>
                              )}
                              {approvalB === ApprovalState.APPROVED && (
                                <NewApproveButton
                                  data-testid="approved-currency-b"
                                  style={{
                                    flexGrow: approvalB !== ApprovalState.APPROVED ? 1 : 2,
                                    gap: '10px',
                                    height: '100%',
                                  }}
                                >
                                  <div style={{ width: 24 }}>
                                    <ExternalIcon />
                                  </div>
                                  <Trans>Approved {currencies[Field.CURRENCY_B]?.symbol}</Trans>
                                </NewApproveButton>
                              )}
                            </ButtonRow>
                          )}
                        <PinnedContentButton
                          data-testid="supply"
                          onClick={() => {
                            expertMode ? onAdd() : setShowConfirm(true)
                          }}
                          disabled={
                            !isValid || approvalA !== ApprovalState.APPROVED || approvalB !== ApprovalState.APPROVED
                          }
                        >
                          <Text>{error ?? <Trans>Supply</Trans>}</Text>
                        </PinnedContentButton>
                      </AutoColumn>
                    )}
                    {!addIsUnsupported ? (
                      pair && !noLiquidity && pairState !== PairState.INVALID ? (
                        <>
                          <FixedHeightRow style={{ marginBottom: '30px', marginTop: '20px' }}>
                            <RowFixed>
                              <Title>
                                <Trans>My position</Trans>
                              </Title>
                            </RowFixed>
                          </FixedHeightRow>
                          <MinimalPositionCard showUnwrapped={oneCurrencyIsWETH} pair={pair} />
                        </>
                      ) : null
                    ) : (
                      <UnsupportedCurrencyFooter
                        show={addIsUnsupported}
                        currencies={[currencies.CURRENCY_A, currencies.CURRENCY_B]}
                      />
                    )}
                  </Box>
                </AutoColumn>
              </AutoColumn>
            </>
          </AppBody>
        </Box>
        <TYPE.main mt="20px" mb="50px">
          <Tip noLiquidity={noLiquidity} isCreate={isCreate} />
        </TYPE.main>
      </ToggleableBody>
    </>
  )
}
