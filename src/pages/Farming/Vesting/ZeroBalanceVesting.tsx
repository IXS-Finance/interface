import { Trans } from '@lingui/macro'
import { ButtonPinkBorder } from 'components/Button'
import useTheme from 'hooks/useTheme'
import React from 'react'
import { Text } from 'rebass'
import { VestingTextWrapper, YourAddressWrapper, YourAddress, Address, NoVestingCustomAddress } from '../styleds'
import { ReactComponent as ExternalBright } from 'assets/images/external-bright.svg'
import { IconWrapperWithBg } from 'components/AccountDetails/styleds'
import { ExternalLink } from 'theme'
import { shortAddress } from 'utils'
import { useWeb3React } from 'hooks/useWeb3React'
import { useVestingState } from 'state/vesting/hooks'
import useIXSCurrency from 'hooks/useIXSCurrency'

export const ZeroBalanceVesting = () => {
  const theme = useTheme()
  const { account } = useWeb3React()
  const { customVestingAddress } = useVestingState()
  const IXSCurrency = useIXSCurrency()
  if (customVestingAddress) {
    return (
      <NoVestingCustomAddress>
        <Trans>
          Found address
          <br />
          {shortAddress(customVestingAddress)}
          <br />
          doesn’t have {IXSCurrency?.symbol} vesting
        </Trans>
      </NoVestingCustomAddress>
    )
  }

  return (
    <>
      <VestingTextWrapper>
        {account && (
          <YourAddressWrapper>
            <YourAddress>
              <Trans>Your address</Trans>
            </YourAddress>
            <Address>{shortAddress(account || '')}</Address>
          </YourAddressWrapper>
        )}
        <Text fontSize={'13px'} lineHeight={'20px'} color={theme.text2}>
          <Trans>Balances will be updated on the vesting page until the contracts are programmed.</Trans>
        </Text>
      </VestingTextWrapper>

      <ButtonPinkBorder
        data-testid="redirect-to-telegram"
        style={{ maxWidth: '308px', width: '100%' }}
        as={ExternalLink}
        href="https://t.me/ixsfinance"
      >
        <ExternalBright style={{ marginRight: '10px' }} />
        <Trans>{IXSCurrency?.symbol} in Telegram</Trans>
        {/* <IconWrapperWithBg size={8} style={{ marginLeft: '6px' }}> */}

        {/* </IconWrapperWithBg> */}
      </ButtonPinkBorder>
    </>
  )
}
