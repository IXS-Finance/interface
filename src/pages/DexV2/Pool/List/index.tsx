import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { Trans } from '@lingui/macro'
import { useDispatch } from 'react-redux'
import { Flex } from 'rebass'

import { MEDIA_WIDTHS, TYPE } from 'theme'
import styled from 'styled-components'
import Filters from './Filters'
import PoolList from './PoolList'
import { FilterProvider } from './FilterProvider'
import bannerImg from 'assets/images/dex-v2/liquidity-pool-banner.png'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { fetchTokenLists } from 'state/dexV2/tokenLists'

import { routes } from 'utils/routes'

export default function LiquidityPool() {
  const { isWalletReady } = useWeb3()
  const dispatch = useDispatch()
  const history = useHistory()

  useEffect(() => {
    dispatch(fetchTokenLists())
  }, [isWalletReady])

  return (
    <FilterProvider>
      <Pager>
        <BannerContainer>
          <BannerContent>
            <Flex flexDirection="column" alignItems="flex-start" justifyContent="center">
              <div className="title">
                Liquidity
                <br /> Innovation.
              </div>
              <div className="desc">
                Liquidity Providers make low-slippage swaps
                <br /> possible. Deposit and Stake liquidity to earn IXS.
              </div>
            </Flex>
          </BannerContent>
        </BannerContainer>
        <PageContainer>
          <Flex justifyContent="space-between" alignItems="center">
            <TYPE.title4 marginBottom="30px" data-testid="liquidityPoolTitle">
              <Trans>Liquidity Pools</Trans>
            </TYPE.title4>

            <Button onClick={() => history.push(routes.dexV2CreatePool)}>+ Create Pool</Button>
          </Flex>

          <Filters />
          <PoolList />
        </PageContainer>
      </Pager>
    </FilterProvider>
  )
}

const BannerContainer = styled.div`
  background-image: url(${bannerImg});
  background-size: contain;
  background-position: right 50px;
  background-repeat: no-repeat;
  height: 620px;
  width: 100%;
  margin-bottom: 30px;
  background-color: #f4f4ff;
  margin-top: -8px;
`

const Pager = styled.div`
  background-color: #ffffff;
  width: 100vw;
  @media (max-width: ${MEDIA_WIDTHS.upToSmall}px) {
    padding: 0rem;
  }
`

const BannerContent = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  justify-content: center;
  height: 100%;
  max-width: ${(props) => props.theme.launchpad.content.maxWidth};
  margin: auto;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-height: calc(100vh - 64px);
    width: 100%;
  `}

  .title {
    color: #292933;
    font-family: Inter;
    font-size: 80px;
    font-style: normal;
    font-weight: 800;
    line-height: 110%; /* 88px */
    letter-spacing: -3.2px;
  }

  .desc {
    color: #8f8fb2;
    font-family: Inter;
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 160%; /* 25.6px */
    letter-spacing: -0.32px;
  }
`

const PageContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  justify-content: flex-start;
  align-items: stretch;
  max-width: ${(props) => props.theme.launchpad.content.maxWidth};
  margin: auto;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-height: calc(100vh - 64px);
    width: 100%;
  `}
`

const Button = styled.button`
  display: flex;
  width: 153px;
  height: 48px;
  padding: 12px 16px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1px;
  border-radius: 6px;
  background: #66f;
  color: #fff;
  font-family: Inter;
  font-size: 13px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.26px;
  border: none;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    transition: transform 0.5s;
  }
`
