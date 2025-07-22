import React from 'react'
import { Redirect, RouteComponentProps } from 'react-router-dom'
import AddLiquidityV2 from './index'
import styled from 'styled-components'
// import { Header } from 'pages/Launchpad/Header'
import Portal from '@reach/portal'
import { CenteredFixed } from 'components/LaunchpadMisc/styled'
import { NetworkNotAvailable } from 'components/Launchpad/NetworkNotAvailable'
import { DEFAULT_CHAIN_ID } from 'config'
import { useAccount } from 'wagmi'
import { TGE_CHAINS_WITH_SWAP } from 'constants/addresses'
import AppBody from 'pages/AppBody'

export const AddWhiteBGContainer = styled.div<{ background?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  padding: 0 2rem;
  font-family: ${(props) => props.theme.launchpad.font};
  background: ${(props) => props.background ?? props.theme.launchpad.colors.newBackground};

  * {
    font-family: ${(props) => props.theme.launchpad.font};
  }

  /* Media Query for Mobile */
  @media (max-width: 768px) {
    padding: 0 1rem;
    background: ${(props) => props.background ?? props.theme.launchpad.colors.newBackground};
  }
`

// export const AddLiduidityContainer = styled.div<{ background?: string }>`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   min-height: 100vh;
//   width: 100%;
//   padding: 0 4rem;
//   font-family: ${(props) => props.theme.launchpad.font};
//   background: ${(props) => props.background ?? props.theme.launchpad.colors.newBackground};
//   * {
//     font-family: ${(props) => props.theme.launchpad.font};
//   }
// `

export const RedirectDuplicateTokenIdsV2: React.FC<
  RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>
> = (props) => {
  const { chainId } = useAccount()

  const {
    match: {
      params: { currencyIdA, currencyIdB },
    },
  } = props

  if (currencyIdA && currencyIdB && currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return <Redirect to={`/add/${currencyIdA}`} />
  }

  const blurred = chainId !== undefined && !TGE_CHAINS_WITH_SWAP.includes(chainId)

  return (
    <AppBody page="liquidity" blurred={blurred}>
      <AddLiquidityV2 {...props} />
    </AppBody>
  )
}
