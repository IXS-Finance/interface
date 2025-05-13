import { Trans } from '@lingui/macro'
import { SupportedChainId } from 'constants/chains'
import { useActiveWeb3React } from 'hooks/web3'
import React, { useCallback, useEffect, useMemo } from 'react'
import { useCookies } from 'react-cookie'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { ExternalLink } from 'theme'
import { routes } from 'utils/routes'
import { isUserWhitelisted } from 'utils/isUserWhitelisted'
import { ReactComponent as CloseIcon } from '../../assets/images/newCross.svg'
import { disabledStyle } from 'components/Header/HeaderLinks'
import { useWhitelabelState } from 'state/whitelabel/hooks'
import { useKyc, useRole } from 'state/user/hooks'
import { Line } from 'components/Line'
import MenuMobile from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Fade from '@mui/material/Fade'
import { CHAINS } from 'components/Web3Provider/constants'

interface Props {
  close: () => void
  isAdminMenu?: string
}

export const Menu = ({ close, isAdminMenu }: Props) => {
  const { chainId, account } = useActiveWeb3React()
  const { config } = useWhitelabelState()
  const [cookies] = useCookies(['annoucementsSeen'])

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)

  const isIxSwap = config?.isIxSwap ?? false
  const bridgeUrl = process.env.REACT_APP_BRIDGE_URL || 'https://bridge.ixs.finance'
  const stakingUrl = process.env.REACT_APP_STAKING_URL || 'https://staking.ixs.finance'

  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  useEffect(() => {
    const body = document.getElementsByTagName('body')[0]
    if (body) {
      body.setAttribute('style', 'overflow:hidden')
    }
    return () => {
      if (body) {
        body.removeAttribute('style')
      }
    }
  }, [])

  const isWhitelisted = isUserWhitelisted({ account, chainId })

  const chains = CHAINS.map((chain) => chain.id)

  const isAllowed = useCallback(
    (path: string): boolean => {
      if (!config || !config.pages || config.pages.length === 0) {
        return true
      }

      return config.pages.includes(path)
    },
    [config]
  )

  const { isApproved } = useKyc()
  const { isOfferManager, isAdmin, isTokenManager } = useRole()

  const showIssuance = useMemo(
    () => account && (isAdmin || (isApproved && isOfferManager)),
    [account, isAdmin, isApproved, isOfferManager]
  )
  return isAdminMenu ? (
    <ModalContainer>
      <CloseContainer>
        <CloseIcon onClick={close} />
      </CloseContainer>

      <Container>
        <MenuList>
          <>
            <MenuListItem id={`admin-accreditation-nav-link`} to="/admin/accreditation" onClick={close}>
              <Trans>Accreditation</Trans>
            </MenuListItem>
            <Line />
          </>
          <>
            <MenuListItem id={`admin-kyc-nav-link`} to="/admin/kyc" onClick={close}>
              <Trans>KYC</Trans>
            </MenuListItem>
            <Line />
          </>

          <>
            <MenuListItem id={`admin-transactions-nav-link`} to="/admin/transactions" onClick={close}>
              <Trans>Broker Dealer Transactions</Trans>
            </MenuListItem>
            <Line />
          </>
          <>
            <MenuListItem id={`admin-security-nav-link`} to="/admin/security-catalog" onClick={close}>
              <Trans>Security Catalog</Trans>
            </MenuListItem>
            <Line />
          </>

          <>
            <MenuListItem id={`admin-users-nav-link`} to="/admin/users-list" onClick={close}>
              <Trans>User’s</Trans>
            </MenuListItem>
            <Line />
          </>
        </MenuList>
      </Container>
    </ModalContainer>
  ) : (
    <ModalContainer>
      <Container>
        <CloseContainer>
          <CloseIcon onClick={close} />
        </CloseContainer>

        <MenuList style={!cookies.annoucementsSeen ? { marginTop: 130 } : {}}>
          {isIxSwap && isAllowed('charts') && isWhitelisted ? (
            <>
              <ExternalListItem target="_self" href={'https://info.ixs.finance/home'}>
                <Trans>Charts</Trans>
              </ExternalListItem>

              <Line />
            </>
          ) : null}

          {isIxSwap && isAllowed('bridge') ? (
            <>
              <ExternalListItem target="_blank" href={bridgeUrl}>
                <Trans>Bridge</Trans>
              </ExternalListItem>

              <Line />
            </>
          ) : null}

          <>
            <MenuListItem activeClassName="active-item" id={`issuance-nav-link`} to={'/launchpad'} onClick={close}>
              <Trans>Launchpad</Trans>
            </MenuListItem>

            <Line />
          </>

          {isAllowed(routes.securityTokens()) && chainId && chains.includes(chainId) && isWhitelisted && (
            <>
              <MenuListItem
                // disabled={!isApproved}
                id={`security-nav-link`}
                to={routes.securityTokens('tokens')}
                onClick={close}
              >
                <Trans>RWAs</Trans>
              </MenuListItem>
              <Line />
            </>
          )}

          {isAllowed(routes.pool) && chainId && chains.includes(chainId) && isWhitelisted && (
            <>
              <MenuListItem id={`pool-nav-link`} to={routes.pool} onClick={close}>
                <Trans>Liquidity Pools</Trans>
              </MenuListItem>
              <Line />
            </>
          )}

          {isAllowed(routes.swap) && chainId && chains.includes(chainId) && isWhitelisted && (
            <>
              <MenuListItem id={`swap-nav-link`} to={routes.swap} onClick={close} data-testid={`swap-nav-link`}>
                <Trans>Swap/Trade</Trans>
              </MenuListItem>{' '}
              <Line />
            </>
          )}

          {/* {chainId && chains.includes(chainId) && isWhitelisted && (
            <ExternalListItem
              disabled={!isApproved}
              target="_self"
              href={'https://www.ixs.finance/fractionalized-nfts-coming-soon-on-ix-swap/'}
            >
              <Trans>FNFT</Trans>
            </ExternalListItem>
          )} */}

          {isAllowed(routes.faucet) && chainId && chainId === SupportedChainId.KOVAN && isWhitelisted && (
            <MenuListItem disabled={!isApproved} id={`faucet-nav-link`} to={routes.faucet} onClick={close}>
              <Trans>Faucet</Trans>
            </MenuListItem>
          )}

          {isAllowed(routes.kyc) && (
            <>
              <MenuListItem activeClassName="active-item" id={`kyc-nav-link`} to={routes.kyc} onClick={close}>
                <Trans>KYC</Trans>
              </MenuListItem>
              <Line />
            </>
          )}
          {isAllowed(routes.tokenManager()) && isWhitelisted && isTokenManager && (
            <>
              <MenuListItem
                activeClassName="active-item"
                id={`kyc-nav-link`}
                to={routes.tokenManager('my-tokens', null)}
                onClick={close}
              >
                <Trans>Token Manager</Trans>
              </MenuListItem>
              <Line />
            </>
          )}

          {/* <>
            <MenuListItem activeClassName="active-item" id={`issuance-nav-link`} to={'/launchpad'} onClick={close}>
              <Trans>Launchpad</Trans>
            </MenuListItem>
            <Line />
          </> */}

          {isIxSwap && isAllowed('staking') ? (
            <div>
              <div
                style={{ fontSize: '20px', fontWeight: '700', marginTop: '20px', height: '40px' }}
                id="fade-button"
                aria-controls={open ? 'fade-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}
              >
                Staking
              </div>
              <MenuMobile
                style={{ width: '90vw' }}
                id="fade-menu"
                MenuListProps={{
                  'aria-labelledby': 'fade-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                TransitionComponent={Fade}
              >
                {isAllowed(routes.vesting) && isAllowed(routes.staking) && (
                  <>
                    <MenuItem onClick={handleClose}>
                      <ExternalListItem
                        style={{ fontSize: '15px', margin: '0px', height: '10px', fontWeight: '400' }}
                        href={stakingUrl || ``}
                      >
                        <Trans>Staking on Base</Trans>
                      </ExternalListItem>
                    </MenuItem>
                  </>
                )}

                {isAllowed(routes.vesting) && (
                  <>
                    <MenuItem onClick={handleClose}>
                      <MenuListItem
                        style={{ fontSize: '15px', margin: '0px', height: '10px', fontWeight: '400' }}
                        activeClassName="active-item"
                        id={`vesting-nav-link`}
                        to={routes.vesting}
                        onClick={close}
                      >
                        Token Sale Distribution
                      </MenuListItem>
                    </MenuItem>
                  </>
                )}

                {/* {isAllowed(routes.vesting) && isAllowed(routes.staking) && (
                <MenuItem onClick={handleClose}>
                  <ExternalListItem
                    style={{ fontSize: '15px', margin: '0px', height: '10px', fontWeight: '500' }}
                    href={`https://staking.ixs.finance/`}
                  >
                    <Trans>Liquidity Mining Program (Quickswap)</Trans>
                  </ExternalListItem>
                </MenuItem>
              )} */}
              </MenuMobile>
              <Line />
            </div>
          ) : null}

          {showIssuance && (
            <>
              <MenuListItem
                activeClassName="active-item"
                id={`issuance-dashboard-nav-link`}
                to="/issuance"
                onClick={close}
              >
                <Trans>Issuance</Trans>
              </MenuListItem>
              <Line />
            </>
          )}

          {isAdmin && (
            <>
              <MenuListItem activeClassName="active-item" id={`admin-dashboard-nav-link`} to="/admin" onClick={close}>
                <Trans>Admin</Trans>
              </MenuListItem>
              <Line />
            </>
          )}
          {isIxSwap && isAdmin && account && chainId && chains.includes(chainId) && isWhitelisted ? (
            <MenuListItem to={'/lbp-admin'} data-testid={`lbp-nav-link`}>
              <Trans>LBP</Trans>
            </MenuListItem>
          ) : null}
        </MenuList>
      </Container>
      <StyledFooter>
        <span>Copyright © IXS 2024</span>
        <div>
          <a
            href={config?.termsAndConditionsUrl || 'https://www.ixs.finance/terms-and-conditions/'}
            target="_blank"
            rel="noreferrer"
          >
            Terms & Conditions
          </a>

          <a href={config?.privacyPolicyUrl || 'https://www.ixs.finance/privacy-policy/'} target="_blank" rel="noreferrer">
            Privacy Policy
          </a>
        </div>
      </StyledFooter>
    </ModalContainer>
  )
}

const StyledFooter = styled.div`
  text-align: center;
  margin-top: 40px;

  & > span {
    color: #292933;
    font-weight: 500;
    font-size: 14px;
  }

  & > div {
    gap: 20px;

    & > a {
      color: #b8b8cc;
      font-size: 10px;
      font-weight: 500;
      margin-right: 10px;
      text-decoration: none;
      // margin-top: 20px;
    }
  }
`

const ModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100%;
  // backdrop-filter: blur(36px);
  z-index: 99999;
  padding: 32px 18px;
  display: none;
  background: ${({ theme }) => theme.bg0};
  @media (max-width: 1400px) {
    display: block;
    overflow-y: scroll;
  }
`

const Container = styled.div`
  position: relative;
  // display: flex;
  align-items: left;
  justify-content: left;
  display: contents;
  color: black;
`

const CloseContainer = styled.div`
  text-align: right;
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 9999;
  color: black;
  border: 1px solid #e6e6ff;
  border-radius: 6px;
  padding: 10px 12px;
  cursor: pointer;
`

const MenuList = styled.div`
  display: grid;
  grid-template-columns: 100%;
  grid-gap: 6px;
  margin-top: 60px;
  justify-content: left;
`
const listItemStyle = css`
  margin-top: 20px;
  height: 40px;
  display: flex;
  justify-content: left;
  align-items: left;
  font-weight: 700;
  font-size: 20px;
  // text-transform: uppercase;
  outline: none;
  cursor: pointer;
  text-decoration: none;
  text-align: center;

  color: ${({ theme }) => theme.config?.text?.main || theme.text1};
  &.active-item {
    opacity: 0.5;
    color: ${({ theme }) => theme.config?.text?.main || theme.text1};
  }
`
const MenuListItem = styled(NavLink)<{ disabled?: boolean }>`
  ${listItemStyle};
  ${({ disabled }) => disabled && `${disabledStyle}`};
`
const ExternalListItem = styled(ExternalLink)`
  ${listItemStyle};
  :hover,
  :active,
  :focus {
    text-decoration: none;
  }

  ${({ disabled }) => disabled && `${disabledStyle}`};
`
