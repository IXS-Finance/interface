import React, { useEffect, useState } from 'react'
import { Trans } from '@lingui/macro'
import {
  FormContentContainer,
  StyledButtonPrimary,
  Card,
  Value,
  ExchangeRateInfo,
  ExchangeRateValue,
  ExchangeRateLabel,
} from '../SharedStyles'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits } from 'viem'
import VaultABI from '../../../abis/Vault.json' // Adjusted path
import ERC20ABI from 'abis/erc20.json' // Add ERC20 ABI import
import { formatAmount } from 'utils/formatCurrencyAmount' // Assuming alias or correct path
import { useMemo } from 'react'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'
import { FormSectionTitle } from '../../AmountInput'
import ClaimPreview from './ClaimPreview'
import { toast } from 'react-toastify'
import ErrorContent from '../../ToastContent/Error'
import { SuccessPopup } from './SuccessPopup'

// Add styled component for info badge
const InfoBadge = styled.div`
  background-color: #e3f2fd;
  color: #1976d2;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 14px;
  border: 1px solid #bbdefb;
  display: flex;
  align-items: center;
  gap: 8px;
`

const InfoIcon = styled.span`
  font-size: 16px;
`

// Add the platform fee hook
const usePlatformFee = (contractAddress: `0x${string}`) => {
  const { data, ...rest } = useReadContract({
    abi: VaultABI.abi, // Assuming the fee function is in the same contract
    address: contractAddress,
    functionName: 'claimPercentageFeeBps',
  })

  return {
    data,
    ...rest,
  }
}

// Add the service fee hook after the platform fee hook
const useServiceFee = (contractAddress: `0x${string}`) => {
  const { data, ...rest } = useReadContract({
    abi: VaultABI.abi,
    address: contractAddress,
    functionName: 'claimFlatFee',
  })

  return {
    data,
    ...rest,
  }
}

interface ClaimTabProps {
  loading: boolean
  showClaimPreview: boolean
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
  handlePreviewClaim: () => void
  handleBackFromClaimPreview: () => void
  vaultAddress?: string
  investingTokenAddress?: string
  investingTokenSymbol?: string
}

