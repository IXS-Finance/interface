import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { format } from 'date-fns'
import { useReadContract } from 'wagmi'
import { formatUnits } from 'viem'
import Portal from '@reach/portal'

import { useActiveWeb3React } from 'hooks/web3'
import { EarnProduct, products } from './products'
import { useSubgraphQuery } from 'hooks/useSubgraphQuery'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { DepositTab } from './components/tabs/Deposit'
import { WithdrawRequestTab } from './components/tabs/WithdrawRequest'
import { ClaimTab } from './components/tabs/Claim'
import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'
import { checkWrongChain } from 'utils/chains'
import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { NetworkNotAvailable } from 'components/Launchpad/NetworkNotAvailable'

import OpenTradeABI from './abis/OpenTrade.json'
import TreasuryImg from './images/Treasury.png'
import USDCIcon from '../../assets/images/usdcNew.svg'
import { Box } from 'rebass'
interface Transaction {
  date: number
  type: string
  tokenSymbol: string
  amount: string
  hash: string
}

const POLLING_INTERVAL: number = 5000

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const history = useHistory()
  const { account, chainId } = useActiveWeb3React()

  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'claim'>('deposit')
  const [amount, setAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showWithdrawPreview, setShowWithdrawPreview] = useState(false)
  const [showClaimPreview, setShowClaimPreview] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const product = products.find((p) => p.id === id) as EarnProduct

  const network = product.network ?? ''
  const { isWrongChain, expectChain } = checkWrongChain(chainId, network)

  const {
    data: rawRate, // This will be the raw data from the contract (likely a BigInt)
    error: fetchRateError, // Error object if the hook fails
  } = useReadContract({
    abi: OpenTradeABI,
    address: product?.opentradeVaultAddress as `0x${string}` | undefined,
    functionName: 'exchangeRate',
    chainId: chainId,
    query: {
      // Only enable the query if the address and chainId are available
      enabled: !!(product?.opentradeVaultAddress && chainId),
    },
  })

  // Derived state for the formatted exchange rate
  const openTradeExchangeRate = React.useMemo<string | undefined>(() => {
    if (rawRate) {
      try {
        // Assuming rawRate is BigInt and the exchange rate has 18 decimals
        return formatAmount(Number(formatUnits(rawRate as bigint, 18) || 0), 4)
      } catch (e) {
        console.error('Error formatting exchange rate:', e)
        return // Handle potential formatting errors
      }
    }
    return
  }, [rawRate])

  // Subgraph Queries
  const userAddress = account?.toLowerCase()

  const DEPOSITS_QUERY = `
    query {
      deposits(
        where: { user: "${userAddress}" }
        orderBy: timestamp
        orderDirection: desc
      ) {
        amount
        timestamp
        transactionHash
      }
    }
  `

  const WITHDRAWS_QUERY = `
    query {
      withdraws(
        where: { user: "${userAddress}" }
        orderBy: timestamp
        orderDirection: desc
      ) {
        amount
        timestamp
        transactionHash
      }
    }
  `

  const CLAIMS_QUERY = `
    query {
      claims(
        where: { user: "${userAddress}" }
        orderBy: timestamp
        orderDirection: desc
      ) {
        amountClaimed
        timestamp
        transactionHash
      }
    }
  `
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Fetching data based on active tab
  let query = ''
  if (activeTab === 'deposit') {
    query = DEPOSITS_QUERY
  } else if (activeTab === 'withdraw') {
    query = WITHDRAWS_QUERY
  } else if (activeTab === 'claim') {
    query = CLAIMS_QUERY
  }

  const subgraphData = useSubgraphQuery({
    feature: 'EARN_V2_TREASURY',
    chainId: chainId,
    query: query,
    autoPolling: true,
    pollingInterval: POLLING_INTERVAL,
  })

  React.useEffect(() => {
    if (subgraphData && account && chainId) {
      let formattedTransactions: Transaction[] = []
      if (activeTab === 'deposit' && subgraphData.deposits) {
        formattedTransactions = subgraphData.deposits.map((tx: any) => ({
          date: parseInt(tx.timestamp, 10),
          type: 'Deposit',
          tokenSymbol: product?.investingTokenSymbol,
          amount: formatAmount(Number(formatUnits(tx.amount, product?.investingTokenDecimals || 0)), 6),
          hash: tx.transactionHash,
        }))
      } else if (activeTab === 'withdraw' && subgraphData.withdraws) {
        formattedTransactions = subgraphData.withdraws.map((tx: any) => ({
          date: parseInt(tx.timestamp, 10),
          type: 'Withdraw',
          tokenSymbol: product?.investingTokenSymbol,
          amount: formatAmount(Number(formatUnits(tx.amount, product?.investingTokenDecimals || 0)), 6),
          hash: tx.transactionHash,
        }))
      } else if (activeTab === 'claim' && subgraphData.claims) {
        formattedTransactions = subgraphData.claims.map((tx: any) => ({
          date: parseInt(tx.timestamp, 10),
          type: 'Claim',
          tokenSymbol: product?.investingTokenSymbol,
          amount: formatAmount(Number(formatUnits(tx.amountClaimed, product?.investingTokenDecimals || 0)), 6),
          hash: tx.transactionHash,
        }))
      }
      setTransactions(formattedTransactions)
    } else {
      setTransactions([])
    }
  }, [subgraphData, activeTab, product?.investingTokenSymbol, product?.investingTokenDecimals, account, chainId])

  // Handle case when product is not found
  if (!product) {
    // Redirect to products list or show error
    return (
      <PageWrapper>
        <Text fontSize={24} fontWeight={600} mb={20}>
          Product not found
        </Text>
        <LearnMoreLink onClick={() => history.push('/earn')}>Return to products</LearnMoreLink>
      </PageWrapper>
    )
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

  const handlePreviewClaim = () => {
    setShowClaimPreview(true)
  }

  const handleBackFromClaimPreview = () => {
    setShowClaimPreview(false)
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
    const currentExchangeRate = openTradeExchangeRate || '0' // Use fetched rate, fallback to '0'
    if (!vaultAmount || isNaN(parseFloat(vaultAmount)) || isNaN(parseFloat(currentExchangeRate))) return '0'
    return (parseFloat(vaultAmount) * parseFloat(currentExchangeRate)).toFixed(6)
  }

  return (
    <PageWrapper>
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {account && chainId && isWrongChain ? (
          <Portal>
            <CenteredFixed width="100vw" height="100vh">
              <NetworkNotAvailable expectChainId={expectChain} />
            </CenteredFixed>
          </Portal>
        ) : null}

        {/* Header section with product title and description */}
        <HeroSection>
          <ContentWrapper>
            <MainTitle>{product.name}</MainTitle>

            <TokenInfoRow>
              <TokenIconCircle>
                <img src={USDCIcon} alt="USDC" />
              </TokenIconCircle>
              <div>
                <FlexibleTermText>{product.description}</FlexibleTermText>
                <div>
                  <LearnMoreLink href="#">Learn more</LearnMoreLink>
                </div>
              </div>
            </TokenInfoRow>
          </ContentWrapper>

          {product?.iconUrl ? <TreasuryImage src={product?.bgFullUrl} alt="right-icon" /> : null}
        </HeroSection>

        {/* Info Cards Section */}
        <InfoCardsSection>
          <InfoCard>
            <div>
              <InfoCardValue>{product.underlyingAsset}</InfoCardValue>
              <InfoCardLabel>Underlying Asset</InfoCardLabel>
            </div>

            {product.iconUrl ? (
              <div>
                <img src={product.iconUrl} alt={product.underlyingAsset} />
              </div>
            ) : null}
          </InfoCard>

          <InfoCard>
            <InfoCardLabel>Annual Percentage Rate</InfoCardLabel>
            <ApyBigText>
              {product.apy.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              %
            </ApyBigText>
          </InfoCard>
        </InfoCardsSection>

        <FormContainer>
          <Box css={{ borderBottom: '1px solid #e8e8e8' }}>
            <TabsContainer>
              <TabButton active={activeTab === 'deposit'} onClick={() => handleTabChange('deposit')}>
                <Trans>Deposit</Trans>
              </TabButton>
              <TabButton active={activeTab === 'withdraw'} onClick={() => handleTabChange('withdraw')}>
                <Trans>Withdraw</Trans>
              </TabButton>
              <TabButton active={activeTab === 'claim'} onClick={() => handleTabChange('claim')}>
                <Trans>Claim</Trans>
              </TabButton>
            </TabsContainer>
          </Box>

          {activeTab === 'deposit' && (
            <DepositTab
              amount={amount}
              setAmount={setAmount}
              loading={loading}
              showPreview={showPreview}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              handlePreviewDeposit={handlePreviewDeposit}
              handleBackFromPreview={handleBackFromPreview}
              productAsset={product?.investingTokenSymbol}
              network={product.network}
              investingTokenAddress={product.investingTokenAddress} // USDC on Polygon
              vaultAddress={product.address} // Vault contract address
              exchangeRate={openTradeExchangeRate}
              investingTokenDecimals={product.investingTokenDecimals}
              chainId={chainId}
            />
          )}

          {activeTab === 'withdraw' && (
            <WithdrawRequestTab
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              loading={loading}
              showWithdrawPreview={showWithdrawPreview}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              handlePreviewWithdraw={handlePreviewWithdraw}
              handleBackFromWithdrawPreview={handleBackFromWithdrawPreview}
              exchangeRate={openTradeExchangeRate || '0'}
              getUsdcEquivalent={getUsdcEquivalent}
              vaultAddress={product.address}
            />
          )}

          {activeTab === 'claim' && (
            <ClaimTab
              loading={loading}
              showClaimPreview={showClaimPreview}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              handlePreviewClaim={handlePreviewClaim}
              handleBackFromClaimPreview={handleBackFromClaimPreview}
              vaultAddress={product.address}
              investingTokenAddress={product.investingTokenAddress}
              investingTokenSymbol={product.asset}
            />
          )}
        </FormContainer>
      </div>

      <TransactionWrapper>
        <TransactionsSection>
          <SectionTitle>
            <Trans>Transactions</Trans>
          </SectionTitle>

          <TransactionsTable>
            <TableHeader columns={5}>
              <HeaderCell>Date</HeaderCell>
              <HeaderCell>Type</HeaderCell>
              <HeaderCell>Token Symbol</HeaderCell>
              <HeaderCell>Amount</HeaderCell>
              <HeaderCell>Transaction Hash</HeaderCell>
            </TableHeader>

            {transactions.length > 0 ? (
              transactions.map((tx: Transaction, index: number) => (
                <TransactionRow key={index} columns={5}>
                  <Cell>{format(new Date(tx.date * 1000), 'dd MMM yyyy HH:mm')}</Cell>
                  <Cell>{tx.type}</Cell>
                  <Cell>
                    <CurrencyDisplay>
                      <SmallCurrencyIcon>
                        <img src={USDCIcon} alt={tx.tokenSymbol} />
                      </SmallCurrencyIcon>
                      {tx.tokenSymbol}
                    </CurrencyDisplay>
                  </Cell>
                  <Cell>{tx.amount}</Cell>
                  <Cell>
                    <HashDisplay>
                      <a
                        href={getExplorerLink(chainId, tx.hash, ExplorerDataType.TRANSACTION)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                      </a>
                    </HashDisplay>
                  </Cell>
                </TransactionRow>
              ))
            ) : (
              <NoTransactionsRow columns={5}>
                No {activeTab} transactions found yet.
                {activeTab === 'deposit' && ' Make your first deposit to get started!'}
                {activeTab === 'withdraw' && " You haven't made any withdrawal requests yet."}
                {activeTab === 'claim' && " You don't have any claims to show yet."}
              </NoTransactionsRow>
            )}
          </TransactionsTable>

          <Pagination>
            <PageInfo>1-5 of 45</PageInfo>
            <PageControls>
              <PageButton disabled>&lt;</PageButton>
              <PageButton>&gt;</PageButton>
            </PageControls>
          </Pagination>
        </TransactionsSection>
      </TransactionWrapper>
    </PageWrapper>
  )
}

const PageWrapper = styled.div`
  width: 100%;
`

// Custom Text component to replace rebass Text
const Text = styled.div<{
  fontSize?: number
  fontWeight?: number
  color?: string
  mb?: number
  mt?: number
}>`
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : '16px')};
  font-weight: ${({ fontWeight }) => fontWeight || 400};
  color: ${({ color, theme }) => {
    // Only use direct color values that don't try to access theme properties
    return color || theme.text1
  }};
  margin-bottom: ${({ mb }) => (mb ? `${mb}px` : 0)};
  margin-top: ${({ mt }) => (mt ? `${mt}px` : 0)};
`


const HeroSection = styled.div`
  display: flex;
  margin-bottom: 40px;
  align-items: center;
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
  flex: 1;
  z-index: 1;
  width: 50%;

  @media (max-width: 768px) {
    width: 100%;
  }
`

const MainTitle = styled.h1`
  line-height: 1.1;
  font-weight: 700;
  margin: 0 0 32px 0;
  color: #1f1f1f;
  max-width: 480px;
  font-size: 52px;

  @media (min-width: 768px) {
    font-size: 64px;
    max-width: 576px;
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
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border: 1px solid #e6e6e6;

  img {
    width: 20px;
    height: 20px;
  }
`

const LearnMoreLink = styled.a`
  color: #6c5dd3;
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
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`

const InfoCard = styled.div`
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
  display: flex;
  padding: 40px;
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  align-self: stretch;
`

const InfoCardLabel = styled.div`
  font-size: 16px;
  color: #7e829b;
`

const InfoCardValue = styled.div`
  font-size: 32px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 8px;
`

const ApyBigText = styled.div`
  color: #6c5dd3;
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

// Forms and other styled components
const FormContainer = styled.div`
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
`

const TabsContainer = styled.div`
  display: flex;

  @media (min-width: 768px) {
    max-width: 420px;
  }
`

const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 31px 0;
  font-size: 16px;
  font-weight: 500;
  background: transparent;
  color: ${({ active }) => (active ? '#1F1F1F' : '#7E829B')};
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
    background-color: ${({ active }) => (active ? '#6C5DD3' : 'transparent')};
  }

  &:hover {
    color: ${({ active }) => (active ? '#1F1F1F' : '#333333')};
  }
`

const TransactionWrapper = styled.div`
  margin-top: 48px;
  background: #fff;
  padding: 24px 0;

  @media (min-width: 768px) {
    margin-top: 80px;
    padding: 80px 0;
  }
`

const TransactionsSection = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const TransactionsTable = styled.div`
  width: 100%;
  margin-bottom: 24px;
`

const TableHeader = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 4}, 1fr)`};
  padding: 16px 0;
  border-bottom: 1px solid #e8e8e8;
`

const HeaderCell = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #666666;
`

const TransactionRow = styled.div<{ columns?: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns || 4}, 1fr)`};
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
`

const NoTransactionsRow = styled(TransactionRow)`
  grid-column: span ${({ columns }) => columns || 4};
  text-align: center;
  color: #7e829b;
  padding: 48px 0;
  font-size: 16px;
  background: #f8f9ff;
  border-radius: 8px;
  margin: 16px 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
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
  border: 1px solid #e8e8e8;
  background: white;
  border-radius: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};

  &:hover {
    background: ${({ disabled }) => (disabled ? 'white' : '#F5F5F5')};
  }
`

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 24px;
`
