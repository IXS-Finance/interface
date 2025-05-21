import React, { useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { TYPE } from 'theme'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ReactComponent as CheckedIcon } from 'assets/images/checked-green.svg'
import { PinnedContentButton, ButtonOutlined } from 'components/Button'
import { Line } from 'components/Line'
import { ApprovalState } from 'hooks/useApproveCallback'
import useIXSCurrency from 'hooks/useIXSCurrency'
import { useWeb3React } from 'hooks/useWeb3React'
import { CurrencyAmount, Currency } from '@ixswap1/sdk-core'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { routes } from 'utils/routes'
import { useCurrencyBalance } from 'state/wallet/hooks'
import { LockedData } from 'services/balancer/contracts/ve-sugar'
import { useLockDetail } from '../LockDetailProvider'
import LockExtendAutoMaxLockMode from './LockExtendAutoMaxLockMode'
import LockExtendDurationSlider from './LockExtendDurationSlider'
import LockExtendExplanation from './LockExtendExplanation'
import LockIncreaseCurrencyInput from './LockIncreaseCurrencyInput'
import LockIncreaseExplanation from './LockIncreaseExplanation'
import LockInfo from './LockInfo'

const LockDetailContent: React.FC<{ lockDetail?: LockedData }> = ({ lockDetail }) => {
  const [isLoading, setIsLoading] = useState(false)
  const {
    userInput,
    setUserInput,
    handleSubmitIncrease,
    handleSubmitExtend,
    approvalState,
    approve,
    increased,
    setIncreased,
    extended,
    setExtended,
    openMaxLockMode,
    setOpenMaxLockMode,
  } = useLockDetail()
  const history = useHistory()
  const currency = useIXSCurrency()
  const { account } = useWeb3React()
  const { openConnectModal } = useConnectModal()

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)

  const isIncrease = searchParams.get('increase') === 'true'
  const isExtend = searchParams.get('extend') === 'true'

  const primaryButtonLabel = useMemo(() => {
    if (!account) {
      return 'Connect Wallet'
    } else if (isLoading) {
      return 'Processing...'
    } else if (approvalState !== ApprovalState.APPROVED) {
      return 'Allow IXS'
    } else if (isIncrease) {
      if (increased) {
        return (
          <Flex alignItems="center" style={{ gap: 6 }}>
            <CheckedIcon />
            Lock Increased
          </Flex>
        )
      } else {
        return 'Add to Lock'
      }
    } else if (isExtend) {
      if (extended) {
        return (
          <Flex alignItems="center" style={{ gap: 6 }}>
            <CheckedIcon />
            Lock Extended
          </Flex>
        )
      } else {
        return 'Extend Lock'
      }
    }
    return 'Lock'
  }, [account, approvalState, increased, extended, isLoading, isIncrease, isExtend])

  async function handleProceed() {
    if (isIncrease) {
      await handleIncrease()
    } else if (isExtend) {
      await handleExtend()
    }
  }

  async function handleIncrease() {
    try {
      setIsLoading(true)
      if (!account) {
        openConnectModal && openConnectModal()
      } else if (approvalState === ApprovalState.NOT_APPROVED) {
        await approve()
      } else {
        await handleSubmitIncrease()
      }
    } catch (error) {
      console.error('Error processing', error)
      if (error instanceof Error && error.message.includes('exceeds max lock duration')) {
        toast.error('Increase failed! Please update amount and try again!')
      } else if (error instanceof Error && error.message.includes('insufficient balance')) {
        toast.error('Increase failed! Please update amount and try again!')
      } else if (error instanceof Error && error.message.includes('insufficient allowance')) {
        toast.error('Increase failed! Please update allowance and try again!')
      } else if (error instanceof Error && error.message.includes('cannot estimate gas')) {
        toast.error('Increase failed! Please update amount and try again!')
      } else {
        toast.error('Increase failed! Please try again!')
      }
      setIncreased(false)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleExtend() {
    try {
      setIsLoading(true)
      if (!account) {
        openConnectModal && openConnectModal()
      } else {
        await handleSubmitExtend()
      }
    } catch (error) {
      console.error('Error processing', error)
      if (error instanceof Error && error.message.includes('exceeds max lock duration')) {
        toast.error('Extend failed! Please increase lock time and try again!')
      } else if (error instanceof Error && error.message.includes('insufficient balance')) {
        toast.error('Extend failed! Please update amount and try again!')
      } else if (error instanceof Error && error.message.includes('insufficient allowance')) {
        toast.error('Extend failed! Please update allowance and try again!')
      } else if (error instanceof Error && error.message.includes('cannot estimate gas')) {
        toast.error('Extend failed! Please increase lock time and try again!')
      } else {
        toast.error('Extend failed! Please try again!')
      }
      setExtended(false)
    } finally {
      setIsLoading(false)
    }
  }

  const currencyBalance = useCurrencyBalance(account, currency || undefined)
  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalance)

  return (
    <Card>
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <TYPE.label>{isExtend ? 'Extending' : isIncrease ? 'Increase' : ''} Lock</TYPE.label>
        <TYPE.subHeader1 color="text6">Lock #{lockDetail?.id}</TYPE.subHeader1>
      </Flex>
      <Flex flexDirection="column" mt={3} style={{ gap: 32 }}>
        {lockDetail?.token && <LockInfo lockDetail={lockDetail} currency={currency} />}

        {isIncrease && (
          <LockIncreaseCurrencyInput
            value={userInput}
            currency={currency}
            onUserInput={setUserInput}
            onMax={() => setUserInput(maxInputAmount?.toExact() ?? '')}
            fiatValue={undefined}
          />
        )}

        {isExtend && (
          <LockExtendAutoMaxLockMode openMaxLockMode={openMaxLockMode} setOpenMaxLockMode={setOpenMaxLockMode} />
        )}
        {isExtend && <LockExtendDurationSlider />}

        {(isIncrease || isExtend) && <Line style={{ margin: 0 }} />}

        {isIncrease && <LockIncreaseExplanation lockDetail={lockDetail} />}
        {isExtend && <LockExtendExplanation />}

        {(isIncrease || isExtend) && (
          <StyledPrimaryButton
            onClick={() => handleProceed()}
            type="button"
            disabled={
              approvalState === ApprovalState.PENDING ||
              isLoading ||
              (isIncrease && !userInput) ||
              (isIncrease && increased) ||
              (isExtend && extended)
            }
            success={(isIncrease && increased) || (isExtend && extended)}
          >
            {primaryButtonLabel}
          </StyledPrimaryButton>
        )}
        <ButtonOutlined onClick={() => history.push(routes.dexV2Dashboard)}>Go to Dashboard</ButtonOutlined>
      </Flex>
    </Card>
  )
}

const StyledPrimaryButton = styled(PinnedContentButton)<{ success: boolean }>`
  ${({ success, theme }) =>
    success &&
    `
    background-color: ${theme.green51};
    color: ${theme.green5};
    border: 1px solid ${theme.green5};
    &:disabled {
      background-color: ${theme.green51};
      color: ${theme.green5};
      border: 1px solid ${theme.green5};
    }
  `}
`

export default LockDetailContent

const Card = styled.div`
  border-radius: 16px;
  background: #fff;
  box-shadow: 0px 30px 48px 0px rgba(63, 63, 132, 0.05);
  padding: 24px;

  @media (min-width: 640px) {
    padding: 32px;
  }

  @media (min-width: 1024px) {
    padding: 48px;
  }
`
