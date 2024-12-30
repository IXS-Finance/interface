import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { utils } from 'ethers'
import { Flex } from 'rebass'
import { Currency, CurrencyAmount } from '@ixswap1/sdk-core'
import { Line } from '../../Pool/Create'
import { useWeb3React } from 'hooks/useWeb3React'
import CurrencyInput from './CurrencyInput'
import { useLock } from '../LockProvider'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { useCurrencyBalance } from 'state/wallet/hooks'
import DurationSlider from './DurationSlider'
import LockExplanation from './LockExplanation'
import { ApprovalState, useAllowance } from 'hooks/useApproveCallback'
import { IXS_ADDRESS, VOTING_ESCROW_ADDRESS } from 'constants/addresses'
import useIXSCurrency from 'hooks/useIXSCurrency'

const LockContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const {
    userInput,
    setUserInput,
  } = useLock()
  const currency = useIXSCurrency()
  const { account, chainId } = useWeb3React()
  const { openConnectModal } = useConnectModal()
  
  const [approvalState, approve, refreshAllowance] = useAllowance(
    IXS_ADDRESS[chainId],
    utils.parseUnits(userInput || '0', currency?.decimals),
    VOTING_ESCROW_ADDRESS[chainId]
  )

  const walletLabel = useMemo(() => {
    if (!account) {
      return 'Connect Wallet'
    } else if (approvalState !== ApprovalState.APPROVED) {
      return 'Allow IXS'
    }
    return 'Lock'
  }, [account, approvalState])

  function handleLock() {

  }

  async function handleProceed() {
    if (!account) {
      openConnectModal && openConnectModal()
    } else if (approvalState === ApprovalState.NOT_APPROVED) {
      try {
        setIsLoading(true)
        await approve()
        setIsLoading(false)
        handleLock()
      } catch (error) {
        console.error('Error approving', error)
      }
    }
  }

  const currencyBalance = useCurrencyBalance(account, currency || undefined)
  const maxInputAmount: CurrencyAmount<Currency> | undefined = maxAmountSpend(currencyBalance)

  return (
    <Flex flexDirection='column' mt={3} style={{ gap: 32 }}>
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

      <ButtonPrimary
        onClick={() => handleProceed()}
        disabled={approvalState === ApprovalState.PENDING}
      >
        {walletLabel}
      </ButtonPrimary>
    </Flex>
  )
}

export default LockContent

const ButtonPrimary = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  border-radius: 8px;
  background: #66f;
  border: none;
  width: 100%;
  cursor: pointer;

  &:hover {
    transform: scale(0.99);
  }

  &:disabled {
    background: #ececfb;
  }
`
