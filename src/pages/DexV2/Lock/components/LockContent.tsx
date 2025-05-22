import React, { useMemo, useState } from 'react'
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
  const [isLoading, setIsLoading] = useState<{ approve: boolean; lock: boolean }>({ approve: false, lock: false })
  const { userInput, setUserInput, handleLock, approvalState, approve, locked } = useLock()
  const currency = useIXSCurrency()
  const { account } = useWeb3React()
  const { openConnectModal } = useConnectModal()

  const currencyBalance = useCurrencyBalance(account, currency || undefined)
  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalance)

  const needsApproval = useMemo(() => {
    return (
      account &&
      userInput &&
      approvalState !== ApprovalState.APPROVED &&
      maxInputAmount &&
      !new Big(userInput).gt(maxInputAmount.toExact())
    )
  }, [account, approvalState, userInput, maxInputAmount])

  const handleApprove = async () => {
    if (!account || approvalState !== ApprovalState.NOT_APPROVED) return

    try {
      setIsLoading({ ...isLoading, approve: true })
      await approve()
    } catch (error) {
      console.error('Error approving token', error)
    } finally {
      setIsLoading({ ...isLoading, approve: false })
    }
  }

  const handleLockToken = async () => {
    if (!account) {
      openConnectModal && openConnectModal()
      return
    }

    try {
      setIsLoading({ ...isLoading, lock: true })
      await handleLock()
    } catch (error) {
      console.error('Error locking token', error)
    } finally {
      setIsLoading({ ...isLoading, lock: false })
    }
  }

  const isApproveDisabled = useMemo(() => {
    return (
      !account ||
      approvalState === ApprovalState.APPROVED ||
      approvalState === ApprovalState.PENDING ||
      isLoading.approve ||
      !userInput ||
      !maxInputAmount ||
      new Big(userInput).gt(maxInputAmount.toExact())
    )
  }, [account, approvalState, isLoading.approve, userInput, maxInputAmount])

  const isLockDisabled = useMemo(() => {
    return (
      !account ||
      locked ||
      isLoading.lock ||
      !userInput ||
      !maxInputAmount ||
      new Big(userInput).gt(maxInputAmount.toExact()) ||
      approvalState !== ApprovalState.APPROVED
    )
  }, [account, locked, isLoading.lock, userInput, maxInputAmount, approvalState])

  const showApproveButton = needsApproval
  const showLockButton = !needsApproval || approvalState === ApprovalState.APPROVED

  const approveButtonLabel = useMemo(() => {
    if (isLoading.approve) return 'Processing...'
    if (approvalState === ApprovalState.PENDING) return 'Approval Pending...'
    return 'Allow IXS'
  }, [isLoading.approve, approvalState])

  const lockButtonLabel = useMemo(() => {
    if (isLoading.lock || isLoading.approve) return 'Processing...'

    if (locked) {
      return (
        <Flex alignItems="center" style={{ gap: 6 }}>
          <CheckedIcon />
          Lock Created
        </Flex>
      )
    }
    return 'Confirm Lock'
  }, [locked, isLoading.lock])

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
        {showApproveButton && (
          <StyledPrimaryButton
            onClick={handleApprove}
            type="button"
            disabled={isApproveDisabled}
            locked={false}
            isLoading={isLoading.approve}
          >
            {approveButtonLabel}
          </StyledPrimaryButton>
        )}

        {showLockButton && (
          <StyledPrimaryButton
            onClick={handleLockToken}
            type="button"
            disabled={isLockDisabled}
            locked={locked}
            isLoading={isLoading.lock}
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
