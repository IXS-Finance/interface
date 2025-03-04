import React, { useCallback, useRef } from 'react'
import { Trans } from '@lingui/macro'
import { darken } from 'polished'
import { NavLink } from 'react-router-dom'
import { css } from 'styled-components'
import styled from 'styled-components/macro'

import { ChevronElement } from 'components/ChevronElement'
import Column from 'components/Column'
import { Line } from 'components/Line'
import Popover from 'components/Popover'
import { SupportedChainId } from 'constants/chains'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import useToggle from 'hooks/useToggle'
import { useActiveWeb3React } from 'hooks/web3'
import { ExternalLink } from 'theme'
import { isUserWhitelisted } from 'utils/isUserWhitelisted'
import { routes } from 'utils/routes'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import Row, { RowFixed } from '../Row'
import { useKyc, useRole } from 'state/user/hooks'

const activeClassName = 'ACTIVE'

const HeaderPopover = () => {
  const { config } = useWhitelabelState()
  const stakingUrl = process.env.REACT_APP_STAKING_URL || 'https://staking.ixs.finance'

  const isAllowed = useCallback(
    (path: string): boolean => {
      if (!config || !config.pages || config.pages.length === 0) {
        return true
      }

      return config.pages.includes(path)
    },
    [config]
  )

  return (
    <PopOverContent
      onClick={(e: any) => (e ? e.stopPropagation() : null)}
      onMouseDown={(e: any) => (e ? e.stopPropagation() : null)}
    >
      <Column style={{ gap: 3 }}>
        <SubMenuExternalLink style={{ fontSize: '13px' }} href={stakingUrl || ``}>
          <Trans>Staking on Base</Trans>
        </SubMenuExternalLink>
      </Column>

      <Row style={{ padding: '0', margin: '5px 0' }}>
        <Line />
      </Row>

      <Column style={{ gap: 3 }}>
        {isAllowed(routes.vesting) && (
          <SubMenuLink style={{ fontSize: '13px' }} id={`vesting-nav-link`} to={routes.vesting}>
            <Trans>Token Sale Distribution</Trans>
          </SubMenuLink>
        )}
      </Column>
    </PopOverContent>
  )
}

const DexV2Popover = () => {
  return (
    <PopOverContent
      onClick={(e: any) => (e ? e.stopPropagation() : null)}
      onMouseDown={(e: any) => (e ? e.stopPropagation() : null)}
    >
      <Column style={{ gap: 3 }}>
        <SubMenuLink style={{ fontSize: '13px' }} id={`pools`} to={routes.dexV2Pools}>
          <Trans>Pools</Trans>
        </SubMenuLink>
      </Column>

      <Row style={{ padding: '0', margin: '5px 0' }}>
        <Line />
      </Row>

      <Column style={{ gap: 3 }}>
        <SubMenuLink style={{ fontSize: '13px' }} id={`swap`} to={routes.dexV2Swap}>
          <Trans>Swap</Trans>
        </SubMenuLink>
      </Column>
    </PopOverContent>
  )
}

