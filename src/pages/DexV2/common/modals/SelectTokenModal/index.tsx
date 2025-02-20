import Portal from '@reach/portal'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { orderBy } from 'lodash'

import TextInput from '../../TextInput'
import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'
import { useWeb3React } from 'hooks/useWeb3React'
import config, { tokenLists } from 'lib/config'
import { default as erc20Abi } from 'lib/abi/ERC20.json'
import { wagmiConfig } from 'components/Web3Provider'
import { useTokensState } from 'state/dexV2/tokens/hooks'
import { useDispatch } from 'react-redux'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { Box } from 'rebass'
import LoadingIcon from '../../LoadingIcon'
import TokenListItem from './TokenListItem'

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
  const {
    tokens: tokensRaw,
    getToken,
    searchTokens,
    priceFor,
    balanceFor,
    dynamicDataLoading,
    nativeAsset,
    injectTokens,
  } = useTokens()

  const { chainId, provider, account } = useWeb3React()
  const { balances } = useTokensState()
  const dispatch = useDispatch()

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

  async function onSelectToken(token: string): Promise<void> {
    // Todo: Implement onSelectToken
    // if (!getToken(token)) {
    //   await injectTokens([token]);
    // }

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
          </HeaderModal>

          <BodyModal>
            {tokens.length ? (
              <TokenList>
                {tokens.map((token: any) => {
                  return (
                    <div key={token.address} onClick={() => onSelectToken(token.address)}>
                      <TokenListItem key={token.name} token={token} balanceLoading={false} hideBalance={false} />
                    </div>
                  )
                })}
              </TokenList>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="24rem">
                <LoadingIcon />
              </Box>
            )}
          </BodyModal>
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

const TokenItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e6e6ff;
  padding: 0 16px;
  cursor: pointer;

  &:hover {
    background: #f3f3ff;
  }

  &:last-child {
    border-bottom: none;
  }
`

const TokenInfoWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 0;
`

const TokenDetails = styled.div`
  margin-left: 8px;
`

const TokenSymbol = styled.div`
  font-weight: bold;
`

const TokenName = styled.div`
  color: #666;
`

const TokenBalance = styled.div`
  font-weight: bold;
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

const BodyModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
  height: 560px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`
