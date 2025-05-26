import Portal from '@reach/portal'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { orderBy } from 'lodash'
import { Box, Flex } from 'rebass'

import TextInput from '../../TextInput'
import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import LoadingIcon from '../../LoadingIcon'
import TokenListItem from './TokenListItem'
import Asset from '../../Asset'

interface TabItemProps {
  active?: boolean
}
interface SelectTokenModalProps {
  excludedTokens: string[]
  includeEther?: boolean
  disableInjection?: boolean
  ignoreBalances?: boolean
  subset?: string[]
  updateAddress: (address: string) => void
  onClose: () => void
}

export function formatAmount(amount: number, maximumFractionDigits = 10) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
}

const SelectTokenModal: React.FC<SelectTokenModalProps> = (props) => {
  const { tokens: tokensRaw, getToken, searchTokens, priceFor, balanceFor, nativeAsset } = useTokens()
  const [recentTokens, setRecentTokens] = useState<any[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>([])
  const [loading, setLoading] = useState(false)

  const excludedTokens = [...props.excludedTokens, ...(props.includeEther ? [] : [nativeAsset.address])]

  const tokensWithValues = Object.values(results).map((token: any) => {
    const balance = balanceFor(token.address)
    const price = priceFor(token.address)
    const value = Number(balance) * price
    return {
      ...token,
      price,
      balance,
      value,
    }
  })

  const tokens = props.ignoreBalances
    ? tokensWithValues
    : orderBy(tokensWithValues, ['value', 'balance'], ['desc', 'desc'])

  const addToRecentTokens = (tokenAddress: string) => {
    try {
      const stored = localStorage.getItem('recentTokens') || '[]'
      const recentAddresses = JSON.parse(stored)
      const filteredAddresses = recentAddresses.filter((address: string) => address !== tokenAddress)
      const updatedAddresses = [tokenAddress, ...filteredAddresses].slice(0, 4)
      localStorage.setItem('recentTokens', JSON.stringify(updatedAddresses))
    } catch (error) {
      console.error('Failed to update recent tokens:', error)
    }
  }

  async function onSelectToken(token: string): Promise<void> {
    addToRecentTokens(token)
    props.updateAddress(token)
    props.onClose()
  }

  useEffect(() => {
    async function queryTokens(newQuery: string) {
      setLoading(true)
      const results = await searchTokens(newQuery, {
        excluded: excludedTokens,
        disableInjection: props.disableInjection ? props.disableInjection : false,
        subset: props.subset ? props.subset : [],
      }).finally(() => {
        setLoading(false)
      })
      setResults(results)
    }

    queryTokens(query)
  }, [query, JSON.stringify(tokensRaw)])

  const [activeTab, setActiveTab] = useState('All')

  const tabs = ['All', 'Crypto', 'RWAs']

  const filteredData = () => {
    switch (activeTab) {
      case 'Crypto':
        return tokens.filter((item: any) => item.type === 'crypto')
      case 'RWAs':
        return tokens.filter((item: any) => item.type === 'rwa')
      default:
        return tokens
    }
  }

  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentTokens')
      if (stored) {
        const parsed = JSON.parse(stored)
        const validTokens = parsed.filter((address: string) => tokensRaw[address] !== undefined).slice(0, 4)

        const filteredTokens = validTokens.filter((address: string) => !excludedTokens.includes(address))
        const recentTokenObjects = filteredTokens.map((address: string) => {
          const token = getToken(address)
          const balance = balanceFor(address)
          const price = priceFor(address)

          return {
            ...token,
            balance,
            price,
            value: Number(balance) * price,
          }
        })

        setRecentTokens(recentTokenObjects)
      }
    } catch (error) {
      console.error('Failed to load recent tokens:', error)
    }
  }, [JSON.stringify(tokensRaw)])

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  return (
    <Portal>
      <CenteredFixed width="100vw" height="100vh">
        <ModalContent>
          <HeaderModal>
            <TitleWrapper>
              <Title>Select a token</Title>
              <CloseButton onClick={props.onClose}>
                <CloseIcon />
              </CloseButton>
            </TitleWrapper>
            <TextInput
              placeholder="Search by name, symbol or address"
              value={query}
              autoFocus
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
            />

            {recentTokens && recentTokens.length > 0 ? (
              <TokensContainer>
                {recentTokens.map((token) => (
                  <TokenPill key={token.address} onClick={() => onSelectToken(token.address)}>
                    <Asset address={token.address} iconURI={token.logoURI} size={20} />
                    <Flex fontSize="14px">{token.symbol}</Flex>
                  </TokenPill>
                ))}
              </TokensContainer>
            ) : null}
          </HeaderModal>

          <TabContainer>
            <TabNav>
              {tabs.map((tab) => (
                <TabItem key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)}>
                  {tab}
                </TabItem>
              ))}
            </TabNav>

            <ContentContainer>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="24rem">
                  <LoadingIcon />
                </Box>
              ) : null}

              {filteredData().length ? (
                <TokenList>
                  {filteredData().map((token: any) => {
                    return (
                      <div key={token.address} onClick={() => onSelectToken(token.address)}>
                        <TokenListItem key={token.name} token={token} balanceLoading={false} hideBalance={false} />
                      </div>
                    )
                  })}
                </TokenList>
              ) : null}
            </ContentContainer>
          </TabContainer>
        </ModalContent>
      </CenteredFixed>
    </Portal>
  )
}

export default SelectTokenModal

const TokenList = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: auto;
`

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 480px;
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

const CloseButton = styled.div`
  cursor: pointer;
  color: rgba(41, 41, 51, 0.5);
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const HeaderModal = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
  background: #f3f3ff;
  padding: 32px;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
`

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  height: 400px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  background: white;
  margin-bottom: 32px;
`

const TabContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: #f5f7ff;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`

// Tab navigation bar
const TabNav = styled.div`
  display: flex;
  background: #f3f3ff;
  padding: 0 32px;
`

const TabItem = styled.div<TabItemProps>`
  padding: 16px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  background: ${(props) => (props.active ? '#fff' : '#F3F3FF')};
  color: ${(props) => (props.active ? 'rgba(41, 41, 51, 0.90)' : '#B8B8CC')};
  border-radius: 8px 8px 0 0;
`

const TokensContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
`

const TokenPill = styled.div`
  display: flex;
  padding: 8px 12px 8px 8px;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
`
