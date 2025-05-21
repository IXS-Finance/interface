import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { format } from 'date-fns'
import { darken } from 'polished'

import { useActiveWeb3React } from 'hooks/web3'
import { ButtonPrimary } from 'components/Button'
import { HighlightedInput } from 'components/earn/styled'

// Import the Treasury.png image
import TreasuryImg from './images/Treasury.png'

// Token icon
import USDCIcon from '../../assets/images/usdcNew.svg'

// Mock data for demonstration
interface EarnProduct {
  id: string
  name: string
  asset: string
  apy: number
  description: string
  iconUrl: string | null
  tvl?: number
  underlyingAsset?: string
}

interface Transaction {
  date: Date
  type: string
  tokenSymbol: string
  amount: number
  hash: string
}

// Custom page wrapper to avoid dependency on components/Page
const PageWrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
`

// Custom Text component to replace rebass Text
const Text = styled.div<{
  fontSize?: number
  fontWeight?: number
  color?: string
  mb?: number
  mt?: number
}>`
  font-size: ${({ fontSize }) => fontSize ? `${fontSize}px` : '16px'};
  font-weight: ${({ fontWeight }) => fontWeight || 400};
  color: ${({ color, theme }) => {
    // Only use direct color values that don't try to access theme properties
    return color || theme.text1;
  }};
  margin-bottom: ${({ mb }) => mb ? `${mb}px` : 0};
  margin-top: ${({ mt }) => mt ? `${mt}px` : 0};
`

// Custom Flex component to replace rebass Flex
const Flex = styled.div<{
  justifyContent?: string
  alignItems?: string
  mb?: number
  gap?: number
  mt?: number
}>`
  display: flex;
  justify-content: ${({ justifyContent }) => justifyContent || 'flex-start'};
  align-items: ${({ alignItems }) => alignItems || 'stretch'};
  margin-bottom: ${({ mb }) => mb ? `${mb}px` : 0};
  margin-top: ${({ mt }) => mt ? `${mt}px` : 0};
  gap: ${({ gap }) => gap ? `${gap}px` : 0};
`

// Styled Components - move these before the component

// Hero section with Treasury image
const HeroSection = styled.div`
  display: flex;
  margin-bottom: 40px;
  align-items: center;
  background-color: #F8F9FF;
  border-radius: 20px;
  padding: 0;
  overflow: hidden;
  position: relative;
  min-height: 340px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    min-height: 400px;
  }
`

const ContentWrapper = styled.div`
  padding: 60px;
  flex: 1;
  z-index: 1;
  width: 50%;
  
  @media (max-width: 768px) {
    padding: 40px;
    width: 100%;
  }
`

const MainTitle = styled.h1`
  font-size: 64px;
  line-height: 1.1;
  font-weight: 600;
  margin: 0 0 32px 0;
  color: #1F1F1F;
  max-width: 480px;
  
  @media (max-width: 768px) {
    font-size: 52px;
  }
`

const TokenInfoRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
`

const FlexibleTermText = styled.span`
  font-size: 18px;
  color: #666666;
  margin-right: 16px;
`

const TokenIconCircle = styled.div`
  width: 32px;
  height: 32px;
  background-color: #FFFFFF;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border: 1px solid #E6E6E6;
  
  img {
    width: 20px;
    height: 20px;
  }
`

const LearnMoreLink = styled.a`
  color: #6C5DD3;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`

const TreasuryImage = styled.img`
  height: 100%;
  position: absolute;
  right: 0;
  top: 0;
  max-height: none;
  width: auto;
  max-width: 55%;
  
  @media (max-width: 768px) {
    position: relative;
    width: 100%;
    max-width: 100%;
    height: auto;
  }
`

// Info cards section
const InfoCardsSection = styled.div`
  display: flex;
  margin-bottom: 40px;
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #E6EAF5;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.03);
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const InfoCard = styled.div`
  flex: 1;
  position: relative;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 180px;
  
  &:first-child {
    border-right: 1px solid #E6EAF5;
  }
