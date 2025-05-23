import styled from 'styled-components/macro';
import { ButtonPrimary } from 'components/Button';

// Form Content and Structure
export const FormContentContainer = styled.div`
  padding: 32px;
`;

export const FormSectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1F1F1F;
`;

// Input Specific
export const InputContainer = styled.div`
  background-color: #F5F5F5;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 8px;
`;

export const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
`;

export const AmountInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 36px;
  font-weight: 600;
  padding: 0;
  color: #1F1F1F;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #CCCCCC;
  }
`;

export const CurrencySelector = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 25px;
  padding: 8px 16px;
  cursor: pointer;
`;

export const CurrencyIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 8px;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`;

export const CurrencyText = styled.div`
  font-weight: 500;
  color: #1F1F1F;
  margin-right: 4px;
`;

export const ConversionText = styled.div`
  font-size: 14px;
  color: #7E829B;
  padding: 0 24px 16px;
`;

// Balance Specific
export const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 48px;
  padding: 0 24px;
`;

export const BalanceText = styled.div`
  font-size: 14px;
  color: #7E829B;
`;

export const BalanceAmount = styled.span`
  font-weight: 500;
  color: #1F1F1F;
`;

export const MaxButton = styled.button`
  background: transparent;
  color: #6C5DD3;
  border: none;
  font-size: 12px;
  font-weight: 600;
  margin-left: 8px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  
  &:hover {
    background: rgba(108, 93, 211, 0.1);
  }
`;

// Action Row (used for Exchange Rate + Button)
export const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  @media (max-width: 768px) {
    margin-top: 24px;
  }
`;

export const ExchangeRateInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ExchangeRateLabel = styled.div`
  font-size: 14px;
  color: #7E829B;
`;

export const ExchangeRateValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1F1F1F;
`;

// Preview Specific Styles
export const PreviewContainer = styled.div`
  padding: 32px;
`;

export const PreviewSection = styled.div`
  margin-bottom: 32px;
`;

export const PreviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1F1F1F;
  margin-bottom: 16px;
`;

export const AddressBox = styled.div`
  background-color: #F5F5F5;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #1F1F1F;
  width: 100%;
`;

export const SummaryTable = styled.div`
  width: 100%;
`;

export const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const SummaryLabel = styled.div`
  font-size: 16px;
  color: #1F1F1F;
`;

export const SummaryValue = styled.div<{ color?: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${({ color }) => color || '#1F1F1F'};
  text-align: right;
`;

// Terms and Conditions
export const TermsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
`;

export const Checkbox = styled.input`
  margin-right: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

export const TermsText = styled.div`
  font-size: 14px;
  color: #1F1F1F;
`;

export const TermsLink = styled.span`
  color: #6C5DD3;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Buttons
export const ButtonsRow = styled.div`
  display: flex;
  gap: 16px;
`;

export const BackButton = styled.button`
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  padding: 0 32px;
  background: transparent;
  border: 1px solid #E8E8E8;
  color: #1F1F1F;
  cursor: pointer;
  flex: 1;
  
  &:hover {
    background: #F5F5F5;
  }
`;

export const StyledButtonPrimary = styled(ButtonPrimary)`
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  padding: 0 32px;
  flex: 1;
`;

// Specific for Claim Preview
export const SeparatorRow = styled.div`
  display: flex;
  margin-top: 16px;
  margin-bottom: 8px;
`;

export const SeparatorLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1F1F1F;
`;

export const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E6E6E6;
`;

export const TotalLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1F1F1F;
`;

export const TotalValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1F1F1F;
  text-align: right;
`;

// Specific for Claim Tab Main Screen
export const ClaimRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
`;

export const ClaimLabel = styled.div`
  font-size: 16px;
  color: #1F1F1F;
  font-weight: 500;
`;

export const ClaimAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1F1F1F;
`;

// Vault Balance (Withdraw Tab)
export const VaultBalanceInfo = styled.div`
  display: flex;
  align-items: center;
`;

export const WithdrawInfoRow = styled.div`
  margin-bottom: 32px;
`; 