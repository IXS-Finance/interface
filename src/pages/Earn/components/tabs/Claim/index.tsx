import React from 'react';
import { Trans } from '@lingui/macro';
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
} from '../SharedStyles';

interface ClaimTabProps {
  loading: boolean;
  showClaimPreview: boolean;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  handlePreviewClaim: () => void;
  handleBackFromClaimPreview: () => void;
  handleClaim: () => void;
  claimableAmount: string;
  platformFee: string;
  serviceFee: string;
  actualClaimableAmount: string;
  network?: string;
  vaultAddress?: string;
}

export const ClaimTab: React.FC<ClaimTabProps> = ({
  loading,
  showClaimPreview,
  termsAccepted,
  setTermsAccepted,
  handlePreviewClaim,
  handleBackFromClaimPreview,
  handleClaim,
  claimableAmount,
  platformFee,
  serviceFee,
  actualClaimableAmount,
  network,
  vaultAddress,
}) => {
  return (
    <>
      {!showClaimPreview ? (
        <FormContentContainer>
          <ClaimRow>
            <ClaimLabel>Claimable Amount</ClaimLabel>
            <ClaimAmount>USDC {claimableAmount}</ClaimAmount>
          </ClaimRow>
          
          <StyledButtonPrimary 
            onClick={handlePreviewClaim} 
            disabled={parseFloat(claimableAmount.replace(/,/g, '')) <= 0 || loading}
          >
            {loading ? <Trans>Processing...</Trans> : <Trans>Preview Claim</Trans>}
          </StyledButtonPrimary>
        </FormContentContainer>
      ) : (
        <PreviewContainer>
          <PreviewSection>
            <PreviewTitle>Sent From</PreviewTitle>
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
                <SummaryLabel>Claimable Amount</SummaryLabel>
                <SummaryValue>USDC {claimableAmount}</SummaryValue>
              </SummaryRow>
              
              <SeparatorRow>
                <SeparatorLabel>Less:</SeparatorLabel>
              </SeparatorRow>
              
              <SummaryRow>
                <SummaryLabel>Platform Fee (0.25%)</SummaryLabel>
                <SummaryValue>USDC {platformFee}</SummaryValue>
              </SummaryRow>
              
              <SummaryRow>
                <SummaryLabel>Service Fee</SummaryLabel>
                <SummaryValue>USDC {serviceFee}</SummaryValue>
              </SummaryRow>
              
              <TotalRow>
                <TotalLabel>Actual Claimable Amount</TotalLabel>
                <TotalValue>USDC {actualClaimableAmount}</TotalValue>
              </TotalRow>
            </SummaryTable>
          </PreviewSection>
          
          <TermsContainer>
            <Checkbox 
              type="checkbox" 
              checked={termsAccepted}
              onChange={() => setTermsAccepted(!termsAccepted)}
            />
            <TermsText>
              I agree to the <TermsLink>InvestaX Earn Terms and Conditions</TermsLink>.
            </TermsText>
          </TermsContainer>
          
          <ButtonsRow>
            <BackButton onClick={handleBackFromClaimPreview}>
              Back
            </BackButton>
            <StyledButtonPrimary 
              onClick={handleClaim}
              disabled={!termsAccepted || loading}
            >
              {loading ? 'Processing...' : 'Claim'}
            </StyledButtonPrimary>
          </ButtonsRow>
        </PreviewContainer>
      )}
    </>
  );
}; 