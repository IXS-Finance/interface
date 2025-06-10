import React from 'react'
import { Trans } from '@lingui/macro'
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
import { formatAmount } from 'utils/formatCurrencyAmount'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import { CopyAddress } from 'components/CopyAddress'

interface DepositPreviewProps {
  vaultAddress?: string
  network?: string
  amount: string
  exchangeRate?: string
  termsAccepted: boolean
  setTermsAccepted: (accepted: boolean) => void
  handleBackFromPreview: () => void
  isApprovalNeeded: boolean
  isApproving: boolean
  loading: boolean
  handleApproval: () => void
  handleDeposit: () => void
  isDepositing: boolean
  depositError: boolean
  amountRaw?: string
}

export const DepositPreview: React.FC<DepositPreviewProps> = ({
  vaultAddress,
  network,
  amount,
  exchangeRate,
  termsAccepted,
  setTermsAccepted,
  handleBackFromPreview,
  isApprovalNeeded,
  isApproving,
  loading,
  handleApproval,
  handleDeposit,
  isDepositing,
  depositError,
  amountRaw,
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
              <Label>Deposit Amount</Label>
              <Value>USDC {formatAmount(parseFloat(amount), 6)}</Value>
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
          <Value>
            <CopyAddress address={vaultAddress || ''} />
          </Value>
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
          <Value style={{ flex: 1 }}>Estimated Vault Tokens Received</Value>
          <Value style={{ flex: 1, textAlign: 'right' }}>
            VT{' '}
            {(() => {
              const numericAmount = parseFloat(amount)
              const numericExchangeRate = exchangeRate ? parseFloat(exchangeRate) : 0
              if (!isNaN(numericAmount) && numericExchangeRate > 0) {
                return formatAmount(numericAmount / numericExchangeRate, 3)
              }
              return formatAmount(0, 3)
            })()}
          </Value>
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
          {network === 'avalanche' ? (
            <TermsText>
              I confirm that I have read, understood, and agree to be bound by the{' '}
              <TermsLink href="/IXS_HYCB_Rules.pdf" target="_blank" rel="noopener noreferrer">
                High Yield Corporate Bond (HYCB) Earn Product Rules
              </TermsLink>
              .
            </TermsText>
          ) : (
            <TermsText>
              I agree to the <TermsLink>IXS Earn Terms and Conditions</TermsLink>.
            </TermsText>
          )}
        </Flex>

        <Flex
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          width={['100%', 'auto']}
          css={{ gap: '16px' }}
        >
          <CustomBackButton onClick={handleBackFromPreview}>Back</CustomBackButton>
          {isApprovalNeeded ? (
            <CustomStyledButtonPrimary onClick={handleApproval} disabled={!termsAccepted || isApproving || loading}>
              {isApproving ? <Trans>Approving...</Trans> : <Trans>Approve USDC</Trans>}
            </CustomStyledButtonPrimary>
          ) : (
            <CustomStyledButtonPrimary
              onClick={handleDeposit}
              disabled={!termsAccepted || loading || isDepositing || !amount || !amountRaw}
            >
              {isDepositing ? (
                <Trans>Depositing...</Trans>
              ) : depositError ? (
                <Trans>Retry Deposit</Trans>
              ) : (
                <Trans>Deposit</Trans>
              )}
            </CustomStyledButtonPrimary>
          )}
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
