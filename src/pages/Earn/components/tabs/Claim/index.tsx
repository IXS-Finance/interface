import React from 'react'
import { Trans } from '@lingui/macro'
import { FormContentContainer, StyledButtonPrimary, Card, Value } from '../SharedStyles'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits } from 'viem'
import VaultABI from '../../../abis/Vault.json' // Adjusted path
import ERC20ABI from 'abis/erc20.json' // Add ERC20 ABI import
import { formatAmount } from 'utils/formatCurrencyAmount' // Assuming alias or correct path
import { useMemo } from 'react'
import styled from 'styled-components'
import { Flex } from 'rebass'
import { Label } from '@rebass/forms'
import { FormSectionTitle } from '../../AmountInput'
import ClaimPreview from './ClaimPreview'

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
  network?: string
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
  serviceFee,
  network,
  vaultAddress,
  investingTokenAddress,
  investingTokenSymbol = 'USDC',
}) => {
  const { address } = useAccount()

  // Add platform fee hook
  const { data: platformFeeBps } = usePlatformFee(vaultAddress as `0x${string}`)

  // Add service fee hook
  const { data: claimFlatFee } = useServiceFee(vaultAddress as `0x${string}`)

  console.log('claimFlatFee', claimFlatFee)
  console.log('platformFeeBps', platformFeeBps)
  console.log('vaultAddress', vaultAddress)

  // Add write contract hook for claiming
  const { writeContract, data: hash, isPending: isClaimPending } = useWriteContract()

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const { data: rawUserAssetBalance, isLoading: isLoadingClaimableBalance } = useReadContract({
    abi: VaultABI.abi,
    address: vaultAddress as `0x${string}`,
    functionName: 'userAssetBalances', // Assuming this is the correct function name for claimable amount
    args: [address],
    query: {
      enabled: !!vaultAddress && !!address,
    },
  })

  const { data: investingTokenBalance, isLoading: isLoadingInvestingTokenBalance } = useReadContract({
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
      return formatAmount(parseFloat(formatted), 2)
    }
    return formatAmount(0, 2)
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
  const isAnyLoading = isLoadingClaimableBalance || isLoadingInvestingTokenBalance || isClaimPending || isConfirming

  return (
    <>
      {!showClaimPreview ? (
        <FormContentContainer>
          <Card>
            <Flex flexDirection={['column', 'row']} justifyContent="space-between" alignItems="center">
              <FormSectionTitle>Claimable Amount</FormSectionTitle>
              <Value>
                {displayableFetchedClaimableAmount} {investingTokenSymbol}
              </Value>
            </Flex>
          </Card>

          {/* Show info badge if claiming is not possible */}
          {!isAnyLoading && !isFetchedClaimableAmountZero && !isClaimingPossible && (
            <InfoBadge>
              <InfoIcon>ℹ️</InfoIcon>
              <Trans>We are processing your withdrawal requests. Please come back later.</Trans>
            </InfoBadge>
          )}

          <Flex justifyContent="flex-end" alignItems="center" mt={3}>
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
          network={network as string}
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
          isClaimPending={isClaimPending}
          isConfirming={isConfirming}
          loading={loading}
        />
      )}
    </>
  )
}
