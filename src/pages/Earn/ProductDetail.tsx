import React, { useEffect, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import styled from 'styled-components/macro'
import { Trans } from '@lingui/macro'
import { format } from 'date-fns'
import { formatUnits } from 'viem'
import Portal from '@reach/portal'
import { Copy, ExternalLink, Link } from 'react-feather'
import _get from 'lodash/get'

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
import USDCIcon from '../../assets/images/usdcNew.svg'
import { Box, Flex } from 'rebass'
import { isMobile } from 'react-device-detect'
import { useMulticall } from './hooks/useMulticall'
import LoadingBlock from './components/LoadingBlock'
interface Transaction {
  date: number
  type: string
  tokenSymbol: string
  amount: string
  hash: string
}

const POLLING_INTERVAL: number = 10000

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

  console.log('Product Detail Page', { product, id, chainId })
  const network = product.network ?? ''
  const { isWrongChain, expectChain } = checkWrongChain(chainId, network)

  const openTradeContract = {
    address: product?.opentradeVaultAddress as `0x${string}` | undefined,
    abi: OpenTradeABI,
  } as const

  const { data, isLoading: isLoadingGetRate } = useMulticall(
    chainId,
    [
      {
        ...openTradeContract,
        functionName: 'exchangeRate',
      },
      {
        ...openTradeContract,
        functionName: 'getPoolDynamicOverviewState',
      },
    ],
    {
      enabled: true,
    }
  )

  const [exchangeRate, poolDynamicOverviewState]: any = data || []
  const exchangeRateResult = exchangeRate?.result
  const poolDynamicOverviewStateResult = poolDynamicOverviewState?.result
  const indicativeInterestRate = (poolDynamicOverviewStateResult?.indicativeInterestRate || 0).toString()
  const indicativeInterestRatePercentage = (parseFloat(indicativeInterestRate) / 100).toFixed(2)

  // Derived state for the formatted exchange rate
  const openTradeExchangeRate = React.useMemo<string | undefined>(() => {
    if (exchangeRateResult) {
      try {
        // Assuming rawRate is BigInt and the exchange rate has 18 decimals
        return formatAmount(Number(formatUnits(exchangeRateResult as bigint, 18) || 0), 4)
      } catch (e) {
        console.error('Error formatting exchange rate:', e)
        return // Handle potential formatting errors
      }
    }
    return
  }, [exchangeRateResult])

  // Subgraph Queries
  const userAddress = account?.toLowerCase()
  const fromContract = _get(product, 'address', '').toLowerCase()

  const DEPOSITS_QUERY = `
    query {
      deposits(
        where: { user: "${userAddress}", fromContract: "${fromContract}" }
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
        where: { user: "${userAddress}", fromContract: "${fromContract}" }
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
        where: { user: "${userAddress}", fromContract: "${fromContract}" }
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
    feature: product.subgraphFeatureType,
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

        console.log('formattedTransactions', formattedTransactions)
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

  useEffect(() => {
    setTransactions([]) // Reset transactions when account or chainId changes
  }, [account, chainId])

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
                  <LearnMoreLink href={product.learnMoreUrl} target="_blank" rel="noopener noreferrer">
                    Learn more
                  </LearnMoreLink>
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

            {isLoadingGetRate ? (
              <LoadingBlock className="rate-number" />
            ) : (
              <ApyBigText>{indicativeInterestRatePercentage}%</ApyBigText>
            )}
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

          {activeTab === 'deposit' ? (
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
              type={product.type}
              minimumDeposit={product.minimumDeposit}
            />
          ) : null}

          {activeTab === 'withdraw' ? (
            <WithdrawRequestTab
              withdrawAmount={withdrawAmount}
              setWithdrawAmount={setWithdrawAmount}
              loading={loading}
              network={product.network}
              showWithdrawPreview={showWithdrawPreview}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              handlePreviewWithdraw={handlePreviewWithdraw}
              handleBackFromWithdrawPreview={handleBackFromWithdrawPreview}
              exchangeRate={openTradeExchangeRate || '0'}
              getUsdcEquivalent={getUsdcEquivalent}
              vaultAddress={product.address}
              minimumDeposit={product.minimumDeposit}
              chainId={chainId}
              type={product.type}
            />
          ) : null}

          {activeTab === 'claim' ? (
            <ClaimTab
              loading={loading}
              showClaimPreview={showClaimPreview}
              termsAccepted={termsAccepted}
              setTermsAccepted={setTermsAccepted}
              handlePreviewClaim={handlePreviewClaim}
              handleBackFromClaimPreview={handleBackFromClaimPreview}
              vaultAddress={product.address}
              investingTokenAddress={product.investingTokenAddress}
              chainId={chainId}
              type={product.type}
            />
          ) : null}
        </FormContainer>
      </div>

      <TransactionWrapper>
        <TransactionsSection>
          <SectionTitle>
            <Trans>Transactions</Trans>
          </SectionTitle>

          <TransactionsTable>
            <TableHeader columns={isMobile ? 2 : 5}>
              <HeaderCell>Date</HeaderCell>
              {!isMobile ? <HeaderCell>Type</HeaderCell> : null}
              {!isMobile ? <HeaderCell>Token Symbol</HeaderCell> : null}
              <Box
                textAlign={['right', 'left']}
                css={{ fontSize: '14px', fontWeight: 500, color: '#666666', textTransform: 'capitalize' }}
              >
                {isMobile ? `${activeTab} ` : null}Amount
              </Box>
              {!isMobile ? <HeaderCell>Transaction Hash</HeaderCell> : null}
            </TableHeader>

            {transactions.length > 0 ? (
              transactions.map((tx: Transaction, index: number) => (
                <TransactionRow key={index} columns={isMobile ? 2 : 5}>
                  <Cell>{format(new Date(tx.date * 1000), 'dd MMM yyyy HH:mm')}</Cell>
                  {!isMobile ? <Cell>{tx.type}</Cell> : null}
                  {!isMobile ? (
                    <Cell>
                      <CurrencyDisplay>
                        <SmallCurrencyIcon>
                          <img src={USDCIcon} alt={tx.tokenSymbol} />
                        </SmallCurrencyIcon>
                        {tx.tokenSymbol}
                      </CurrencyDisplay>
                    </Cell>
                  ) : null}
                  <Box fontSize="14px" textAlign={['right', 'left']}>
                    {isMobile ? (
                      <Flex justifyContent="flex-end" alignItems="center" width={'100%'}>
                        <CurrencyDisplay>
                          <SmallCurrencyIcon>
                            <img src={USDCIcon} alt={tx.tokenSymbol} />
                          </SmallCurrencyIcon>
                          {tx.amount}
                        </CurrencyDisplay>
                      </Flex>
                    ) : (
                      <>{tx.amount}</>
                    )}
                  </Box>
                  {!isMobile ? (
                    <Cell>
                      <HashDisplay>
                        <a
                          href={getExplorerLink(chainId, tx.hash, ExplorerDataType.TRANSACTION)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ textDecoration: 'none', color: '#6C5DD3' }}
                        >
                          {tx.hash.substring(0, 6)}...{tx.hash.substring(tx.hash.length - 4)}
                          <ExternalLink size={'16'} style={{ marginLeft: 8 }} />
                        </a>
                      </HashDisplay>
                    </Cell>
                  ) : null}
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
        </TransactionsSection>
      </TransactionWrapper>
    </PageWrapper>
  )
}

const PageWrapper = styled.div`
  width: 100%;
  padding: 0px 4px;
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
  color: #292933;
  font-family: Inter;
  font-size: 48px;
  font-style: normal;
  font-weight: 700;
  line-height: 110%; /* 52.8px */
  letter-spacing: -1.92px;

  @media (min-width: 768px) {
    font-size: 64px;
    max-width: 576px;
  }
`

const TokenInfoRow = styled.div`
  display: flex;
  align-items: center;
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
  color: #66f;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
  cursor: pointer;
  margin-top: 4px;
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
  justify-content: space-between;
  align-items: center;
  flex: 1 0 0;
  align-self: stretch;
  padding: 24px;

  @media (min-width: 768px) {
    padding: 40px;
  }

  .rate-number {
    width: 187px;
    height: 60px;
  }
`

const InfoCardLabel = styled.div`
  color: #8f8fb2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.28px;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`

const InfoCardValue = styled.div`
  margin-bottom: 8px;
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`

const ApyBigText = styled.div`
  color: #66f;
  text-align: right;
  font-family: Inter;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 60px; /* 150% */
  letter-spacing: -1.6px;

  @media (min-width: 768px) {
    color: #66f;
    font-size: 64px;
    line-height: 60px; /* 93.75% */
    letter-spacing: -2.56px;
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
  padding: 16px;

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
