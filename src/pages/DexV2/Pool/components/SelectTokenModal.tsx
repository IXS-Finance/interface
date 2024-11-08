import Portal from '@reach/portal'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { multicall } from '@wagmi/core'
import { formatUnits } from 'viem'

import TextInput from './TextInput'
import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'
import EthIcon from 'assets/images/dex-v2/eth.svg'
import PolIcon from 'assets/images/dex-v2/pol.svg'
import { useWeb3React } from 'hooks/useWeb3React'
import config, { tokenLists } from 'lib/config'
import { default as erc20Abi } from 'lib/abi/ERC20.json'
import { wagmiConfig } from 'components/Web3Provider'

interface SelectTokenModalProps {
  // tokens: string[];
  // onSelect: (token: string) => void;
  onClose: () => void
}

type Token = {
  address: string
  chainId: number
  symbol: string
  name: string
  logoURI: string
  balance: bigint
  decimals: number
}

type TokenList = {
  tokens: Token[]
}

export function formatAmount(amount: number, maximumFractionDigits = 10) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  })
}

const SelectTokenModal: React.FC<SelectTokenModalProps> = ({ onClose }) => {
  const { chainId, provider, account } = useWeb3React()
  const [tokens, setTokens] = useState<Token[]>([])

  const fetchBalances = async () => {
    const tokensList = tokenLists[chainId]
    const addresses = tokensList.map((token: Token) => token.address)

    // @ts-ignore
    const result = await multicall(wagmiConfig, {
      // @ts-ignore
      contracts: addresses.map((address: string) => ({
        address,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account],
      })),
    })

    const balances = result.map((v: any) => v.result)

    const updatedTokens = tokensList.map((token: Token, index: number) => ({
      ...token,
      balance: balances[index],
    }))
    setTokens(updatedTokens)
  }

  useEffect(() => {
    fetchBalances()
  }, [chainId, provider, account])

  console.log('tokens', tokens)

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
              {tokens.map((token: Token) => {
                const balance = formatAmount(+formatUnits(token?.balance, token?.decimals), 2)

                return (
                  <TokenItem key={token.name}>
                    <TokenInfo>
                      <img src={token.logoURI} alt="ETH" width={20} height={20} />
                      <TokenDetails>
                        <TokenSymbol>{token.symbol}</TokenSymbol>
                        <TokenName>{token.name}</TokenName>
                      </TokenDetails>
                    </TokenInfo>
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
  padding: 16px 0;
  border-bottom: 1px solid #e6e6ff;

  &:last-child {
    border-bottom: none;
  }
`

const TokenInfo = styled.div`
  display: flex;
  align-items: center;
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