`

const InfoCardLabel = styled.div`
  font-size: 16px;
  color: #7E829B;
  margin-bottom: 8px;
`

const InfoCardValue = styled.div`
  font-size: 32px;
  font-weight: 600;
  color: #1F1F1F;
`

const AssetIcon = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 32px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F7FF;
  border-radius: 50%;
  
  img {
    width: 24px;
    height: 24px;
  }
`

const ApySmallText = styled.div`
  position: absolute;
  top: 28px;
  right: 32px;
  font-size: 16px;
  font-weight: 500;
  color: #7E829B;
`

const ApyBigText = styled.div`
  color: #6C5DD3;
  font-size: 50px;
  font-weight: 700;
  line-height: 0.9;
  margin-top: 8px;
  margin-bottom: 8px;
  
  @media (max-width: 1100px) {
    font-size: 45px;
  }
  
  @media (max-width: 768px) {
    font-size: 50px;
  }
`

const ApySubLabel = styled.div`
  font-size: 14px;
  color: #7E829B;
`

// Forms and other styled components
const FormContainer = styled.div`
  border: 1px solid #E8E8E8;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 48px;
  background: #FFFFFF;
`

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #E8E8E8;
`

const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 16px 0;
  font-size: 16px;
  font-weight: 500;
  background: transparent;
  color: ${({ active }) => active ? '#1F1F1F' : '#7E829B'};
  border: none;
  cursor: pointer;
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${({ active }) => active ? '#6C5DD3' : 'transparent'};
  }
  
  &:hover {
    color: ${({ active }) => active ? '#1F1F1F' : '#333333'};
  }
`

const FormContentContainer = styled.div`
  padding: 32px;
`

const FormSectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1F1F1F;
`

const InputContainer = styled.div`
  background-color: #F5F5F5;
  border-radius: 12px;
  padding: 0;
  margin-bottom: 8px;
`

const InputRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
`

const AmountInput = styled.input`
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
`

const CurrencySelector = styled.div`
  display: flex;
  align-items: center;
  background: white;
  border-radius: 25px;
  padding: 8px 16px;
  cursor: pointer;
`

const CurrencyIcon = styled.div`
  width: 24px;
  height: 24px;
  margin-right: 8px;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`

const CurrencyText = styled.div`
  font-weight: 500;
  color: #1F1F1F;
  margin-right: 4px;
`

const ConversionText = styled.div`
  font-size: 14px;
  color: #7E829B;
  padding: 0 24px 16px;
`

const BalanceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 48px;
  padding: 0 24px;
`

const BalanceText = styled.div`
  font-size: 14px;
  color: #7E829B;
`

const BalanceAmount = styled.span`
  font-weight: 500;
  color: #1F1F1F;
`

const MaxButton = styled.button`
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
`

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  
  @media (max-width: 768px) {
    margin-top: 24px;
  }
`

const ExchangeRateInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const ExchangeRateLabel = styled.div`
  font-size: 14px;
  color: #7E829B;
`

const ExchangeRateValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1F1F1F;
`

const DepositButton = styled(ButtonPrimary)`
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  padding: 0 32px;
  width: 100%;
  max-width: 230px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`

const TransactionsSection = styled.div`
  margin-top: 48px;
`

const TransactionsFilterRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
`

const FilterField = styled.div`
  display: flex;
  flex-direction: column;
`

const FilterLabel = styled.label`
  font-size: 14px;
  color: #666666;
  margin-bottom: 8px;
`

const FilterInput = styled.input`
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #6C5DD3;
  }
`

const TransactionsTable = styled.div`
  width: 100%;
  margin-bottom: 24px;
`

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 16px 0;
  border-bottom: 1px solid #E8E8E8;
`

const HeaderCell = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #666666;
`

const TransactionRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 16px 0;
  border-bottom: 1px solid #F5F5F5;
`

const Cell = styled.div`
  font-size: 14px;
`

const CurrencyDisplay = styled.div`
  display: flex;
  align-items: center;