export const HeaderLinks = () => {
  const [open, toggle] = useToggle(false)
  const [openV2, toggleV2] = useToggle(false)
  const [openNFT, toggleNFT] = useToggle(false)
  const { isApproved } = useKyc()
  const farmNode = useRef<HTMLDivElement>()
  const v2Node = useRef<HTMLDivElement>()
  const nftNode = useRef<HTMLDivElement>()

  const { config } = useWhitelabelState()
  const { chainId, account } = useActiveWeb3React()
  const bridgeUrl = process.env.REACT_APP_BRIDGE_URL || 'https://bridge.ixs.finance'

  useOnClickOutside(farmNode, open ? toggle : undefined)
  useOnClickOutside(v2Node, openV2 ? toggleV2 : undefined)
  useOnClickOutside(nftNode, openNFT ? toggleNFT : undefined)

  const isWhitelisted = isUserWhitelisted({ account, chainId })

  const isAllowed = useCallback(
    (path: string): boolean => {
      if (!config || !config.pages || config.pages.length === 0) {
        return true
      }

      return config.pages.includes(path)
    },
    [config]
  )

  const links = [
    {
      condition: isAllowed('charts') && isWhitelisted,
      component: (
        <MenuExternalLink key="charts" target="_self" href={config?.chartsUrl || 'https://info.ixs.finance/home'}>
          <Trans>Charts</Trans>
        </MenuExternalLink>
      ),
    },
    {
      condition: isAllowed('bridge') && config?.isIxSwap,
      component: (
        <MenuExternalLink key="bridge" target="_blank" href={bridgeUrl}>
          <Trans>Bridge</Trans>
        </MenuExternalLink>
      ),
    },
    {
      condition: true,
      component: (
        <StyledNavLink
          key="launchpad"
          id="issuance-nav-link"
          to="/launchpad"
          isActive={(match, { pathname }) => pathname.includes('lbp/') || pathname.includes('launchpad')}
        >
          <Trans>Launchpad</Trans>
        </StyledNavLink>
      ),
    },
    {
      condition: isAllowed(routes.securityTokens()) && isWhitelisted,
      component: (
        <StyledNavLink
          key="securityTokens"
          data-testid="securityTokensButton"
          id="stake-nav-link"
          to={routes.securityTokens('tokens')}
          isActive={(match, { pathname }) => pathname.includes('security-token')}
        >
          <Trans>RWAs</Trans>
        </StyledNavLink>
      ),
    },
    {
      condition: isAllowed(routes.pool) && isWhitelisted,
      component: (
        <StyledNavLink key="pool" id="pool-nav-link" to={routes.pool}>
          <Trans>Liquidity Pools</Trans>
        </StyledNavLink>
      ),
    },
    {
      condition: isAllowed(routes.swap) && isWhitelisted,
      component: (
        <StyledNavLink key="swap" id="swap-nav-link" to={routes.swap} data-testid="swap-nav-link">
          <Trans>Swap/Trade</Trans>
        </StyledNavLink>
      ),
    },
    {
      condition: isAllowed('staking'),
      component: (
        <StyledNavLink
          key="staking"
          ref={farmNode as any}
          id="farming-nav-link"
          to="#"
          isActive={(match, { pathname }) => pathname.startsWith('/vesting') || pathname.startsWith('/staking')}
        >
          <Popover hideArrow show={open} content={<HeaderPopover />} placement="bottom-start">
            <RowFixed onClick={toggle}>
              <Trans>Staking</Trans>
              <ChevronElement marginLeft={5} showMore={open} />
            </RowFixed>
          </Popover>
        </StyledNavLink>
      ),
    },
    {
      condition: isAllowed(routes.swap) && isWhitelisted,
      component: (
        <StyledNavLink
          key="v2"
          ref={v2Node as any}
          id="farming-nav-link"
          to="#"
          isActive={(match, { pathname }) => pathname.startsWith('/v2')}
        >
          <Popover hideArrow show={openV2} content={<DexV2Popover />} placement="bottom-start">
            <RowFixed onClick={toggleV2}>
              <Trans>Dex V2</Trans>
              <ChevronElement marginLeft={5} showMore={open} />
            </RowFixed>
          </Popover>
        </StyledNavLink>
      ),
    },
    {
      condition: isAllowed(routes.faucet) && chainId === SupportedChainId.KOVAN && isWhitelisted,
      component: (
        <StyledNavLink key="faucet" disabled={!isApproved} id="faucet-nav-link" to={routes.faucet}>
          <Trans>Faucet</Trans>
        </StyledNavLink>
      ),
    },
  ]

  return (
    <HeaderLinksWrapDesktop links={links.length}>
      {links.map((link) => link.condition && link.component)}
    </HeaderLinksWrapDesktop>
  )
}

