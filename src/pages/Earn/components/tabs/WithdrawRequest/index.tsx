import React, { useEffect, useMemo, useState } from 'react'
import { Trans } from '@lingui/macro'
import { Flex } from 'rebass'
import { toast } from 'react-toastify'
import { ethers, BigNumber } from 'ethers'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

import {
  FormContentContainer,
  FormSectionTitle,
  InputContainer,
  InputRow,
  AmountInput,
  CurrencySelector,
  CurrencyText,
  BalanceText,
  BalanceAmount,
  MaxButton,
  ExchangeRateInfo,
  ExchangeRateLabel,
  ExchangeRateValue,
  PreviewContainer,
  PreviewSection,
  PreviewTitle,
  AddressBox,
  SummaryTable,
  SummaryRow,
  SummaryLabel,
  SummaryValue,
  TermsContainer,
  Checkbox,
  TermsText,
  TermsLink,
  ButtonsRow,
  BackButton,
  StyledButtonPrimary,
} from '../SharedStyles'
import VaultABI from '../../../abis/Vault.json'
import { formatAmount } from 'utils/formatCurrencyAmount' // For consistent formatting
import { SuccessPopup } from './SuccessPopup'
import ErrorContent from '../../ToastContent/Error'

interface WithdrawRequestTabProps {
  withdrawAmount: string
  setWithdrawAmount: (amount: string) => void
  loading: boolean // Prop from parent, potentially for preview step or global loading
  showWithdrawPreview: boolean
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
  handlePreviewWithdraw: () => void
  handleBackFromWithdrawPreview: () => void
  exchangeRate: string
  getUsdcEquivalent: (vaultAmount: string) => string
  network?: string
  vaultAddress?: string
}

const VAULT_TOKEN_DECIMALS = 6 // Assumption: Vault tokens have 6 decimals

