import React from 'react'
import { Trans } from '@lingui/macro'
import { BigNumber } from 'ethers'
import { formatAmount } from 'utils/formatCurrencyAmount'
import {
  PreviewContainer,
  Checkbox,
  TermsText,
  TermsLink,
  BackButton,
  StyledButtonPrimary,
  Card,
  Label,
  Value,
} from '../SharedStyles'
import { Box, Flex } from 'rebass'
import { shortAddress } from 'utils'
import styled from 'styled-components'

interface WithdrawPreviewProps {
  vaultAddress?: string
  network?: string
  withdrawAmount: string
  exchangeRate: string
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
  handleBackFromWithdrawPreview: () => void
  handleActualWithdraw: () => void
  loading: boolean
  isWithdrawProcessing: boolean
  withdrawError: boolean
  withdrawAmountInSmallestUnit: BigNumber
  getUsdcEquivalent: (amount: string) => string
}

const VAULT_TOKEN_DECIMALS = 3

export const WithdrawPreview: React.FC<WithdrawPreviewProps> = ({
  vaultAddress,
  network,
  withdrawAmount,
  exchangeRate,
  termsAccepted,
  setTermsAccepted,
  handleBackFromWithdrawPreview,
  handleActualWithdraw,
  loading,
  isWithdrawProcessing,
  withdrawError,
  withdrawAmountInSmallestUnit,
  getUsdcEquivalent,
}) => {
  return (
    <PreviewContainer>
      <Flex
        flexDirection={['column', 'row']}
        css={{
          gap: '16px',
        }}
      >
        <Flex flex={1}>
          <Card>
            <Flex css={{ gap: '8px', flexDirection: 'column' }}>
              <Label>Withdrawal Amount</Label>
              <Value>
                VT{' '}
                {parseFloat(withdrawAmount || '0').toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: VAULT_TOKEN_DECIMALS,
                })}
              </Value>
            </Flex>
          </Card>
        </Flex>
        <Flex flex={1}>
          <Card>
            <Flex css={{ gap: '8px', flexDirection: 'column' }}>
              <Label>Network</Label>
              <Value>{network || 'Polygon'}</Value>
            </Flex>
          </Card>
        </Flex>
      </Flex>

      <Card>
        <Flex css={{ gap: '8px', flexDirection: 'column' }}>
          <Label>Request Made To</Label>
          <Value>{vaultAddress ? shortAddress(vaultAddress) : ''}</Value>
        </Flex>
      </Card>

      <Card>
        <Label>Summary</Label>
        <Flex justifyContent="space-between" alignItems="center" css={{ marginTop: '32px' }}>
          <Value>Exchange Rate</Value>
          <Value>{exchangeRate ? formatAmount(parseFloat(exchangeRate), 6) : 'N/A'}</Value>
        </Flex>
        <Box css={{ marginBottom: '16px', borderBottom: '1px solid #E8E8FF', paddingTop: '16px' }} />
        <Flex justifyContent="space-between" alignItems="center" css={{ marginTop: '8px' }}>
          <Value>Estimated USDC Received</Value>
          <Value>USDC {getUsdcEquivalent(withdrawAmount || '0')}</Value>
        </Flex>
      </Card>

      <Flex
        flexDirection={['column', 'row']}
        justifyContent="space-between"
        alignItems={['flex-start', 'center']}
        css={{ gap: '16px' }}
      >
        <Flex alignItems="center">
          <Checkbox type="checkbox" checked={termsAccepted} onChange={() => setTermsAccepted(!termsAccepted)} />
          <TermsText>
            I agree to the <TermsLink>IXS Earn Terms and Conditions</TermsLink>.
          </TermsText>
        </Flex>

        <Flex
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width={['100%', 'auto']}
          css={{ gap: '16px' }}
        >
          <CustomBackButton onClick={handleBackFromWithdrawPreview} disabled={isWithdrawProcessing}>
            Back
          </CustomBackButton>
          <CustomStyledButtonPrimary
            onClick={handleActualWithdraw}
            disabled={
              !termsAccepted ||
              loading ||
              isWithdrawProcessing ||
              !withdrawAmount ||
              withdrawAmountInSmallestUnit.isZero()
            }
          >
            {isWithdrawProcessing ? (
              <Trans>Processing...</Trans>
            ) : withdrawError ? (
              <Trans>Retry Withdraw</Trans>
            ) : (
              <Trans>Withdraw</Trans>
            )}
          </CustomStyledButtonPrimary>
        </Flex>
      </Flex>
    </PreviewContainer>
  )
}

const CustomBackButton = styled(BackButton)`
  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
  }
`

const CustomStyledButtonPrimary = styled(StyledButtonPrimary)`
  @media (max-width: 768px) {
    width: 100%;
    flex: 1;
  }
`
