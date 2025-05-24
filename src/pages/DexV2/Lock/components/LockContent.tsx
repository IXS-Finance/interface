import React, { useMemo } from 'react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { Flex } from 'rebass'
import { Currency, CurrencyAmount } from '@ixswap1/sdk-core'
import styled from 'styled-components'
import { Line } from '../../Pool/Create'
import { useWeb3React } from 'hooks/useWeb3React'
import CurrencyInput from './CurrencyInput'
import { useLock } from '../LockProvider'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useCurrencyBalance } from 'state/wallet/hooks'
import DurationSlider from './DurationSlider'
import LockExplanation from './LockExplanation'
import { ApprovalState } from 'hooks/useApproveCallback'
import useIXSCurrency from 'hooks/useIXSCurrency'
import { ButtonOutlined, PinnedContentButton } from 'components/Button'
import { ReactComponent as CheckedIcon } from 'assets/images/checked-green.svg'
import { useHistory } from 'react-router-dom'
import { routes } from 'utils/routes'
import Big from 'big.js'

const LockContent: React.FC = () => {
  const history = useHistory()
  const { userInput, setUserInput, handleLock, locking, approvalState, approve, locked } = useLock()
  const currency = useIXSCurrency()
  const { account } = useWeb3React()
  const { openConnectModal } = useConnectModal()

  const currencyBalance = useCurrencyBalance(account, currency || undefined)
  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalance)

  const handleApprove = async () => {
    if (!account || approvalState !== ApprovalState.NOT_APPROVED) return

    await approve()
  }

  const handleLockToken = async () => {
    if (!account) {
      openConnectModal && openConnectModal()
      return
    }

    await handleLock()
  }

  const isApproveDisabled =
    !account ||
    approvalState === ApprovalState.PENDING ||
    !userInput ||
    !maxInputAmount ||
    new Big(userInput).gt(maxInputAmount.toExact())

  const isLockDisabled =
    !account || locked || locking || !userInput || !maxInputAmount || new Big(userInput).gt(maxInputAmount.toExact())

  const approveButtonLabel = useMemo(() => {
    if (approvalState === ApprovalState.PENDING) return 'Approval Pending...'
    return 'Allow IXS'
  }, [approvalState])

  const lockButtonLabel = useMemo(() => {
    if (locking) return 'Processing...'

    if (locked) {
      return (
        <Flex alignItems="center" style={{ gap: 6 }}>
          <CheckedIcon />
          Lock Created
        </Flex>
      )
    }
    return 'Confirm Lock'
  }, [locked, locking])

  return (
    <Flex flexDirection="column" mt={3} style={{ gap: 32 }}>
      <CurrencyInput
        value={userInput}
        currency={currency}
        onUserInput={setUserInput}
        onMax={() => setUserInput(maxInputAmount?.toExact() ?? '')}
        fiatValue={undefined}
      />

      <DurationSlider />

      <Line style={{ margin: 0 }} />

      <LockExplanation />

      <Flex flexDirection="column" style={{ gap: 16 }}>
        {approvalState !== ApprovalState.APPROVED ? (
          <StyledPrimaryButton
            onClick={handleApprove}
            type="button"
            disabled={isApproveDisabled}
            locked={false}
            isLoading={approvalState === ApprovalState.PENDING}
          >
            {approveButtonLabel}
          </StyledPrimaryButton>
        ) : (
          <StyledPrimaryButton
            onClick={handleLockToken}
            type="button"
            disabled={isLockDisabled}
            locked={locked}
            isLoading={locking}
          >
            {lockButtonLabel}
          </StyledPrimaryButton>
        )}
        <ButtonOutlined onClick={() => history.push(routes.dexV2Dashboard)}>Go to Dashboard</ButtonOutlined>
      </Flex>
    </Flex>
  )
}

const StyledPrimaryButton = styled(PinnedContentButton)<{ locked: boolean; isLoading?: boolean }>`
  ${({ locked, theme }) =>
    locked &&
    `
    background-color: ${theme.green51};
    color: ${theme.green5};
    border: 1px solid ${theme.green5};
  `}

  ${({ isLoading }) =>
    isLoading &&
    `
    cursor: wait;
    opacity: 0.7;
  `}
`

export default LockContent
