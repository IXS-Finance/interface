import React, { useCallback } from 'react'
import { Trans } from '@lingui/macro'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { routes } from 'utils/routes'
import { ENV_SUPPORTED_TGE_CHAINS } from 'constants/addresses'
import { useActiveWeb3React } from 'hooks/web3'
import { ExternalLink } from 'theme'

import { ProductsBlockContainer } from './styleds'
import { isUserWhitelisted } from 'utils/isUserWhitelisted'
// import { isDevelopment } from 'utils/isEnvMode'
import { useKYCState } from 'state/kyc/hooks'
import { KYCStatuses } from 'pages/KYC/enum'
import { useWhitelabelState } from 'state/whitelabel/hooks'

export const ProductsBlock = () => {
  const { chainId, account } = useActiveWeb3React()
  const chains = ENV_SUPPORTED_TGE_CHAINS || [42]
  const isWhitelisted = isUserWhitelisted({ account, chainId })
  const { kyc } = useKYCState()
  const isKycApproved = kyc?.status === KYCStatuses.APPROVED ?? false

  const { config } = useWhitelabelState()

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
    <ProductsBlockContainer>
      {chainId && account && (
        <Title>
          <Trans>Our Products</Trans>
        </Title>
      )}
      <ListProduct>
        {isAllowed(routes.swap) && account && chainId && chains.includes(chainId) && isWhitelisted && (
          <NavLink to={routes.swap}>
            <Trans>Swap</Trans>
          </NavLink>
        )}
        {isAllowed(routes.staking) && account && chainId && [...chains, 1].includes(chainId) && (
          <NavLink to={routes.staking}>
            <Trans>Staking</Trans>
          </NavLink>
        )}
        {isAllowed(routes.securityTokens()) &&
          isKycApproved &&
          account &&
          chainId &&
          chains.includes(chainId) &&
          isWhitelisted && (
            <NavLink to={routes.securityTokens('tokens')}>
              <Trans>Securities</Trans>
            </NavLink>
          )}
        {isAllowed(routes.pool) && account && chainId && chains.includes(chainId) && isWhitelisted && (
          <NavLink to={routes.pool}>
            <Trans>Pools</Trans>
          </NavLink>
        )}
        {isKycApproved && account && isWhitelisted && (
          <ExternalLink target="_self" href="https://info.ixs.finance/home">
            <Trans>Charts</Trans>
          </ExternalLink>
        )}
        {account && (
          <ExternalLink href="https://docs.google.com/forms/d/e/1FAIpQLSdfRp4i-RZckEeJDv7hF5COOYcP_cYANxjyNhB86eZP8ja-Ww/viewform">
            <Trans>List My Token</Trans>
          </ExternalLink>
        )}
      </ListProduct>
    </ProductsBlockContainer>
  )
}

const Title = styled.div`
  font-style: normal;
  letter-spacing: -0.02em;
  font-weight: 500;
  font-size: 14px;
  line-height: 32px;
  color: rgb(184, 184, 204);
`

const ListProduct = styled.p`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 76px;
  row-gap: 8px;
  margin-top: 0px;
  margin-bottom: 0px;

  a {
    display: block;
    font-style: normal;
    letter-spacing: -0.02em;
    font-weight: 500;
    font-size: 14px;
    line-height: 32px;
    color: rgb(41, 41, 51);
    text-decoration: none;
  }
`