`

const SmallCurrencyIcon = styled.div`
  width: 16px;
  height: 16px;
  margin-right: 8px;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
  }
`

const HashDisplay = styled.div`
  display: flex;
  align-items: center;
`

const CopyIcon = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  margin-left: 8px;
  padding: 0;
  
  img {
    width: 16px;
    height: 16px;
  }
`

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const PageInfo = styled.div`
  font-size: 14px;
  color: #666666;
`

const PageControls = styled.div`
  display: flex;
  gap: 8px;
`

const PageButton = styled.button<{ disabled?: boolean }>`
  border: 1px solid #E8E8E8;
  background: white;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  opacity: ${({ disabled }) => disabled ? 0.5 : 1};
  
  &:hover {
    background: ${({ disabled }) => disabled ? 'white' : '#F5F5F5'};
  }
`

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
`

// Add components for deposit preview
const PreviewContainer = styled.div`
  padding: 32px;
`

const PreviewSection = styled.div`
  margin-bottom: 32px;
`

const PreviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1F1F1F;
  margin-bottom: 16px;
`

const AddressBox = styled.div`
  background-color: #F5F5F5;
  border-radius: 12px;
  padding: 16px;
  font-size: 16px;
  color: #1F1F1F;
  width: 100%;
`

const SummaryTable = styled.div`
  width: 100%;
`

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
`

const SummaryLabel = styled.div`
  font-size: 16px;
  color: #1F1F1F;
`

const SummaryValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1F1F1F;
  text-align: right;
  
  ${({ color }: { color?: string }) => color && `color: ${color};`}
`

const TermsContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
`

const Checkbox = styled.input`
  margin-right: 8px;
  width: 20px;
  height: 20px;
  cursor: pointer;
`

const TermsText = styled.div`
  font-size: 14px;
  color: #1F1F1F;
`

const TermsLink = styled.span`
  color: #6C5DD3;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`

const ButtonsRow = styled.div`
  display: flex;
  gap: 16px;
`

const BackButton = styled.button`
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
`

const ApproveButton = styled(ButtonPrimary)`
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  padding: 0 32px;
  flex: 1;
`

// Add additional styled components for withdraw tab
const VaultBalanceInfo = styled.div`
  display: flex;
  align-items: center;
`

const WithdrawInfoRow = styled.div`
  margin-bottom: 32px;
`

const WithdrawButtonContainer = styled.div`
  width: 100%;
`

const WithdrawButton = styled(ButtonPrimary)`
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  width: 100%;
`

// Add additional styled components for the claim tab
const ClaimRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;
`

const ClaimLabel = styled.div`
  font-size: 16px;
  color: #1F1F1F;
  font-weight: 500;
`

const ClaimAmount = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1F1F1F;
`

const ClaimButtonContainer = styled.div`
  width: 100%;
`

const ClaimButton = styled(ButtonPrimary)`
  height: 56px;
  border-radius: 12px;
  font-size: 16px;
  width: 100%;
`

// Additional styled components for the claim preview UI
const SeparatorRow = styled.div`
  display: flex;
  margin-top: 16px;
  margin-bottom: 8px;
`

const SeparatorLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1F1F1F;
`

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #E6E6E6;
`

