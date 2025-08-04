import { Trans } from '@lingui/macro'
import { IconWrapper } from 'components/AccountDetails/styleds'
import { ButtonGradientBorder, ButtonIXSGradient } from 'components/Button'
import { IXS_ADDRESS, MATIC_TGE_CHAINS } from 'constants/addresses'
import useCopyClipboard from 'hooks/useCopyClipboard'
import useIXSCurrency from 'hooks/useIXSCurrency'
import useTheme from 'hooks/useTheme'
import { useActiveWeb3React } from 'hooks/web3'
import React from 'react'
import { Copy } from 'react-feather'
import { ExternalLink, TYPE } from 'theme'
import { ButtonRow, NoIXSTokensWrapper } from './style'
import styled from 'styled-components'
import { shortAddress } from 'utils'

const StyledCopy = styled(Copy)`
  width: 17px;
  height: 17px;
`
export const NoIXSTokens = () => {
  const theme = useTheme()
  const currency = useIXSCurrency()
  const { chainId } = useActiveWeb3React()
  const [isCopied, setCopied] = useCopyClipboard(2000)
  return (
    <NoIXSTokensWrapper onClick={() => setCopied(IXS_ADDRESS[1])} style={{ cursor: 'pointer' }}>
      <TYPE.title5 color={theme.text1}>
        <Trans>You don&apos;t have any {currency?.symbol} tokens available!</Trans>
      </TYPE.title5>
      <div style={{ marginTop: '10px' }}>
        {chainId && !MATIC_TGE_CHAINS.includes(chainId) && (
          <TYPE.body3>
            <Trans>
              To buy {currency?.symbol} click on swap below or find us on our Telegram channel to learn more.
            </Trans>
          </TYPE.body3>
        )}
        {chainId && MATIC_TGE_CHAINS.includes(chainId) && (
          <span style={{ display: 'inline-block' }}>
            <TYPE.body3>
              <Trans>
                Got IXS on Ethereum? You can bridge them to Polygon. Use IXS contract address to find it on
                AlianceBridge {shortAddress(IXS_ADDRESS[1])}
              </Trans>
              {isCopied ? (
                <span style={{ marginLeft: '5px' }}>
                  <Trans>Copied</Trans>
                </span>
              ) : (
                <IconWrapper size={17} style={{ display: 'inline-block', marginLeft: '5px' }}>
                  <StyledCopy />
                </IconWrapper>
              )}
              .
            </TYPE.body3>
          </span>
        )}
      </div>
      {chainId && !MATIC_TGE_CHAINS.includes(chainId) && (
        <ButtonRow>
          <ButtonGradientBorder
            as={ExternalLink}
            href="https://t.me/ixsfinance"
            data-testid="staking-redirect-to-telegram"
            style={{ textTransform: 'none', textDecoration: 'none' }}
          >
            <Trans>Go to Telegram</Trans>
          </ButtonGradientBorder>

          {currency && (
            <ButtonIXSGradient
              as={ExternalLink}
              style={{ textTransform: 'unset', width: '172px', textDecoration: 'none' }}
              href={`https://app.uniswap.org/#/swap?outputCurrency=${currency.wrapped.address}`}
              data-testid="staking-redirect-swap"
            >
              <Trans>Swap</Trans>
            </ButtonIXSGradient>
          )}
        </ButtonRow>
      )}
      {chainId && MATIC_TGE_CHAINS.includes(chainId) && (
        <ButtonRow>
          {currency && (
            <ButtonIXSGradient
              as={ExternalLink}
              style={{ textTransform: 'unset', width: '250px', textDecoration: 'none' }}
              href={`https://alliancebridge.io/`}
              data-testid="staking-redirect-bridge"
            >
              <Trans>Bridge IXS to Polygon</Trans>
            </ButtonIXSGradient>
          )}
        </ButtonRow>
      )}
    </NoIXSTokensWrapper>
  )
}
