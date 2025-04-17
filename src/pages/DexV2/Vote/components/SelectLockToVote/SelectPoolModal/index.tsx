import Portal from '@reach/portal'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { orderBy } from 'lodash'

import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { ReactComponent as CloseIcon } from 'assets/images/dex-v2/close.svg'
import { useWeb3React } from 'hooks/useWeb3React'
import { useTokensState } from 'state/dexV2/tokens/hooks'
import { useDispatch } from 'react-redux'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { Box, Flex } from 'rebass'
import TokenListItem from './TokenListItem'
import TextInput from 'pages/DexV2/common/TextInput'
import LoadingIcon from 'pages/DexV2/common/LoadingIcon'
import { PoolsHasGauge } from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'
import AssetSet from 'pages/DexV2/common/AssetSet'
import useVote from 'state/dexV2/vote/useVote'
import { PoolToken } from 'state/dexV2/vote'

interface SelectPoolModalProps {
  pools: PoolsHasGauge[]
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

const SelectPoolModal: React.FC<SelectPoolModalProps> = (props) => {
  const { pools, excludedTokens } = props

  const { addPoolToken } = useVote()

  const excludedSet = new Set(excludedTokens.map((token) => token.toLowerCase()))
  const finalPools = pools.filter((pool) => !excludedSet.has(pool.address.toLowerCase()))

  const [query, setQuery] = useState('')

  async function onSelectToken(token: PoolsHasGauge): Promise<void> {
    const paramToken: PoolToken = {
      tokenAddress: token.address,
      weight: 0,
      isLocked: false,
      id: token.id,
      tokensList: token.tokensList,
      name: token.name,
    }

    addPoolToken(paramToken)
    props.onClose()
  }

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
            {finalPools.length ? (
              <TokenList>
                {finalPools.map((pool: PoolsHasGauge) => {
                  return (
                    <ItemContainer key={pool.id} onClick={() => onSelectToken(pool)}>
                      <Flex css={{ gap: '8px' }} alignItems="center">
                        <AssetSet addresses={pool.tokensList} width={50} />
                        <Box color="#292933" fontSize="14px" fontWeight={600}>
                          {pool.name}
                        </Box>
                      </Flex>
                    </ItemContainer>
                  )
                })}
              </TokenList>
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="24rem">
                <Box color="#B8B8D2" fontSize="14px" fontWeight={500}>
                  No results found
                </Box>
              </Box>
            )}
          </BodyModal>
        </ModalContent>
      </CenteredFixed>
    </Portal>
  )
}

export default SelectPoolModal

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

const BodyModal = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
  height: 560px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
`

const ItemContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22px 16px;

  margin: 0 32px;
  font-size: 1rem; /* text-base */
  cursor: pointer;
  border-bottom: 1px solid #e6e6ff; // add border-bottom

  &:hover {
    background-color: #eff6ff; /* blue-50 */
    border-radius: 8px;
  }

  .w-14 {
    width: 3.5rem;
  }

  .h-4 {
    height: 1rem;
  }
`
