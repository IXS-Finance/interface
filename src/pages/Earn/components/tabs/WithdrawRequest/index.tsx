import React from 'react';
import { Trans } from '@lingui/macro';
import {
  FormContentContainer,
  FormSectionTitle,
  InputContainer,
  InputRow,
  AmountInput,
  CurrencySelector,
  CurrencyText,
  ConversionText,
  BalanceRow,
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
  VaultBalanceInfo,
  WithdrawInfoRow,
} from '../SharedStyles';

interface WithdrawRequestTabProps {
  withdrawAmount: string;
  setWithdrawAmount: (amount: string) => void;
  loading: boolean;
  showWithdrawPreview: boolean;
  termsAccepted: boolean;
  setTermsAccepted: (accepted: boolean) => void;
  handlePreviewWithdraw: () => void;
  handleBackFromWithdrawPreview: () => void;
  handleWithdraw: () => void;
  vaultTokenBalance: string;
  exchangeRate: string;
  getUsdcEquivalent: (vaultAmount: string) => string;
  network?: string;
  vaultAddress?: string;
}

export const WithdrawRequestTab: React.FC<WithdrawRequestTabProps> = ({
  withdrawAmount,
  setWithdrawAmount,
  loading,
  showWithdrawPreview,
  termsAccepted,
  setTermsAccepted,
  handlePreviewWithdraw,
  handleBackFromWithdrawPreview,
  handleWithdraw,
  vaultTokenBalance,
  exchangeRate,
  getUsdcEquivalent,
  network,
  vaultAddress,
}) => {
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
                placeholder="100"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
              <CurrencySelector>
                <CurrencyText>Vault Tokens</CurrencyText>
              </CurrencySelector>
            </InputRow>
            <ConversionText>~USDC {getUsdcEquivalent(withdrawAmount)}</ConversionText>
          </InputContainer>
          
          <BalanceRow>
            <VaultBalanceInfo>
              <BalanceText>
                Vault Token Balance: <BalanceAmount>{vaultTokenBalance}</BalanceAmount>
              </BalanceText>
            </VaultBalanceInfo>
            <MaxButton onClick={() => setWithdrawAmount(vaultTokenBalance.replace(/,/g, ''))}>MAX</MaxButton>
          </BalanceRow>
          
          <WithdrawInfoRow>
            <ExchangeRateInfo>
              <ExchangeRateLabel>Exchange Rate</ExchangeRateLabel>
              <ExchangeRateValue>{exchangeRate}</ExchangeRateValue>
            </ExchangeRateInfo>
          </WithdrawInfoRow>
          
          <StyledButtonPrimary 
            onClick={handlePreviewWithdraw} 
            disabled={!withdrawAmount || parseFloat(withdrawAmount) === 0 || loading}
          >
            {loading ? <Trans>Processing...</Trans> : <Trans>Preview Withdraw Request</Trans>}
          </StyledButtonPrimary>
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
                <SummaryValue>VT {parseFloat(withdrawAmount).toLocaleString('en-US', { minimumFractionDigits: 8, maximumFractionDigits: 8 })}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Exchange Rate</SummaryLabel>
                <SummaryValue>{exchangeRate}</SummaryValue>
              </SummaryRow>
              <SummaryRow>
                <SummaryLabel>Estimated USDC Received</SummaryLabel>
                <SummaryValue>USDC {getUsdcEquivalent(withdrawAmount)}</SummaryValue>
              </SummaryRow>
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
            <BackButton onClick={handleBackFromWithdrawPreview}>
              Back
            </BackButton>
            <StyledButtonPrimary 
              onClick={handleWithdraw}
              disabled={!termsAccepted || loading}
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </StyledButtonPrimary>
          </ButtonsRow>
        </PreviewContainer>
      )}
    </>
  );
}; 