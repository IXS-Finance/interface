import React from 'react'
import {
  PreviewContainer,
  Checkbox,
  TermsText,
  TermsLink,
  BackButton,
  StyledButtonPrimary,
  Card,
  Label,
  Value,
} from '../SharedStyles'
import { Box, Flex } from 'rebass'
import { shortAddress } from 'utils'
import styled from 'styled-components'

interface ClaimPreviewProps {
  vaultAddress: string
  network: string
  investingTokenSymbol: string
  displayableFetchedClaimableAmount: string
  platformFeePercentage: string
  platformFee: string
  finalServiceFee: string
  actualClaimableAmount: string
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
  handleBackFromClaimPreview: () => void
  handleClaim: () => void
  isClaimingPossible: boolean
  isAnyLoading: boolean
  isClaimPending: boolean
  isConfirming: boolean
  loading: boolean
}

const ClaimPreview: React.FC<ClaimPreviewProps> = ({
  vaultAddress,
  network,
  investingTokenSymbol,
  displayableFetchedClaimableAmount,
  platformFeePercentage,
  platformFee,
  finalServiceFee,
  actualClaimableAmount,
  termsAccepted,
  setTermsAccepted,
  handleBackFromClaimPreview,
  handleClaim,
  isClaimingPossible,
  isAnyLoading,
  isClaimPending,
  isConfirming,
  loading,
}) => {
  return (
    <PreviewContainer>
      <Flex
        flexDirection={['column', 'row']}
        css={{
          gap: '16px',
        }}
      >
        <Flex flex={1}>
          <Card>
            <Flex css={{ gap: '8px', flexDirection: 'column' }}>
              <Label>Claimable Amount</Label>
              <Value>
                {investingTokenSymbol} {displayableFetchedClaimableAmount}
              </Value>
            </Flex>
          </Card>
        </Flex>
        <Flex flex={1}>
          <Card>
            <Flex css={{ gap: '8px', flexDirection: 'column' }}>
              <Label>Network</Label>
              <Value>{network}</Value>
            </Flex>
          </Card>
        </Flex>
      </Flex>

      <Card>
        <Flex css={{ gap: '8px', flexDirection: 'column' }}>
          <Label>Sent From</Label>
          <Value>{shortAddress(vaultAddress)}</Value>
        </Flex>
      </Card>

      <Card>
        <Label>Summary</Label>
        <Flex justifyContent="space-between" alignItems="center" css={{ marginTop: '32px' }}>
          <Value>Platform Fee ({platformFeePercentage}%)</Value>
          <Value>
            {investingTokenSymbol} {platformFee}
          </Value>
        </Flex>
        <Box css={{ marginBottom: '16px', borderBottom: '1px solid #E8E8FF', paddingTop: '16px' }} />
        <Flex justifyContent="space-between" alignItems="center" css={{ marginTop: '8px' }}>
          <Value>Service Fee</Value>
          <Value>
            {investingTokenSymbol} {finalServiceFee}
          </Value>
        </Flex>
        <Box css={{ marginBottom: '16px', borderBottom: '1px solid #E8E8FF', paddingTop: '16px' }} />
        <Flex justifyContent="space-between" alignItems="center" css={{ marginTop: '8px' }}>
          <Value>Actual Claimable Amount</Value>
          <Value>
            {investingTokenSymbol} {actualClaimableAmount}
          </Value>
        </Flex>
      </Card>

      <Flex
        flexDirection={['column', 'row']}
        justifyContent="space-between"
        alignItems={['flex-start', 'center']}
        css={{ gap: '16px' }}
      >
        <Flex alignItems="center">
          <Checkbox type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
          <TermsText>
            I agree to the <TermsLink>IXS Earn Terms and Conditions</TermsLink>.
          </TermsText>
        </Flex>

        <Flex
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width={['100%', 'auto']}
          css={{ gap: '16px' }}
        >
          <CustomBackButton onClick={handleBackFromClaimPreview}>Back</CustomBackButton>
          <CustomStyledButtonPrimary onClick={handleClaim} disabled={!termsAccepted || !isClaimingPossible || isAnyLoading}>
            {isClaimPending ? 'Initiating...' : isConfirming ? 'Confirming...' : loading ? 'Processing...' : 'Claim'}
          </CustomStyledButtonPrimary>
        </Flex>
      </Flex>
    </PreviewContainer>
  )
}

const CustomBackButton = styled(BackButton)`
  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
  }
`

const CustomStyledButtonPrimary = styled(StyledButtonPrimary)`
  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
  }
`

export default ClaimPreview
