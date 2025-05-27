import React from 'react'
import { Trans } from '@lingui/macro'
import {
  FormContentContainer,
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
  SeparatorRow,
  SeparatorLabel,
  TotalRow,
  TotalLabel,
  TotalValue,
  ClaimRow,
  ClaimLabel,
  ClaimAmount,
} from '../SharedStyles'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatUnits } from 'viem'
import VaultABI from '../../../abis/Vault.json' // Adjusted path
import ERC20ABI from 'abis/erc20.json' // Add ERC20 ABI import
import { formatAmount } from 'utils/formatCurrencyAmount' // Assuming alias or correct path
import { useMemo } from 'react'

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
          <ClaimRow>
            <ClaimLabel>Claimable Amount</ClaimLabel>
            <ClaimAmount>
              {investingTokenSymbol} {displayableFetchedClaimableAmount}
            </ClaimAmount>
          </ClaimRow>

          {/* Show warning if claiming is not possible */}
          {!isAnyLoading && !isFetchedClaimableAmountZero && !isClaimingPossible && (
            <div style={{ color: 'red', marginBottom: '1rem', fontSize: '14px' }}>
              <Trans>We are processing your withdrawal requests. Please come back later.</Trans>
            </div>
          )}

          <StyledButtonPrimary
            onClick={handlePreviewClaim}
            disabled={isAnyLoading || isFetchedClaimableAmountZero || !isClaimingPossible || loading}
          >
            {loading ? <Trans>Processing...</Trans> : <Trans>Preview Claim</Trans>}
          </StyledButtonPrimary>
        </FormContentContainer>
      ) : (
        <PreviewContainer>
          <PreviewSection>
            <PreviewTitle>Sent From</PreviewTitle>
            <AddressBox>{vaultAddress}</AddressBox>
          </PreviewSection>

          <PreviewSection>
            <PreviewTitle>Network</PreviewTitle>
            <AddressBox>{network}</AddressBox>
          </PreviewSection>

          <PreviewSection>
            <PreviewTitle>Summary</PreviewTitle>
            <SummaryTable>
              <SummaryRow>
                <SummaryLabel>Claimable Amount</SummaryLabel>
                <SummaryValue>
                  {investingTokenSymbol} {displayableFetchedClaimableAmount}
                </SummaryValue>
              </SummaryRow>

              <SeparatorRow>
                <SeparatorLabel>Less:</SeparatorLabel>
              </SeparatorRow>

              <SummaryRow>
                <SummaryLabel>Platform Fee ({platformFeePercentage}%)</SummaryLabel>
                <SummaryValue>
                  {investingTokenSymbol} {platformFee}
                </SummaryValue>
              </SummaryRow>

              <SummaryRow>
                <SummaryLabel>Service Fee</SummaryLabel>
                <SummaryValue>
                  {investingTokenSymbol} {finalServiceFee}
                </SummaryValue>
              </SummaryRow>

              <TotalRow>
                <TotalLabel>Actual Claimable Amount</TotalLabel>
                <TotalValue>
                  {investingTokenSymbol} {actualClaimableAmount}
                </TotalValue>
              </TotalRow>
            </SummaryTable>
          </PreviewSection>

          <TermsContainer>
            <Checkbox type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
            <TermsText>
              I agree to the <TermsLink>IXS Earn Terms and Conditions</TermsLink>.
            </TermsText>
          </TermsContainer>

          <ButtonsRow>
            <BackButton onClick={handleBackFromClaimPreview}>Back</BackButton>
            <StyledButtonPrimary onClick={handleClaim} disabled={!termsAccepted || !isClaimingPossible || isAnyLoading}>
              {isClaimPending ? 'Initiating...' : isConfirming ? 'Confirming...' : loading ? 'Processing...' : 'Claim'}
            </StyledButtonPrimary>
          </ButtonsRow>
        </PreviewContainer>
      )}
    </>
  )
}