export const AdminHeaderLinks = () => {
  const { isAdmin } = useRole()

  return (
    <HeaderLinksWrap links={7}>
      {isAdmin && <StyledNavLink to="/admin/accreditation">Accreditation</StyledNavLink>}
      {isAdmin && <StyledNavLink to="/admin/kyc">KYC</StyledNavLink>}
      {isAdmin && <StyledNavLink to="/admin/transactions">Broker Dealer Transactions</StyledNavLink>}
      {isAdmin && <StyledNavLink to="/admin/security-catalog">Security Catalog</StyledNavLink>}
      {isAdmin && <StyledNavLink to="/admin/users-list">User’s</StyledNavLink>}
    </HeaderLinksWrap>
  )
}

const HeaderLinksWrapDesktop = styled(Row)<{ links: number }>`
  display: flex;
  align-items: center;
  gap: 30px;
  margin-left: 35px;
  padding-left: 35px;
  border-left: solid 2px #e6e6ff;
  @media (max-width: 1600px) {
    gap: 15px;
  }
  @media (max-width: 1400px) {
    display: none;
  }
`

const HeaderLinksWrap = styled(Row)<{ links: number }>`
  display: flex;
  align-items: center;
  gap: 30px;
  @media (max-width: 1600px) {
    gap: 15px;
  }
  @media (max-width: 1400px) {
    display: none;
  }
`

export const disabledStyle = css`
  cursor: initial;
  pointer-events: none;
  opacity: 0.2;
`

const navLinkStyles = css`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  font-size: 13px;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none !important;
  color: ${({ theme }) => theme.text12};
  width: fit-content;
  word-break: break-word;
  // opacity: 0.4;
  border-radius: 45px;
  font-weight: 500;
  &.${activeClassName} {
    opacity: 1;
    color: #b8b8cc;
  }

  :hover,
  :focus {
    color: ${({ theme }) => darken(0.05, theme.text11)};
    &.${activeClassName} {
      color: #b8b8cc;
    }
  }
  @media (max-width: 1500px) {
    font-size: 12px;
  }
  @media (max-width: 1300px) {
    font-size: 16px;
  }
  @media (max-width: 1250px) {
    font-size: 15px;
  }
`

const externalLinkStyles = css`
  ${({ theme }) => theme.flexRowNoWrap}
  align-items: left;
  font-size: 13px;
  border-radius: 3rem;
  outline: none;
  cursor: pointer;
  text-decoration: none !important;
  color: ${({ theme }) => theme.text12};
  width: fit-content;
  border-radius: 45px;
  font-weight: 500;

  :hover {
    color: ${({ theme }) => darken(0.05, theme.text11)};
  }

  :focus,
  :active {
    color: ${({ theme }) => theme.text12};
    outline: none;
  }

  @media (max-width: 1500px) {
    font-size: 12px;
  }
  @media (max-width: 1300px) {
    font-size: 16px;
  }
  @media (max-width: 1250px) {
    font-size: 15px;
  }
`

const StyledNavLink = styled(NavLink).attrs({
  activeClassName,
})<{ disabled?: boolean }>`
  ${navLinkStyles};
  ${({ disabled }) => disabled && `${disabledStyle}`};
`

const subMenuLinkStyle = css`
  font-size: 16px;
  line-height: 24px;
  font-weight: 500;
  text-transform: none;
  padding: 0 66px 0 0;
  :hover {
    color: ${({ theme }) => theme.text1};
    opacity: 1;
  }
`
const SubMenuLink = styled(StyledNavLink)`
  ${subMenuLinkStyle}
  &.${activeClassName} {
    color: ${({ theme }) => theme.text1};
  }
`
const SubMenuExternalLink = styled(ExternalLink)<{ disabled?: boolean }>`
  ${navLinkStyles};
  ${subMenuLinkStyle};
  :hover,
  :active,
  :focus {
    text-decoration: none;
  }
`
const MenuExternalLink = styled(ExternalLink)`
  ${externalLinkStyles};
  ${({ disabled }) => disabled && `${disabledStyle}`};
`
const PopOverContent = styled.div`
  display: flex;
  gap: 6px;
  flex-direction: column;
  align-items: flex-start;
  padding: 15px 22px;
`
