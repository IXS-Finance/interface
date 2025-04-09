import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Flex } from 'rebass'
import styled from 'styled-components'
import { TYPE } from 'theme'

import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ReactComponent as CheckedIcon } from 'assets/images/checked-green.svg'
import { PinnedContentButton } from 'components/Button'
import { Line } from 'components/Line'
import { ApprovalState } from 'hooks/useApproveCallback'
import useIXSCurrency from 'hooks/useIXSCurrency'
import { useWeb3React } from 'hooks/useWeb3React'
import { LockedData } from 'services/balancer/contracts/ve-sugar'
import { useLockDetail } from '../LockDetailProvider'
import LockExtendAutoMaxLockMode from './LockExtendAutoMaxLockMode'
import LockExtendDurationSlider from './LockExtendDurationSlider'
import LockExtendExplanation from './LockExtendExplanation'
import LockInfo from './LockInfo'

const LockDetailContent: React.FC<{ lockDetail?: LockedData }> = ({ lockDetail }) => {
  const [isLoading, setIsLoading] = useState(false)
  const { handleSubmitExtend, approvalState, extended, setExtended, openMaxLockMode, setOpenMaxLockMode } =
    useLockDetail()
  const currency = useIXSCurrency()
  const { account } = useWeb3React()
  const { openConnectModal } = useConnectModal()

  const location = useLocation()

  const searchParams = useMemo(() => {
    return new URLSearchParams(location.search)
  }, [location.search])

  const isExtend = searchParams.get('extend') === 'true'

  const primaryButtonLabel = useMemo(() => {
    if (!account) {
      return 'Connect Wallet'
    } else if (isLoading) {
      return 'Processing...'
    } else if (approvalState !== ApprovalState.APPROVED) {
      return 'Allow IXS'
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
  }, [account, approvalState, extended, isLoading, isExtend])

  async function handleProceed() {
    if (isExtend) {
      await handleExtend()
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

  return (
    <Card>
      <Flex justifyContent="space-between" alignItems="center" mb={2}>
        <TYPE.label>{isExtend ? 'Extending' : ''} Lock</TYPE.label>
        <TYPE.subHeader1 color="text6">Lock #{lockDetail?.id}</TYPE.subHeader1>
      </Flex>
      <Flex flexDirection="column" mt={3} style={{ gap: 32 }}>
        {lockDetail?.token && <LockInfo lockDetail={lockDetail} currency={currency} />}

        {isExtend && (
          <LockExtendAutoMaxLockMode openMaxLockMode={openMaxLockMode} setOpenMaxLockMode={setOpenMaxLockMode} />
        )}
        {isExtend && <LockExtendDurationSlider />}

        <Line style={{ margin: 0 }} />

        {isExtend && <LockExtendExplanation />}

        <StyledPrimaryButton
          onClick={() => handleProceed()}
          type="button"
          disabled={approvalState === ApprovalState.PENDING || isLoading}
          success={isExtend && extended}
        >
          {primaryButtonLabel}
        </StyledPrimaryButton>
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
