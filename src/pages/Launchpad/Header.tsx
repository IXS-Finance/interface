import React, { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as Logo } from 'assets/images/logo/logo-dark.svg'
import NewLogo from 'assets/images/logo/logo-full-dark.svg'
import { routes } from 'utils/routes'
import { Link } from 'react-router-dom'
import { useKyc, useRole } from 'state/user/hooks'
import { text29, text57, text8 } from 'components/LaunchpadMisc/typography'
import { useWeb3React } from 'hooks/useWeb3React'
import { isMobile } from 'react-device-detect'

export const Header = () => {
  const { isCorporate, isApproved } = useKyc()
  const { isOfferManager, isAdmin } = useRole()
  const { account } = useWeb3React()
  const [isActiveRoute, setIsActiveRoute] = useState(false)

  const showIssuance = useMemo(
    () => account && (isAdmin || (isApproved && isOfferManager)),
    [account, isAdmin, isApproved, isOfferManager]
  )

  useEffect(() => {
    setIsActiveRoute(window.location.href.includes('launchpad'))
  }, [])

  return (
    <>
      {!isMobile && (
        <HeaderContainer>
          {isActiveRoute ? (
            <TitleSection to="/launchpad">
              <Logo />
              <span className="bold-title">IXS </span>
              <span className="dimmed-title">Launchpad</span>
            </TitleSection>
          ) : (
            <TitleSection to="/launchpad">
              <img src={NewLogo} alt="logo" style={{ width: '100%', height: 'auto' }} />
            </TitleSection>
          )}
          <HeaderLinks>
            <HeaderLink to={routes.swap}>Swap/Trade</HeaderLink>
            <HeaderLink to={routes.securityTokens()}>RWAs</HeaderLink>
            <HeaderLink to={routes.pool}>Liquidity Pools</HeaderLink>
            <HeaderLink to={routes.launchpad}>IXS Launchpad</HeaderLink>
            <HeaderLink to={'#'}>Staking</HeaderLink>
            <HeaderExternalLink href="https://info.ixs.finance/home">Charts</HeaderExternalLink>
            {isAdmin && <HeaderLink to={routes.newAdmin}>Admin</HeaderLink>}
          </HeaderLinks>

          {showIssuance && <IssuancesLink to="/issuance">Issuance Dashboard</IssuancesLink>}
        </HeaderContainer>
      )}
    </>
  )
}

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-around;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0px 2px 2px rgba(122, 122, 204, 0.08);
  backdrop-filter: blur(16px);
  padding: 0 10%;
  height: 80px;
  width: 100vw;
`

const HeaderLinks = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  gap: 1.3rem;
  flex-grow: 1;
  margin: 0 3rem;
`

const TitleSection = styled(Link)`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  transition: background 0.3s;

  :hover {
    background: ${(props) => props.theme.launchpad.colors.foreground};
  }

  .bold-title {
    ${text57}
    color: ${(props) => props.theme.launchpad.colors.text.title};
  }

  .dimmed-title {
    ${text29}
    color: ${(props) => props.theme.launchpad.colors.text.caption};
  }
`

const HeaderLink = styled(Link)`
  ${text8}
  text-decoration: none;
  color: ${(props) => props.theme.launchpad.colors.text.title};
  transition: transform 0.1s ease-in-out;

  :hover {
    transform: scale(1.02);
  }
`

const HeaderExternalLink = styled.a`
  ${text8}
  text-decoration: none;
  color: ${(props) => props.theme.launchpad.colors.text.title};
  transition: transform 0.1s ease-in-out;

  :hover {
    transform: scale(1.02);
  }
`

const IssuancesLink = styled(Link)`
  display: grid;
  place-content: center;
  height: 42px;
  font-size: 13px;
  padding: 0 2rem;
  text-decoration: none;
  border: 1px solid ${(props) => props.theme.launchpad.colors.primary + '14'};
  border-radius: 6px;
  transition: background 0.3s;
  color: ${(props) => props.theme.launchpad.colors.primary};

  :hover {
    background: ${(props) => props.theme.launchpad.colors.primary + '10'};
  }
`
