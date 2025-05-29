import styled from 'styled-components/macro'
import { ButtonPrimary } from 'components/Button'

export const FormContentContainer = styled.div`
  padding: 32px;

  @media (min-width: 768px) {
    padding: 32px 48px;
  }
`

export const FormSectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f1f1f;
`

// Input Specific
export const InputContainer = styled.div`
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 8px;
`

export const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px;
`

export const AmountInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  padding: 0;
  color: #292933;
  font-family: Inter;
  font-size: 64px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -1.92px;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: #cccccc;
  }
`

export const CurrencySelector = styled.div`
  display: flex;
  padding: 8px 12px 8px 8px;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  cursor: pointer;
`

export const CurrencyIcon = styled.div`
  width: 24px;
  height: 24px;

  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`

export const CurrencyText = styled.div`
  font-weight: 500;
  color: #1f1f1f;
  margin-right: 4px;
`

export const ConversionText = styled.div`
  font-size: 14px;
  color: #7e829b;
  padding: 0 24px 16px;
`

// Balance Specific
export const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
`

export const BalanceText = styled.div`
  text-align: right;
  font-size: 14px;
  color: #7e829b;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
`

export const BalanceAmount = styled.span`
  font-weight: 500;
  color: #1f1f1f;
`

export const MaxButton = styled.button`
  display: flex;
  padding: 8px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  background: #fff;
  color: #66f;
  font-family: Inter;
  font-size: 9px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.18px;
  border: none;
  cursor: pointer;

  &:hover {
    background: #e0e0e0;
  }
`

// Action Row (used for Exchange Rate + Button)
export const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  @media (max-width: 768px) {
    margin-top: 24px;
  }
`

export const ExchangeRateInfo = styled.div`
  display: flex;
  flex-direction: column;
`

export const ExchangeRateLabel = styled.div`
  color: #8f8fb2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.28px;
`

export const ExchangeRateValue = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

// Preview Specific Styles
export const PreviewContainer = styled.div`
  padding: 32px;
`

export const PreviewSection = styled.div`
  margin-bottom: 32px;
`

export const PreviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 16px;
`

export const AddressBox = styled.div`
  background-color: #f5f5f5;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #1f1f1f;
  width: 100%;
`

export const SummaryTable = styled.div`
  width: 100%;
`

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`

export const SummaryLabel = styled.div`
  font-size: 16px;
  color: #1f1f1f;
`

export const SummaryValue = styled.div<{ color?: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ color }) => color || '#1F1F1F'};
  text-align: right;
`

// Terms and Conditions
export const TermsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
`

export const Checkbox = styled.input`
  margin-right: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`

export const TermsText = styled.div`
  font-size: 14px;
  color: #1f1f1f;
`

export const TermsLink = styled.span`
  color: #6c5dd3;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`

// Buttons
export const ButtonsRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
`

export const BackButton = styled.button`
  height: 56px;
  border-radius: 6px;
  font-size: 16px;
  padding: 0 32px;
  background: transparent;
  border: 1px solid #e8e8e8;
  color: #1f1f1f;
  cursor: pointer;
  min-width: 180px;

  &:hover {
    background: #f5f5f5;
  }
`

export const StyledButtonPrimary = styled(ButtonPrimary)`
  height: 56px;
  border-radius: 6px;
  font-size: 16px;
  padding: 0 32px;
  width: fit-content;
`

// Specific for Claim Preview
export const SeparatorRow = styled.div`
  display: flex;
  margin-top: 16px;
  margin-bottom: 8px;
`

export const SeparatorLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1f1f1f;
`

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e6e6e6;
`

export const TotalLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1f1f1f;
`

export const TotalValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
  text-align: right;
`

// Specific for Claim Tab Main Screen
export const ClaimRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
`

export const ClaimLabel = styled.div`
  font-size: 16px;
  color: #1f1f1f;
  font-weight: 500;
`

export const ClaimAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
`

// Vault Balance (Withdraw Tab)
export const VaultBalanceInfo = styled.div`
  display: flex;
  align-items: center;
`

export const WithdrawInfoRow = styled.div`
  margin-bottom: 32px;
`
