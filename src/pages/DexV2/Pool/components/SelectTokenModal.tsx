import Portal from '@reach/portal'
import React from 'react'
import styled from 'styled-components'

import TextInput from './TextInput'
import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'
import EthIcon from 'assets/images/dex-v2/eth.svg'
import PolIcon from 'assets/images/dex-v2/pol.svg'
import { useWeb3React } from 'hooks/useWeb3React'
import config from 'lib/config'

interface SelectTokenModalProps {
  // tokens: string[];
  // onSelect: (token: string) => void;
  onClose: () => void
}

// function mapTokenListTokens(tokenListMap) {
//   const isEmpty = Object.keys(tokenListMap).length === 0;
//   if (isEmpty) return {};

//   const tokens = [...Object.values(tokenListMap)]
//     .map(list => list.tokens)
//     .flat();

//   const tokensMap = tokens.reduce((acc, token) => {
//     const address: string = getAddress(token.address);

//     // Don't include if already included
//     if (acc[address]) return acc;

//     // Don't include if not on app network
//     if (token.chainId !== networkConfig.chainId) return acc;

//     acc[address] = token;
//     return acc;
//   }, {});

//   return tokensMap;
// }

const SelectTokenModal: React.FC<SelectTokenModalProps> = ({ onClose }) => {
  const { chainId } = useWeb3React()
  const networkConfig = config[chainId]
  const tokens = {
    [networkConfig.nativeAsset.address]: {
      ...networkConfig.nativeAsset,
      chainId: networkConfig.chainId,
    },
    // ...mapTokenListTokens(allTokenLists.value),
  }

  console.log('networkConfig', networkConfig)

  console.log('chainId', chainId)
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
              <TokenItem>
                <TokenInfo>
                  <img src={EthIcon} alt="ETH" />
                  <TokenDetails>
                    <TokenSymbol>ETH</TokenSymbol>
                    <TokenName>Ethereum</TokenName>
                  </TokenDetails>
                </TokenInfo>
                <TokenBalance>3.88</TokenBalance>
              </TokenItem>

              <TokenItem>
                <TokenInfo>
                  <img src={PolIcon} alt="POL" />
                  <TokenDetails>
                    <TokenSymbol>POL</TokenSymbol>
                    <TokenName>Polygon</TokenName>
                  </TokenDetails>
                </TokenInfo>
                <TokenBalance>12,554.22</TokenBalance>
              </TokenItem>
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
