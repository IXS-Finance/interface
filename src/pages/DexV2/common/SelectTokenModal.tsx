import Portal from '@reach/portal'
import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { multicall } from '@wagmi/core'
import { formatUnits } from 'viem'
import { orderBy } from 'lodash'

import TextInput from './TextInput'
import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'
import EthIcon from 'assets/images/dex-v2/eth.svg'
import PolIcon from 'assets/images/dex-v2/pol.svg'
import { useWeb3React } from 'hooks/useWeb3React'
import config, { tokenLists } from 'lib/config'
import { default as erc20Abi } from 'lib/abi/ERC20.json'
import { wagmiConfig } from 'components/Web3Provider'
import { useTokensState } from 'state/dexV2/tokens/hooks'
import { useDispatch } from 'react-redux'
import { fetchTokensBalances, fetchTokenPrices } from 'state/dexV2/tokens'

interface SelectTokenModalProps {
  excludedTokens: string[]
  updateAddress: (address: string) => void
  onClose: () => void
}

export function formatAmount(amount: number, maximumFractionDigits = 10) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
}

const SelectTokenModal: React.FC<SelectTokenModalProps> = ({ excludedTokens = [], updateAddress, onClose }) => {
  const { chainId, provider, account } = useWeb3React()
  const { tokens: results, balances } = useTokensState()
  const dispatch = useDispatch()

  const tokens = useMemo(() => {
    let tokensWithValues = Object.values(results).map((token) => {
      // @ts-ignore
      const balance = balances[token.address]
      // const price = priceFor(token.address)
      // const value = Number(balance) * price
      return {
        // @ts-ignore
        ...token,
        // price,
        balance,
        // value,
      }
    })

    tokensWithValues = tokensWithValues.filter((token) => !excludedTokens.includes(token.address))

    // if (ignoreBalances) return tokensWithValues
    // else return orderBy(tokensWithValues, ['value', 'balance'], ['desc', 'desc'])

    // return orderBy(tokensWithValues, ['value', 'balance'], ['desc', 'desc'])

    return tokensWithValues
  }, [results, balances])

  console.log('results', results)

  async function onSelectToken(token: string): Promise<void> {
    // Todo: Implement onSelectToken
    // if (!getToken(token)) {
    //   await injectTokens([token]);
    // }

    updateAddress(token)
    onClose()
  }

  useEffect(() => {
    if (account) {
      dispatch(
        fetchTokensBalances({
          tokens: results,
          account,
        })
      )
      dispatch(fetchTokenPrices(results))
    }
  }, [chainId, provider, account])

  return (
    <Portal>
      <CenteredFixed width="100vw" height="100vh">
        <ModalContent>
          <HeaderModal>
            <TitleWrapper>
              <Title>Select a token</Title>
              <CloseButton onClick={onClose}>
                <CloseIcon />
              </CloseButton>
            </TitleWrapper>
            <TextInput placeholder="Search by name, symbol or address" />
          </HeaderModal>

          <BodyModal>
            <TokenList>
              {tokens.map((token: any) => {
                const balance = token?.balance ? formatAmount(+token?.balance, 2) : ''

                return (
                  <TokenItem key={token.name} onClick={() => onSelectToken(token.address)}>
                    <TokenInfoWrap>
                      <img src={token.logoURI} alt="ETH" width={20} height={20} />
                      <TokenDetails>
                        <TokenSymbol>{token.symbol}</TokenSymbol>
                        <TokenName>{token.name}</TokenName>
                      </TokenDetails>
                    </TokenInfoWrap>
                    <TokenBalance>{balance}</TokenBalance>
                  </TokenItem>
                )
              })}
            </TokenList>
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
  padding: 16px 32px;
  height: 560px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`
