import React from 'react'
import styled from 'styled-components'

import AppSlippageForm from '../forms/AppSlippageForm'
import BalBtn from './BalBtn'
import BalBtnGroup from './BalBtnGroup'

import { ethereumTxTypeOptions } from 'constants/dexV2/options'
import BalPopover from '../BalPopover'
import useNetwork from 'hooks/dex-v2/useNetwork'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import useFathom from 'hooks/dex-v2/useFathom'
import BalToggle from './BalToggle'
import BalTooltip from '../BalTooltip'

// If not defined elsewhere, you can define your enum like this:
export enum SwapSettingsContext {
  swap,
  invest,
}

type Props = {
  context: SwapSettingsContext
  isGasless?: boolean
}

const SwapSettingsPopover: React.FC<Props> = ({ context, isGasless = false }) => {
  // Hooks analogous to your Vue composables
  const { trackGoal, Goals } = useFathom()
  const {
    transactionDeadline,
    ethereumTxType,
    supportSignatures,
    setSupportSignatures,
    setEthereumTxType,
    setTransactionDeadline,
  } = useUserSettings()
  const { isEIP1559SupportedNetwork } = useNetwork()

  function onActivatorClick(): void {
    if (context === SwapSettingsContext.swap) {
      trackGoal(Goals.ClickSwapSettings)
    } else if (context === SwapSettingsContext.invest) {
      trackGoal(Goals.ClickJoinPoolSettings)
    }
  }

  return (
    <BalPopover
      activator={
        <BalBtn
          circle
          color="transparent"
          size="sm"
          className="mb-2 text-secondary icon-spin-anim"
          onClick={onActivatorClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </BalBtn>
      }
    >
      {/* Content */}
      <div>
        {/* Slippage Tolerance */}
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Slippage tolerance</span>
          <BalTooltip
            text="Market conditions may change between the time your order is submitted and the time it gets executed on Ethereum. Slippage tolerance is the maximum change in price you are willing to accept. This protects you from front-running bots and miner extractable value (MEV)."
            width="44px"
            textAlign="center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </BalTooltip>
        </div>
        <div style={{ marginTop: '0.25rem' }}>
          <AppSlippageForm />
        </div>

        {/* Transaction Type (if EIP1559 supported) */}
        {isEIP1559SupportedNetwork && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Transaction type</span>
              <BalTooltip
                text="Most users will want EIP-1559 Transactions, but there are some instances that may require a Legacy Transaction. For example, some Ledger users have had issues using MetaMask with EIP-1559 Transactions."
                textAlign="center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </BalTooltip>
            </div>
            <div style={{ display: 'flex', marginTop: '0.25rem' }}>
              <BalBtnGroup modelValue={ethereumTxType} options={ethereumTxTypeOptions} onChange={setEthereumTxType} />
            </div>
          </div>
        )}

        {/* Use Signatures */}
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Use signatures</span>
            <BalTooltip
              text="It's recommended to turn on signatures for gas-free transactions. However, if your wallet doesn't support the signing of signatures, you can turn it off."
              textAlign="center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            </BalTooltip>
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            <BalToggle modelValue={supportSignatures} name="supportSignatures" onToggle={setSupportSignatures} />
          </div>
        </div>

        {/* Transaction Deadline (if gassless and swap context) */}
        {isGasless && context === SwapSettingsContext.swap && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline' }}>
              <span style={{ marginBottom: '0.5rem', fontWeight: 500 }}>Transaction deadline</span>
              <BalTooltip
                text="Your swap will expire and not execute if it is pending for more than the selected duration. Only executed transactions incur fees for swaps between ERC-20 tokens."
                textAlign="center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </BalTooltip>
            </div>
            <DeadlineContainer style={{ marginTop: '0.25rem' }}>
              <DeadlineInputWrapper>
                <DeadlineInput
                  type="number"
                  step="1"
                  min="0"
                  placeholder="20"
                  value={transactionDeadline}
                  onChange={(e) => setTransactionDeadline(e.target.value)}
                />
              </DeadlineInputWrapper>
              <MinutesText>minutes</MinutesText>
            </DeadlineContainer>
          </div>
        )}
      </div>
    </BalPopover>
  )
}

export default SwapSettingsPopover

// Styled component for the deadline input area.
const DeadlineContainer = styled.div`
  display: flex;
  margin-top: 1rem;
`

const DeadlineInputWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 0.25rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
`

const DeadlineInput = styled.input`
  width: 2rem; /* equivalent to Tailwind w-8 */
  text-align: right;
  background: transparent;
  border: none;
  outline: none;
`

const MinutesText = styled.div`
  padding: 0 0.5rem;
`
