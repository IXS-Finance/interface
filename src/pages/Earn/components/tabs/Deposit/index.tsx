import React, { useMemo, useEffect, useState } from 'react'
import { Trans } from '@lingui/macro'
import {
  FormContentContainer,
  FormSectionTitle,
  InputContainer,
  InputRow,
  AmountInput,
  CurrencySelector,
  CurrencyIcon,
  CurrencyText,
  ConversionText,
  BalanceRow,
  BalanceText,
  BalanceAmount,
  MaxButton,
  ActionRow,
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

import USDCIcon from 'assets/images/usdcNew.svg'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useBalance } from 'wagmi'
import { useAllowance, ApprovalState } from 'hooks/useApproveCallback'
import { ethers, BigNumber } from 'ethers'
import VaultABI from '../../../abis/Vault.json'
import { earn } from 'services/apiUrls'
import apiService from 'services/apiService'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { createUseReadContract, createUseWriteContract, createUseWatchContractEvent } from 'wagmi/codegen'
import erc20Abi from 'abis/erc20.json'
import { parseUnits } from 'viem'
import { toast } from 'react-toastify'
import { SuccessPopup } from './SuccessPopup'


const useWatchTokenApprovalEvent = createUseWatchContractEvent({
  abi: erc20Abi,
  eventName: 'Approval',
})

interface EarnV2SignatureData {
  v: number
  r: string
  s: string
}

interface DepositTabProps {
  amount: string
  setAmount: (amount: string) => void
  loading: boolean
  showPreview: boolean
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
  handlePreviewDeposit: () => void
  handleBackFromPreview: () => void
  productAsset?: string
  network?: string
  vaultAddress?: string
  investingTokenAddress?: string
  exchangeRate?: string
  investingTokenDecimals?: number
  chainId?: number
}