export const ClaimTab: React.FC<ClaimTabProps> = ({
  loading,
  showClaimPreview,
  termsAccepted,
  setTermsAccepted,
  handlePreviewClaim,
  handleBackFromClaimPreview,
  vaultAddress,
  investingTokenAddress,
  investingTokenSymbol = 'USDC',
}) => {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  const { address } = useAccount()
  const { data: platformFeeBps } = usePlatformFee(vaultAddress as `0x${string}`)
  const { data: claimFlatFee } = useServiceFee(vaultAddress as `0x${string}`)
  const {
    writeContract,
    data: claimTxHash,
    isPending: isSubmittingClaim,
    error: claimContractWriteError,
    reset: resetClaimContract,
  } = useWriteContract()

  // Wait for transaction confirmation
  const {
    isLoading: isConfirmingClaimTx,
    isSuccess: isClaimTxConfirmed,
    error: claimTxConfirmError,
  } = useWaitForTransactionReceipt({
    hash: claimTxHash,
    query: {
      enabled: !!claimTxHash,
    },
  })

  const {
    data: rawUserAssetBalance,
    isLoading: isLoadingClaimableBalance,
    refetch: refetchClaimableAmount,
  } = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}`,
    functionName: 'userAssetBalances', // Assuming this is the correct function name for claimable amount
    args: [address],
    query: {
      enabled: !!vaultAddress && !!address,
    },
  })

  const {
    data: investingTokenBalance,
    isLoading: isLoadingInvestingTokenBalance,
    refetch: refetchVaultTokenBalance,
  } = useReadContract({
    abi: ERC20ABI,
    address: investingTokenAddress as `0x${string}`,
    functionName: 'balanceOf',
    args: [vaultAddress],
    query: {
      enabled: !!investingTokenAddress && !!vaultAddress,
    },
  })

  const displayableFetchedClaimableAmount = useMemo(() => {
    if (isLoadingClaimableBalance) {
      return 'Loading...'
    }
    if (rawUserAssetBalance !== undefined && rawUserAssetBalance !== null) {
      const formatted = formatUnits(rawUserAssetBalance as bigint, 6)
      return formatAmount(parseFloat(formatted), 4)
    }
    return formatAmount(0, 4)
  }, [rawUserAssetBalance, isLoadingClaimableBalance])

  // Calculate platform fee amount
  const calculatedPlatformFee = useMemo(() => {
    if (!rawUserAssetBalance || !platformFeeBps) {
      return formatAmount(0, 2)
    }

    const claimableAmountNum = parseFloat(formatUnits(rawUserAssetBalance as bigint, 6))
    const feePercentage = Number(platformFeeBps) / 10000
    const feeAmount = claimableAmountNum * feePercentage

    return formatAmount(feeAmount, 2)
  }, [rawUserAssetBalance, platformFeeBps])

  // Calculate platform fee percentage for display
  const platformFeePercentage = useMemo(() => {
    if (!platformFeeBps) {
      return '0'
    }
    // Convert basis points to percentage for display (divide by 100)
    return (Number(platformFeeBps) / 100).toFixed(2)
  }, [platformFeeBps])

  // Calculate service fee amount
  const calculatedServiceFee = useMemo(() => {
    if (!claimFlatFee) {
      return formatAmount(0, 2)
    }

    const serviceFeeAmount = parseFloat(formatUnits(claimFlatFee as bigint, 6))
    return formatAmount(serviceFeeAmount, 2)
  }, [claimFlatFee])

  // Use calculated platform fee or fallback to prop

  // Use calculated service fee or fallback to prop
  const finalServiceFee = calculatedServiceFee

  // Calculate actual claimable amount (claimable amount - platform fee - service fee)
  const actualClaimableAmount = useMemo(() => {
    if (!rawUserAssetBalance) {
      return formatAmount(0, 2)
    }

    const claimableAmountNum = parseFloat(formatUnits(rawUserAssetBalance as bigint, 6))
    const platformFeeAmount = parseFloat(calculatedPlatformFee)
    const serviceFeeAmount = parseFloat(calculatedServiceFee)

    const actualAmount = claimableAmountNum - platformFeeAmount - serviceFeeAmount

    return formatAmount(Math.max(0, actualAmount), 2)
  }, [rawUserAssetBalance, platformFeeBps, claimFlatFee, calculatedPlatformFee, calculatedServiceFee])

  // Use calculated platform fee or fallback to prop
  const platformFee = calculatedPlatformFee

  const isFetchedClaimableAmountZero = useMemo(() => {
    // If rawUserAssetBalance is undefined, null, or 0n, it's considered zero.
    // 0n is falsy in JavaScript, as are undefined and null.
    return !rawUserAssetBalance
  }, [rawUserAssetBalance])
  // Check if claiming is possible (earnProxyBalance >= userClaimableAmount)
  const isClaimingPossible = useMemo(() => {
    if (!rawUserAssetBalance || !investingTokenBalance) {
      return false
    }

    console.log('investingTokenBalance', investingTokenBalance)
    console.log('rawUserAssetBalance', rawUserAssetBalance)
    // Both should be bigint, compare directly
    return (investingTokenBalance as bigint) >= (rawUserAssetBalance as bigint)
  }, [rawUserAssetBalance, investingTokenBalance])

  // Implement handleClaim function
  const handleClaim = async () => {
    if (!vaultAddress) {
      console.error('Vault address not available')
      return
    }

    try {
      writeContract({
        abi: VaultABI.abi,
        address: vaultAddress as `0x${string}`,
        functionName: 'claim',
      })
    } catch (error) {
      console.error('Error initiating claim:', error)
    }
  }

  // Update loading state to include claim transaction states
  const isAnyLoading =
    isLoadingClaimableBalance || isLoadingInvestingTokenBalance || isSubmittingClaim || isConfirmingClaimTx

  useEffect(() => {
    if (isClaimTxConfirmed) {
      setShowSuccessPopup(true)
      refetchVaultTokenBalance?.()
      refetchClaimableAmount?.()
    }
  }, [isClaimTxConfirmed])

  useEffect(() => {
    let message: string | null = null
    if (claimContractWriteError) {
      message = claimContractWriteError.message || 'Failed to send claim transaction.'
      console.error('Claim contract write error:', claimContractWriteError)
      resetClaimContract()
    } else if (claimTxConfirmError) {
      message = claimTxConfirmError.message || 'Claim transaction failed to confirm.'
      console.error('Claim transaction confirm error:', claimTxConfirmError)
      resetClaimContract()
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
    }
  }, [claimContractWriteError, claimTxConfirmError, resetClaimContract])

  const handleClosePopup = () => {
    setShowSuccessPopup(false)
    handleBackFromClaimPreview()
  }

  return (
    <>
      {!showClaimPreview ? (
        <FormContentContainer>
          <FormSectionTitle>
            <Trans>Claimable Amount</Trans>
          </FormSectionTitle>

          {/* Show info badge if claiming is not possible */}
          {!isAnyLoading && !isFetchedClaimableAmountZero && !isClaimingPossible && (
            <InfoBadge>
              <InfoIcon>ℹ️</InfoIcon>
              <Trans>We are processing your withdrawal requests. Please come back later.</Trans>
            </InfoBadge>
          )}

          <Flex
            justifyContent="space-between"
            alignItems="center"
            mt="32px"
            flexDirection={['column', 'row']}
            width={'100%'}
          >
            <Box width={['100%', 'auto']} mb={['16px', '0']}>
              <ExchangeRateInfo>
                <ExchangeRateValue>
                  {displayableFetchedClaimableAmount} {investingTokenSymbol}
                </ExchangeRateValue>
              </ExchangeRateInfo>
            </Box>
            <StyledButtonPrimary
              onClick={handlePreviewClaim}
              disabled={isAnyLoading || isFetchedClaimableAmountZero || !isClaimingPossible || loading}
            >
              {loading ? <Trans>Processing...</Trans> : <Trans>Preview Claim</Trans>}
            </StyledButtonPrimary>
          </Flex>
        </FormContentContainer>
      ) : (
        <ClaimPreview
          vaultAddress={vaultAddress as `0x${string}`}
          investingTokenSymbol={investingTokenSymbol}
          displayableFetchedClaimableAmount={displayableFetchedClaimableAmount}
          platformFeePercentage={platformFeePercentage}
          platformFee={platformFee}
          finalServiceFee={finalServiceFee}
          actualClaimableAmount={actualClaimableAmount}
          termsAccepted={termsAccepted}
          setTermsAccepted={setTermsAccepted}
          handleBackFromClaimPreview={handleBackFromClaimPreview}
          handleClaim={handleClaim}
          isClaimingPossible={isClaimingPossible}
          isAnyLoading={isAnyLoading}
          loading={loading}
          isClaimPending={isSubmittingClaim}
          isConfirming={isConfirmingClaimTx}
        />
      )}

      {showSuccessPopup && <SuccessPopup onClose={handleClosePopup} txHash={claimTxHash} />}
    </>
  )
}
