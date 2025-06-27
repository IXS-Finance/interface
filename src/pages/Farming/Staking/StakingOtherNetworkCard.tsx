import {  Trans } from '@lingui/macro'
import EthereumRound from 'assets/images/ethereum-round.svg'
import PolygonRound from 'assets/images/polygon-round.svg'
import { Line } from 'components/Line'
import { RowCenter } from 'components/Row'
import { SupportedChainId } from 'constants/chains'
import React, { useMemo } from 'react'
import { isMobile } from 'react-device-detect'
import { DesktopAndTablet, TYPE } from 'theme'
import { OptionList, StakingTierCardWrapper, SwitchNetworkWrap } from './style'
import { useWeb3React } from 'hooks/useWeb3React'

export const StakingOtherNetworkCard = () => {
  const { chainId } = useWeb3React()

  const switchToParams = useMemo(
    () => ({
      [SupportedChainId.MAINNET]: {
        icon: PolygonRound,
        name: `polygon`,
        options: [`1 month — 18% APY`, `2 month — 44% APY`, `3 month — 88% APY`],
        switchTitle: `other pools on polygon`,
      },
      [SupportedChainId.KOVAN]: {
        icon: PolygonRound,
        name: `polygon`,
        options: [`1 month — 18% APY`, `2 month — 44% APY`, `3 month — 88% APY`],
        switchTitle: `other pools on polygon`,
      },
      [SupportedChainId.MATIC]: {
        icon: EthereumRound,
        name: `ethereum`,
        options: [`2 month — 44% APY`, `3 month — 88% APY`],
        switchTitle: `other pools on ethereum`,
      },
      [SupportedChainId.MUMBAI]: {
        icon: EthereumRound,
        name: `ethereum`,
        options: [],
        switchTitle: `other pools on ethereum`,
      },
      [SupportedChainId.AMOY]: {
        icon: EthereumRound,
        name: `ethereum`,
        options: [],
        switchTitle: `other pools on ethereum`,
      },
      [SupportedChainId.BASE_SEPOLIA]: {
        icon: EthereumRound,
        name: `ethereum`,
        options: [],
        switchTitle: `other pools on ethereum`,
      },
      [SupportedChainId.BASE]: {
        icon: EthereumRound,
        name: `ethereum`,
        options: [],
        switchTitle: `other pools on ethereum`,
      },
      [SupportedChainId.OZEAN_TESTNET]: {
        icon: EthereumRound,
        name: `ethereum`,
        options: [],
        switchTitle: `other pools on ethereum`,
      },
      [SupportedChainId.KAIA]: {
        icon: EthereumRound,
        name: `ethereum`,
        options: [],
        switchTitle: `other pools on ethereum`,
      },
      [SupportedChainId.KAIROS_TESTNET]: {
        icon: EthereumRound,
        name: `ethereum`,
        options: [],
        switchTitle: `other pools on ethereum`,
      },
    }),
    []
  )

  const computedSwitchToParams = useMemo(() => {
    if (chainId) {
      // @ts-ignore
      return switchToParams[chainId as SupportedChainId]
    }
    return null
  }, [chainId, switchToParams])

  if (computedSwitchToParams?.options?.length === 0) {
    return null
  }
  return (
    <StakingTierCardWrapper className="semi-muted">
      <RowCenter style={{ marginTop: '8px' }}>
        <img src={computedSwitchToParams?.icon} />
      </RowCenter>
      {chainId && (
        <RowCenter marginTop={18}>
          <TYPE.title5 lineHeight={'27px'} style={{ textTransform: 'uppercase', textAlign: 'center' }}>
            <Trans>{computedSwitchToParams?.switchTitle}</Trans>
          </TYPE.title5>
        </RowCenter>
      )}
      <DesktopAndTablet>
        <RowCenter marginTop={25} marginBottom={18}>
          <Line style={{ width: '84px' }} />
        </RowCenter>
      </DesktopAndTablet>
      <RowCenter>
        <TYPE.body1 fontWeight={400} style={{ textAlign: 'center' }}>
          <Trans>Staking options:</Trans>
          <OptionList>
            {computedSwitchToParams?.options?.map((key: any) => (
              <li key={key}>
                <Trans>{key}</Trans>
              </li>
            ))}
          </OptionList>
        </TYPE.body1>
      </RowCenter>
      {isMobile && (
        <SwitchNetworkWrap>
          <TYPE.body1 fontWeight={400} style={{ width: '10rem', textAlign: 'center' }}>
            <Trans>Switch to Polygon in your Web3 browser</Trans>
          </TYPE.body1>
        </SwitchNetworkWrap>
      )}
    </StakingTierCardWrapper>
  )
}
