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
  const [isLoading, setIsLoading] = useState(false)
  const { userInput, setUserInput, handleLock, approvalState, approve, locked } = useLock()
  const currency = useIXSCurrency()
  const { account } = useWeb3React()
  const { openConnectModal } = useConnectModal()

  const primaryButtonLabel = useMemo(() => {
    if (!account) {
      return 'Connect Wallet'
    } else if (isLoading) {
      return 'Processing...'
    } else if (approvalState !== ApprovalState.APPROVED) {
      return 'Allow IXS'
    } else if (locked) {
      return (
        <Flex alignItems="center" style={{ gap: 6 }}>
          <CheckedIcon />
          Lock Created
        </Flex>
      )
    }
    return 'Lock'
  }, [account, approvalState, locked, isLoading])

  async function handleProceed() {
    try {
      setIsLoading(true)
      if (!account) {
        openConnectModal && openConnectModal()
      } else if (approvalState === ApprovalState.NOT_APPROVED) {
        await approve()
        await handleLock()
      } else {
        // token approved
        await handleLock()
      }
    } catch (error) {
      console.error('Error processing', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currencyBalance = useCurrencyBalance(account, currency || undefined)
  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalance)

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

      <StyledPrimaryButton
        onClick={() => handleProceed()}
        type="button"
        disabled={
          locked ||
          approvalState === ApprovalState.PENDING ||
          isLoading ||
          !userInput ||
          !maxInputAmount ||
          new Big(userInput).gt(maxInputAmount.toExact())
        }
        locked={locked}
      >
        {primaryButtonLabel}
      </StyledPrimaryButton>
      <ButtonOutlined onClick={() => history.push(routes.dexV2Dashboard)}>Go to Dashboard</ButtonOutlined>
    </Flex>
  )
}

const StyledPrimaryButton = styled(PinnedContentButton)<{ locked: boolean }>`
  ${({ locked, theme }) =>
    locked &&
    `
    background-color: ${theme.green51};
    color: ${theme.green5};
    border: 1px solid ${theme.green5};
  `}
`

export default LockContent
