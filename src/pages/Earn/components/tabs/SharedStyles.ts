import styled from 'styled-components/macro'
import { ButtonPrimary } from 'components/Button'

export const FormContentContainer = styled.div`
  padding: 24px;

  @media (min-width: 768px) {
    padding: 32px 48px;
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
  flex-direction: row-reverse;
  width: 100%;
  justify-content: space-between;

  @media (min-width: 768px) {
    flex-direction: column;
  }
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
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (min-width: 768px) {
    padding: 32px;
  }
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
  text-transform: capitalize;
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
  padding-left: 0 !important;
  margin-left: 0 !important;
`

export const TermsText = styled.div`
  font-size: 13px;
  color: #1f1f1f;

  @media (min-width: 768px) {
    font-size: 14px;
  }
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
  height: 48px;
  border-radius: 6px;
  color: #b8b8cc;
  font-family: Inter;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.26px;
  padding: 0 32px;
  background: transparent;
  border: 1px solid #e8e8e8;
  cursor: pointer;
  width: fit-content;

  &:hover {
    background: #f5f5f5;
  }

  @media (min-width: 768px) {
    min-width: 180px;
  }
`

export const StyledButtonPrimary = styled(ButtonPrimary)`
  height: 48px;
  border-radius: 6px;
  font-size: 14px;
  padding: 0 32px;
  width: 100%;

  @media (min-width: 768px) {
    min-width: 180px;
    width: fit-content;
  }
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

export const Card = styled.div`
  padding: 24px;
  gap: 8px;
  border-radius: 8px;
  background: #f7f7fa;
  width: 100%;

  @media (min-width: 768px) {
    padding: 32px;
  }
`

export const Label = styled.div`
  color: #8f8fb2;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.28px;
`

export const Value = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  text-transform: capitalize;
`