export const DepositTab: React.FC<DepositTabProps> = ({
  amount,
  setAmount,
  loading,
  showPreview,
  termsAccepted,
  setTermsAccepted,
  handlePreviewDeposit,
  handleBackFromPreview,
  productAsset,
  network,
  vaultAddress,
  investingTokenAddress,
  exchangeRate,
  investingTokenDecimals,
  chainId,
}) => {
  const { address } = useAccount()
  const [isApproving, setIsApproving] = useState(false)
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const useWriteInvestingTokeApprove = createUseWriteContract({
    abi: erc20Abi,
    address: investingTokenAddress as `0x${string}`,
    functionName: 'approve',
  })

  const { writeContract: approve, data: approveTxHash } = useWriteInvestingTokeApprove()

  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    refetch: refetchBalanceData,
  } = useBalance({
    address: address,
    token: investingTokenAddress as `0x${string}`,
    query: {
      enabled: !!address && !!investingTokenAddress,
    },
  })

  const { data: allowanceData, refetch: refetchAllowance } = useReadContract({
    abi: erc20Abi,
    address: investingTokenAddress as `0x${string}`,
    functionName: 'allowance',
    args: [address, vaultAddress],
    query: {
      enabled: !!address && !!investingTokenAddress && !!vaultAddress,
    },
  })


  const amountRaw = useMemo(() => {
    try {
      return amount ? parseUnits(amount, investingTokenDecimals || 6) : BigNumber.from(0)
    } catch (e) {
      return 0
    }
  }, [amount])

  const isApprovalNeeded = useMemo(() => {
    if (!allowanceData) {
      return true
    }

    if (!amountRaw) {
      return false
    }

    const currentAllowance = BigNumber.from(allowanceData.toString())
    return currentAllowance.lt(amountRaw)
  }, [allowanceData, amountRaw, isApproving])

  const approveResult = useWaitForTransactionReceipt({
    // wait for tx confirmation
    hash: approveTxHash,
  })

  useEffect(() => {
    if (approveResult.isSuccess) {
      refetchAllowance()
      setIsApproving(false)
      toast.success('Approval successful! Your funds have been approved for deposit.')
    }
  }, [approveResult.isSuccess, refetchAllowance])

  useWatchTokenApprovalEvent({
    address: investingTokenAddress as `0x${string}`,
    onLogs(log) {
      setIsApproving(false)
      refetchAllowance()
    },
  })

  const result = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}`,
    functionName: 'whitelistedUserAddress',
    args: [address],
    query: {
      enabled: !!vaultAddress && !!address,
    },
  })

  const { data: isWhitelisted, isLoading: isCheckingWhitelist, refetch: refetchIsWhitelisted } = result

  const { data: nonceData, isLoading: isNonceLoading } = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}`,
    functionName: 'nonces',
    args: [address],
    query: {
      enabled: !!vaultAddress && !!address && !isWhitelisted,
    },
  })
  const userNonce = nonceData as BigNumber | undefined

  const [isFetchingSignature, setIsFetchingSignature] = useState(false)
  const [whitelistAttemptError, setWhitelistAttemptError] = useState<string | null>(null)
  const [depositError, setDepositError] = useState<string | null>(null)

  const {
    data: whitelistTxHash,
    writeContractAsync: whitelistUserContractAsync,
    isPending: isWhitelistContractCallPending,
    error: whitelistContractWriteError,
  } = useWriteContract()

  const {
    isLoading: isConfirmingWhitelistTx,
    isSuccess: isWhitelistTxConfirmed,
    error: whitelistTxConfirmError,
  } = useWaitForTransactionReceipt({
    hash: whitelistTxHash,
    query: {
      enabled: !!whitelistTxHash,
    },
  })

  const {
    data: depositTxHash,
    writeContractAsync: depositContractAsync,
    isPending: isDepositContractCallPending,
    error: depositContractWriteError,
    reset: resetDepositContract,
  } = useWriteContract()

  console.log('depositTxHash', depositTxHash)

  const {
    isLoading: isConfirmingDepositTx,
    isSuccess: isDepositTxConfirmed,
    error: depositTxConfirmError,
  } = useWaitForTransactionReceipt({
    hash: depositTxHash,
    query: {
      enabled: !!depositTxHash,
    },
  })

  useEffect(() => {
    if (isWhitelistTxConfirmed) {
      refetchIsWhitelisted()
      setWhitelistAttemptError(null)
    }
  }, [isWhitelistTxConfirmed, refetchIsWhitelisted])

  useEffect(() => {
    if (whitelistContractWriteError) {
      setWhitelistAttemptError(whitelistContractWriteError.message || 'Failed to send whitelist transaction.')
    } else if (whitelistTxConfirmError) {
      setWhitelistAttemptError(whitelistTxConfirmError.message || 'Whitelist transaction failed to confirm.')
    }
  }, [whitelistContractWriteError, whitelistTxConfirmError])

  useEffect(() => {
    if (isDepositTxConfirmed) {
      refetchAllowance()
      setDepositError(null)
      if (refetchBalanceData) {
        refetchBalanceData()
      }
      setAmount('')
      resetDepositContract() // Reset contract call state
      setShowSuccessPopup(true) // Show success popup instead of going back immediately
    }
  }, [isDepositTxConfirmed, refetchBalanceData, setAmount, resetDepositContract])

  useEffect(() => {
    let message: string | null = null
    if (depositContractWriteError) {
      message =
        depositContractWriteError.message || depositContractWriteError.message || 'Failed to send deposit transaction.'
      console.error('Deposit contract write error:', depositContractWriteError)
      resetDepositContract() // Reset to allow retry
    } else if (depositTxConfirmError) {
      message =
        depositTxConfirmError.message || depositTxConfirmError.message || 'Deposit transaction failed to confirm.'
      console.error('Deposit transaction confirm error:', depositTxConfirmError)
      resetDepositContract() // Reset to allow retry if confirmation fails
    }
    // Set error if a new message is generated
    if (message) {
      setDepositError(message)
    }
    // Note: Clearing of depositError is handled on new attempt or success
  }, [depositContractWriteError, depositTxConfirmError, resetDepositContract])


  const handleMaxClick = () => {
    if (balanceData) {
      setAmount(balanceData.formatted)
    }
  }

  const handleApproval = async () => {
    try {
      setIsApproving(true)
      approve(
        {
          args: [vaultAddress, parseUnits(amount, investingTokenDecimals || 6)],
        },
        {
          onError(error) {
            setIsApproving(false)
          },
        }
      )
    } catch (error) {
      console.error('Approval failed:', error)
      setIsApproving(false)
    }
  }

  const handleGetSignatureAndWhitelist = async () => {
    console.log('handleGetSignatureAndWhitelist', { address, vaultAddress, network, userNonce })
    if (!address || !vaultAddress || !network || userNonce === undefined) {
      const errorMsg = 'Cannot proceed: Missing address, vault, network, or nonce.'
      console.error(errorMsg, { address, vaultAddress, network, userNonce })
      setWhitelistAttemptError(errorMsg)
      return
    }

    setIsFetchingSignature(true)
    setWhitelistAttemptError(null)

    try {
      const apiUrl = earn.getEIP712Signature(network)
      const signatureResponse = await apiService.post<EarnV2SignatureData>(apiUrl, {
        product: 'EARN_V2_TREASURY',
      })

      const { v, r, s } = signatureResponse.data
      setIsFetchingSignature(false)

      await whitelistUserContractAsync({
        abi: VaultABI.abi,
        address: vaultAddress as `0x${string}`,
        functionName: 'whitelistUser',
        args: [userNonce, v, r as `0x${string}`, s as `0x${string}`],
      })
    } catch (error: any) {
      console.error('Error during whitelist signature or transaction:', error)
      setIsFetchingSignature(false)
      const message =
        error.response?.data?.message || error.message || 'An unexpected error occurred during whitelisting.'
      setWhitelistAttemptError(message)
    }
  }

  const handleDeposit = async () => {
    if (!vaultAddress || !amountRaw) {
      const errorMsg = 'Vault address or amount is invalid for deposit.'
      setDepositError(errorMsg)
      console.error(errorMsg, { vaultAddress, amount: amount.toString() })
      return
    }

    setDepositError(null) // Clear previous deposit errors

    try {
      await depositContractAsync({
        abi: VaultABI.abi,
        address: vaultAddress as `0x${string}`,
        functionName: 'deposit',
        args: [amountRaw],
      })
    } catch (error: any) {
      // This catch might not be strictly necessary if using the error from useWriteContract,
      // but can catch synchronous errors during the call setup.
      console.error('Error initiating deposit transaction:', error)
      const message = error.shortMessage || error.message || 'An unexpected error occurred during deposit initiation.'
      setDepositError(message)
    }
  }

  const isDepositing = isDepositContractCallPending || isConfirmingDepositTx

  const handleClosePopup = () => {
    setShowSuccessPopup(false)
    handleBackFromPreview() // Go back to the form after closing popup
  }

  return (
    <>
      {!showPreview ? (
        <FormContentContainer>
          <FormSectionTitle>
            <Trans>Deposit Amount</Trans>
          </FormSectionTitle>

          <InputContainer>
            <InputRow style={{ minHeight: '60px' }}>
              <AmountInput
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ fontSize: '24px' }}
              />
              <CurrencySelector>
                <CurrencyIcon>
                  <img src={USDCIcon} alt="USDC" />
                </CurrencyIcon>
                <CurrencyText>USDC</CurrencyText>
              </CurrencySelector>
            </InputRow>
          </InputContainer>

          <BalanceRow>
            <div></div>
            <BalanceText>
              Balance:{' '}
              <BalanceAmount>{isBalanceLoading ? 'Loading...' : balanceData?.formatted || '0.00'}</BalanceAmount>
              <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
            </BalanceText>
          </BalanceRow>

          <ActionRow>
            <ExchangeRateInfo>
              <ExchangeRateLabel>Exchange Rate</ExchangeRateLabel>
              <ExchangeRateValue>{exchangeRate}</ExchangeRateValue>
            </ExchangeRateInfo>

            {isCheckingWhitelist ? (
              <StyledButtonPrimary disabled={true}>
                <Trans>Checking whitelist...</Trans>
              </StyledButtonPrimary>
            ) : isWhitelisted ? (
              <StyledButtonPrimary
                onClick={handlePreviewDeposit}
                disabled={!amount || loading}
                style={{
                  flex: '1',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  backgroundColor: '#6C5DD3',
                  marginLeft: '20px',
                }}
              >
                {loading ? <Trans>Processing...</Trans> : <Trans>Preview Deposit</Trans>}
              </StyledButtonPrimary>
            ) : (
              <>
                <StyledButtonPrimary
                  onClick={handleGetSignatureAndWhitelist}
                  disabled={
                    loading ||
                    isCheckingWhitelist ||
                    isNonceLoading ||
                    (userNonce === undefined && !isWhitelisted) ||
                    isFetchingSignature ||
                    isWhitelistContractCallPending ||
                    isConfirmingWhitelistTx
                  }
                >
                  {(() => {
                    if (isCheckingWhitelist || isNonceLoading) return <Trans>Loading data...</Trans>
                    if (userNonce === undefined && !isWhitelisted) return <Trans>Whitelist Unavailable</Trans>
                    if (isFetchingSignature) return <Trans>Getting Signature...</Trans>
                    if (isWhitelistContractCallPending) return <Trans>Whitelisting... Check Wallet</Trans>
                    if (isConfirmingWhitelistTx) return <Trans>Confirming Whitelist...</Trans>
                    if (whitelistAttemptError) return <Trans>Whitelist Failed. Retry?</Trans>
                    return <Trans>Get Whitelisted</Trans>
                  })()}
                </StyledButtonPrimary>
                {whitelistAttemptError &&
                  !isConfirmingWhitelistTx &&
                  !isWhitelistContractCallPending &&
                  !isFetchingSignature && (
                    <div
                      style={{
                        color: 'red',
                        marginTop: '10px',
                        fontSize: '0.875em',
                        textAlign: 'right',
                        width: '100%',
                      }}
                    >
                      {whitelistAttemptError}
                    </div>
                  )}
              </>
            )}
          </ActionRow>
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
                <SummaryLabel>Deposit Amount</SummaryLabel>
                <SummaryValue>USDC {formatAmount(parseFloat(amount), 6)}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Exchange Rate</SummaryLabel>
                <SummaryValue>{exchangeRate ? formatAmount(parseFloat(exchangeRate), 6) : 'N/A'}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Estimated Vault Tokens Received</SummaryLabel>
                <SummaryValue>
                  VT{' '}
                  {(() => {
                    const numericAmount = parseFloat(amount)
                    const numericExchangeRate = exchangeRate ? parseFloat(exchangeRate) : 0
                    if (!isNaN(numericAmount) && numericExchangeRate > 0) {
                      return formatAmount(numericAmount / numericExchangeRate, 3)
                    }
                    return formatAmount(0, 3) // Or 'N/A' if preferred
                  })()}
                </SummaryValue>
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
            <BackButton onClick={handleBackFromPreview}>Back</BackButton>
            {isApprovalNeeded ? (
              <StyledButtonPrimary onClick={handleApproval} disabled={!termsAccepted || isApproving || loading}>
                {isApproving ? <Trans>Approving...</Trans> : <Trans>Approve USDC</Trans>}
              </StyledButtonPrimary>
            ) : (
              <StyledButtonPrimary
                onClick={handleDeposit}
                disabled={!termsAccepted || loading || isDepositing || !amount || !amountRaw}
              >
                {isDepositing ? (
                  <Trans>Depositing...</Trans>
                ) : depositError ? (
                  <Trans>Retry Deposit</Trans>
                ) : (
                  <Trans>Deposit</Trans>
                )}
              </StyledButtonPrimary>
            )}
            {depositError && !isDepositing && !isApprovalNeeded && (
              <div style={{ color: 'red', marginTop: '10px', fontSize: '0.875em', textAlign: 'center', width: '100%' }}>
                Error: {depositError}
              </div>
            )}
          </ButtonsRow>
        </PreviewContainer>
      )}
      
      {showSuccessPopup && (
        <SuccessPopup
          onClose={handleClosePopup}
          txHash={depositTxHash}
          chainId={chainId}
        />
      )}
    </>
  )
}