export const WithdrawRequestTab: React.FC<WithdrawRequestTabProps> = ({
  withdrawAmount,
  setWithdrawAmount,
  loading, // Parent loading state
  showWithdrawPreview,
  termsAccepted,
  setTermsAccepted,
  handlePreviewWithdraw,
  handleBackFromWithdrawPreview,
  exchangeRate,
  getUsdcEquivalent,
  network,
  vaultAddress,
}) => {
  const { address } = useAccount()
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const {
    data: rawVaultTokenBalance,
    isLoading: isBalanceLoading,
    refetch: refetchVaultTokenBalance,
  } = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}` | undefined,
    functionName: 'userVaultTokenBalances',
    args: [address as `0x${string}`],
    query: {
      enabled: !!vaultAddress && !!address,
    },
  })

  console.log('rawVaultTokenBalance', rawVaultTokenBalance)

  const formattedVaultTokenBalance = useMemo(() => {
    if (rawVaultTokenBalance) {
      return ethers.utils.formatUnits(rawVaultTokenBalance as BigNumber, VAULT_TOKEN_DECIMALS)
    }
    return '0.00'
  }, [rawVaultTokenBalance])

  const withdrawAmountInSmallestUnit = useMemo(() => {
    try {
      return withdrawAmount ? ethers.utils.parseUnits(withdrawAmount, VAULT_TOKEN_DECIMALS) : BigNumber.from(0)
    } catch (e) {
      // Handle invalid input format if necessary
      return BigNumber.from(0)
    }
  }, [withdrawAmount])

  const {
    data: withdrawTxHash,
    writeContractAsync: withdrawContractAsync,
    isPending: isSubmittingWithdraw,
    error: withdrawContractWriteError,
    reset: resetWithdrawContract,
  } = useWriteContract()

  const {
    isLoading: isConfirmingWithdrawTx,
    isSuccess: isWithdrawTxConfirmed,
    error: withdrawTxConfirmError,
  } = useWaitForTransactionReceipt({
    hash: withdrawTxHash,
    query: {
      enabled: !!withdrawTxHash,
    },
  })

  const isWithdrawProcessing = isSubmittingWithdraw || isConfirmingWithdrawTx

  useEffect(() => {
    if (isWithdrawTxConfirmed) {
      setWithdrawError(null)
      refetchVaultTokenBalance?.()
      setWithdrawAmount('')
      resetWithdrawContract()
      setShowSuccessPopup(true)
    }
  }, [isWithdrawTxConfirmed, refetchVaultTokenBalance, setWithdrawAmount, resetWithdrawContract])

  useEffect(() => {
    let message: string | null = null
    if (withdrawContractWriteError) {
      message = withdrawContractWriteError.message || 'Failed to send withdrawal transaction.'
      console.error('Withdraw contract write error:', withdrawContractWriteError)
      resetWithdrawContract()
    } else if (withdrawTxConfirmError) {
      message = withdrawTxConfirmError.message || 'Withdrawal transaction failed to confirm.'
      console.error('Withdraw transaction confirm error:', withdrawTxConfirmError)
      resetWithdrawContract()
    }
    if (message) {
      if (message.includes('User rejected the request')) {
        toast.error(<ErrorContent title="Error" message="Transaction rejected by user." />, {
          style: {
            background: '#fff',
            border: '1px solid rgba(255, 101, 101, 0.50)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
      } else {
        toast.error(<ErrorContent title="Error" message={message} />, {
          style: {
            background: '#fff',
            border: '1px solid rgba(255, 101, 101, 0.50)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
      }
      setWithdrawError(message)
    }
  }, [withdrawContractWriteError, withdrawTxConfirmError, resetWithdrawContract])

  const handleActualWithdraw = async () => {
    if (!vaultAddress || withdrawAmountInSmallestUnit.isZero()) {
      const errorMsg = 'Vault address or amount is invalid for withdrawal.'
      setWithdrawError(errorMsg)
      console.error(errorMsg, { vaultAddress, amount: withdrawAmount })
      return
    }
    if (!termsAccepted) {
      setWithdrawError('Please accept the terms and conditions.')
      return
    }

    setWithdrawError(null) // Clear previous errors

    try {
      await withdrawContractAsync({
        abi: VaultABI.abi,
        address: vaultAddress as `0x${string}`,
        functionName: 'withdrawalRequest',
        args: [withdrawAmountInSmallestUnit],
      })
    } catch (error: any) {
      console.error('Error initiating withdrawal transaction:', error)
      const message =
        error.shortMessage || error.message || 'An unexpected error occurred during withdrawal initiation.'
      setWithdrawError(message)
    }
  }

  const handleClosePopup = () => {
    setShowSuccessPopup(false)
    handleBackFromWithdrawPreview()
  }

  return (
    <>
      {!showWithdrawPreview ? (
        <FormContentContainer>
          <FormSectionTitle>
            <Trans>Withdrawal Amount</Trans>
          </FormSectionTitle>

          <InputContainer>
            <InputRow>
              <AmountInput
                placeholder="0.00"
                value={withdrawAmount}
                onChange={(e) => {
                  setWithdrawAmount(e.target.value)
                  setWithdrawError(null) // Clear error on input change
                }}
              />

              <div>
                <Flex css={{ gap: '8px', alignItems: 'center' }}>
                  <MaxButton
                    onClick={() => {
                      setWithdrawAmount(formattedVaultTokenBalance)
                      setWithdrawError(null)
                    }}
                  >
                    MAX
                  </MaxButton>
                  <CurrencySelector>
                    <CurrencyText>Vault Tokens</CurrencyText>
                  </CurrencySelector>
                </Flex>

                <BalanceText>
                  <BalanceAmount>
                    {isBalanceLoading
                      ? 'Loading...'
                      : formatAmount(parseFloat(formattedVaultTokenBalance), VAULT_TOKEN_DECIMALS)}
                  </BalanceAmount>{' '}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M12.6667 13.3334H3.33333C2.59695 13.3334 2 12.7364 2 12V6.00002C2 5.26364 2.59695 4.66669 3.33333 4.66669H12.6667C13.4031 4.66669 14 5.26364 14 6.00002V12C14 12.7364 13.4031 13.3334 12.6667 13.3334Z"
                      stroke="#B8B8CC"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M11.0001 9.33335C10.816 9.33335 10.6667 9.18409 10.6667 9.00002C10.6667 8.81595 10.816 8.66669 11.0001 8.66669C11.1841 8.66669 11.3334 8.81595 11.3334 9.00002C11.3334 9.18409 11.1841 9.33335 11.0001 9.33335Z"
                      fill="#B8B8CC"
                      stroke="#B8B8CC"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 4.66668V3.73549C12 2.85945 11.1696 2.22146 10.3231 2.44718L2.98978 4.40274C2.40611 4.55838 2 5.08698 2 5.69105V6.00001"
                      stroke="#B8B8CC"
                      strokeWidth="1.5"
                    />
                  </svg>
                </BalanceText>
              </div>
            </InputRow>
          </InputContainer>

          <Flex justifyContent="space-between" alignItems="center" mt="32px">
            <div>
              {exchangeRate ? (
                <ExchangeRateInfo>
                  <ExchangeRateValue>{exchangeRate}</ExchangeRateValue>
                  <ExchangeRateLabel>Exchange Rate</ExchangeRateLabel>
                </ExchangeRateInfo>
              ) : null}
            </div>

            <StyledButtonPrimary
              onClick={handlePreviewWithdraw}
              disabled={!withdrawAmount || parseFloat(withdrawAmount) === 0 || loading || isWithdrawProcessing}
            >
              {loading ? <Trans>Processing...</Trans> : <Trans>Preview Withdraw Request</Trans>}
            </StyledButtonPrimary>
          </Flex>
        </FormContentContainer>
      ) : (
        <PreviewContainer>
          <PreviewSection>
            <PreviewTitle>Request Made To</PreviewTitle>
            <AddressBox>{vaultAddress || '0×510E94...e56370'}</AddressBox>
          </PreviewSection>

          <PreviewSection>
            <PreviewTitle>Network</PreviewTitle>
            <AddressBox>{network || 'Polygon'}</AddressBox>
          </PreviewSection>

          <PreviewSection>
            <PreviewTitle>Summary</PreviewTitle>
            <SummaryTable>
              <SummaryRow>
                <SummaryLabel>Withdrawal Amount</SummaryLabel>
                <SummaryValue>
                  VT{' '}
                  {parseFloat(withdrawAmount || '0').toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: VAULT_TOKEN_DECIMALS,
                  })}
                </SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Exchange Rate</SummaryLabel>
                <SummaryValue>{exchangeRate ? formatAmount(parseFloat(exchangeRate), 6) : 'N/A'}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Estimated USDC Received</SummaryLabel>
                <SummaryValue>USDC {getUsdcEquivalent(withdrawAmount || '0')}</SummaryValue>
              </SummaryRow>
            </SummaryTable>
          </PreviewSection>

          <TermsContainer>
            <Checkbox type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
            <TermsText>
              I agree to the <TermsLink>IXS Earn Terms and Conditions</TermsLink>.
            </TermsText>
          </TermsContainer>

          <ButtonsRow>
            <BackButton onClick={handleBackFromWithdrawPreview} disabled={isWithdrawProcessing}>
              Back
            </BackButton>
            <StyledButtonPrimary
              onClick={handleActualWithdraw}
              disabled={
                !termsAccepted ||
                loading || // Parent loading state
                isWithdrawProcessing ||
                !withdrawAmount ||
                withdrawAmountInSmallestUnit.isZero()
              }
            >
              {isWithdrawProcessing ? (
                <Trans>Processing...</Trans>
              ) : withdrawError ? (
                <Trans>Retry Withdraw</Trans>
              ) : (
                <Trans>Withdraw</Trans>
              )}
            </StyledButtonPrimary>
          </ButtonsRow>
        </PreviewContainer>
      )}

      {showSuccessPopup && <SuccessPopup onClose={handleClosePopup} txHash={withdrawTxHash} />}
    </>
  )
}