const TotalLabel = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #1F1F1F;
`

const TotalValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1F1F1F;
  text-align: right;
`

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { account } = useActiveWeb3React()
  
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'claim'>('deposit')
  const [amount, setAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showWithdrawPreview, setShowWithdrawPreview] = useState(false)
  const [showClaimPreview, setShowClaimPreview] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  
  // Mock data for the product
  const product: EarnProduct = {
    id: 'treasury-bill',
    name: 'U.S. Treasury Backed Yield',
    asset: 'USDC',
    apy: 4.0,
    description: 'Flexible Term USDC Vault',
    iconUrl: null,
    underlyingAsset: 'U.S. Treasury Bill'
  }
  
  // Mock balance data
  const vaultTokenBalance = '2,889.764278'
  const exchangeRate = '1.03832404'
  const claimableAmount = '1,038.324045'
  const platformFee = '2.595810'  // 0.25% fee
  const serviceFee = '0.000000'
  const actualClaimableAmount = '1,035.728235'  // Claimable minus fees
  
  // Mock transactions
  const transactions: Transaction[] = [
    {
      date: new Date('2023-06-05 08:54:00'),
      type: 'Deposit',
      tokenSymbol: 'USDC',
      amount: 5500,
      hash: '0x0a1...fe65'
    },
    {
      date: new Date('2023-06-04 08:54:00'),
      type: 'Deposit',
      tokenSymbol: 'USDC',
      amount: 2400,
      hash: '0x0a1...fe55'
    },
    {
      date: new Date('2023-06-04 08:54:00'),
      type: 'Deposit',
      tokenSymbol: 'USDC',
      amount: 2000,
      hash: '0x0a1...fe45'
    },
    {
      date: new Date('2023-06-02 08:54:00'),
      type: 'Deposit',
      tokenSymbol: 'USDC',
      amount: 8300,
      hash: '0x0a1...fe35'
    }
  ]
  
  const handleDeposit = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Here we would normally call a contract function
      alert(`Deposited ${amount} ${product.asset}`)
      setShowPreview(false)
    }, 1500)
  }
  
  const handlePreviewDeposit = () => {
    setShowPreview(true)
  }
  
  const handleBackFromPreview = () => {
    setShowPreview(false)
  }
  
  const handlePreviewWithdraw = () => {
    setShowWithdrawPreview(true)
  }
  
  const handleBackFromWithdrawPreview = () => {
    setShowWithdrawPreview(false)
  }
  
  const handleWithdraw = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Here we would normally call a contract function
      alert(`Withdrawing ${withdrawAmount} Vault Tokens`)
      setShowWithdrawPreview(false)
    }, 1500)
  }
  
  const handlePreviewClaim = () => {
    setShowClaimPreview(true)
  }
  
  const handleBackFromClaimPreview = () => {
    setShowClaimPreview(false)
  }
  
  const handleClaim = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      // Here we would normally call a contract function
      alert(`Claimed ${actualClaimableAmount} USDC`)
      setShowClaimPreview(false)
    }, 1500)
  }
  
  const handleTabChange = (tab: 'deposit' | 'withdraw' | 'claim') => {
    setActiveTab(tab)
    setAmount('')
    setWithdrawAmount('')
    setShowPreview(false)
    setShowWithdrawPreview(false)
    setShowClaimPreview(false)
    setTermsAccepted(false)
  }
  
  // Calculate the converted USDC amount from vault tokens
  const getUsdcEquivalent = (vaultAmount: string) => {
    if (!vaultAmount || isNaN(parseFloat(vaultAmount))) return '0';
    return (parseFloat(vaultAmount) * parseFloat(exchangeRate)).toFixed(6);
  }
  
  return (
    <PageWrapper>
      {/* Header section with product title and description */}
      <HeroSection>
        <ContentWrapper>
          <MainTitle>U.S. Treasury<br />Backed Yield</MainTitle>
          
          <TokenInfoRow>
            <TokenIconCircle>
              <img src={USDCIcon} alt="USDC" />
            </TokenIconCircle>
            <FlexibleTermText>Flexible Term USDC Vault</FlexibleTermText>
            <LearnMoreLink href="#">Learn more</LearnMoreLink>
          </TokenInfoRow>
        </ContentWrapper>
        <TreasuryImage src={TreasuryImg} alt="Treasury illustration" />
      </HeroSection>
      
      {/* Info Cards Section */}
      <InfoCardsSection>
        <InfoCard>
          <InfoCardLabel>Underlying Asset</InfoCardLabel>
          <InfoCardValue>{product.underlyingAsset}</InfoCardValue>
          <AssetIcon>
            <img src="/images/icons/building.svg" alt="Building icon" />
          </AssetIcon>
        </InfoCard>
        
        <InfoCard>
          <InfoCardLabel>Annual Percentage Rate</InfoCardLabel>
          <ApySmallText>{product.apy.toFixed(1)}%</ApySmallText>
          <ApyBigText>{product.apy.toFixed(3)}%</ApyBigText>
          <ApySubLabel>Annual Percentage Rate</ApySubLabel>
        </InfoCard>
      </InfoCardsSection>
      
      <FormContainer>
        <TabsContainer>
          <TabButton
            active={activeTab === 'deposit'} 
            onClick={() => handleTabChange('deposit')}
          >
            <Trans>Deposit</Trans>
          </TabButton>
          <TabButton
            active={activeTab === 'withdraw'} 
            onClick={() => handleTabChange('withdraw')}
          >
            <Trans>Withdraw Request</Trans>
          </TabButton>
          <TabButton
            active={activeTab === 'claim'} 
            onClick={() => handleTabChange('claim')}
          >
            <Trans>Claim</Trans>
          </TabButton>
        </TabsContainer>
        
        {activeTab === 'deposit' ? (
          !showPreview ? (
            <FormContentContainer>
              <FormSectionTitle>
                <Trans>Deposit Amount</Trans>
              </FormSectionTitle>
              
              <InputContainer>
                <InputRow>
                  <AmountInput
                    placeholder="10,500.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <CurrencySelector>
                    <CurrencyIcon>
                      <img src={USDCIcon} alt="USDC" />
                    </CurrencyIcon>
                    <CurrencyText>USDC</CurrencyText>
                  </CurrencySelector>
                </InputRow>
                <ConversionText>~$10,449.32</ConversionText>
              </InputContainer>
              
              <BalanceRow>
                <div></div>
                <BalanceText>
                  Balance: <BalanceAmount>18,225.00</BalanceAmount>
                  <MaxButton onClick={() => setAmount('18225')}>MAX</MaxButton>
                </BalanceText>
              </BalanceRow>
              
              <ActionRow>
                <ExchangeRateInfo>
                  <ExchangeRateLabel>Exchange Rate</ExchangeRateLabel>
                  <ExchangeRateValue>$3.87</ExchangeRateValue>
                </ExchangeRateInfo>
                
                <DepositButton 
                  onClick={handlePreviewDeposit} 
                  disabled={!amount || loading}
                >
                  {loading ? <Trans>Processing...</Trans> : <Trans>Preview Deposit</Trans>}
                </DepositButton>
              </ActionRow>
            </FormContentContainer>
          ) : (
            <PreviewContainer>
              <PreviewSection>
                <PreviewTitle>Request Made To</PreviewTitle>
                <AddressBox>0×510E94...e56370</AddressBox>
              </PreviewSection>
              
              <PreviewSection>
                <PreviewTitle>Summary</PreviewTitle>
                <SummaryTable>
                  <SummaryRow>
                    <SummaryLabel>Deposit Amount</SummaryLabel>
                    <SummaryValue>USDC {parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</SummaryValue>
                  </SummaryRow>
                  <SummaryRow>
                    <SummaryLabel>Exchange Rate</SummaryLabel>
                    <SummaryValue>1.03832404</SummaryValue>
                  </SummaryRow>
                  <SummaryRow>
                    <SummaryLabel>Estimated Vault Tokens Received</SummaryLabel>
                    <SummaryValue>VT {(parseFloat(amount) / 1.03832404).toLocaleString('en-US', { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</SummaryValue>
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
                <BackButton onClick={handleBackFromPreview}>
                  Back
                </BackButton>
                <ApproveButton 
                  onClick={handleDeposit}
                  disabled={!termsAccepted || loading}
                >
                  {loading ? 'Processing...' : 'Approve and Deposit'}
                </ApproveButton>
              </ButtonsRow>
            </PreviewContainer>
          )
        ) : activeTab === 'withdraw' ? (
          !showWithdrawPreview ? (
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
                <MaxButton onClick={() => setWithdrawAmount('100')}>MAX</MaxButton>
              </BalanceRow>
              
              <WithdrawInfoRow>
                <ExchangeRateInfo>
                  <ExchangeRateLabel>Exchange Rate</ExchangeRateLabel>
                  <ExchangeRateValue>{exchangeRate}</ExchangeRateValue>
                </ExchangeRateInfo>
              </WithdrawInfoRow>
              
              <WithdrawButtonContainer>
                <WithdrawButton 
                  onClick={handlePreviewWithdraw} 
                  disabled={!withdrawAmount || loading}
                >
                  {loading ? <Trans>Processing...</Trans> : <Trans>Preview Withdraw Request</Trans>}
                </WithdrawButton>
              </WithdrawButtonContainer>
            </FormContentContainer>
          ) : (
            <PreviewContainer>
              <PreviewSection>
                <PreviewTitle>Request Made To</PreviewTitle>
                <AddressBox>0×510E94...e56370</AddressBox>
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
                <ApproveButton 
                  onClick={handleWithdraw}
                  disabled={!termsAccepted || loading}
                >
                  {loading ? 'Processing...' : 'Withdraw'}
                </ApproveButton>
              </ButtonsRow>
            </PreviewContainer>
          )
        ) : (
          // Claim tab
          !showClaimPreview ? (
            <FormContentContainer>
              <ClaimRow>
                <ClaimLabel>Claimable Amount</ClaimLabel>
                <ClaimAmount>USDC {claimableAmount}</ClaimAmount>
              </ClaimRow>
              
              <ClaimButtonContainer>
                <ClaimButton 
                  onClick={handlePreviewClaim} 
                  disabled={parseFloat(claimableAmount.replace(/,/g, '')) <= 0 || loading}
                >
                  {loading ? <Trans>Processing...</Trans> : <Trans>Preview Claim</Trans>}
                </ClaimButton>
              </ClaimButtonContainer>
            </FormContentContainer>
          ) : (
            <PreviewContainer>
              <PreviewSection>
                <PreviewTitle>Sent From</PreviewTitle>
                <AddressBox>0×510E94...e56370</AddressBox>
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
                <ApproveButton 
                  onClick={handleClaim}
                  disabled={!termsAccepted || loading}
                >
                  {loading ? 'Processing...' : 'Claim'}
                </ApproveButton>
              </ButtonsRow>
            </PreviewContainer>
          )
        )}
      </FormContainer>
      
      {/* Transactions Section */}
      <TransactionsSection>
        <SectionTitle>
          <Trans>Transactions</Trans>
        </SectionTitle>
        
        <TransactionsTable>
          <TableHeader>
            <HeaderCell>Date</HeaderCell>
            <HeaderCell>Token Symbol</HeaderCell>
            <HeaderCell>Deposit Amount</HeaderCell>
            <HeaderCell>Transaction Hash</HeaderCell>
          </TableHeader>
          
          {transactions.map((tx: Transaction, index: number) => (
            <TransactionRow key={index}>
              <Cell>{format(tx.date, 'dd MMM yyyy HH:mm')}</Cell>
              <Cell>
                <CurrencyDisplay>
                  <SmallCurrencyIcon>
                    <img src={USDCIcon} alt="USDC" />
                  </SmallCurrencyIcon>
                  {tx.tokenSymbol}
                </CurrencyDisplay>
              </Cell>
              <Cell>{tx.amount.toLocaleString()}.00</Cell>
              <Cell>
                <HashDisplay>
                  {tx.hash}
                  <CopyIcon>
                    <img src="/images/icons/copy.svg" alt="Copy" />
                  </CopyIcon>
                </HashDisplay>
              </Cell>
            </TransactionRow>
          ))}
        </TransactionsTable>
        
        <Pagination>
          <PageInfo>1-5 of 45</PageInfo>
          <PageControls>
            <PageButton disabled>&lt;</PageButton>
            <PageButton>&gt;</PageButton>
          </PageControls>
        </Pagination>
      </TransactionsSection>
    </PageWrapper>
  )
} 