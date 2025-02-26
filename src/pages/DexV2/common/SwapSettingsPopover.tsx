// SwapSettingsPopover.tsx
import React, { FC, useState } from 'react'
import { Flex, Box, Button } from 'rebass'
import styled from 'styled-components'

// Custom hooks (make sure to implement or import these)
import { ethereumTxTypeOptions } from 'constants/dexV2/options'

// Custom UI components – you may replace these with your own implementations
import AppSlippageForm from './forms/AppSlippageForm'
import Tooltip from './Tooltip'
import BtnGroup from './BtnGroup'
import Toggle from './Toggle'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import { isEIP1559SupportedNetwork } from 'hooks/dex-v2/useNetwork'

export enum SwapSettingsContext {
  swap,
  invest,
}

interface SwapSettingsProps {
  isGassless?: boolean
}

const SwapSettingsPopover: FC<SwapSettingsProps> = ({ isGassless = false }) => {
  // CUSTOM HOOKS
  const {
    supportSignatures,
    transactionDeadline,
    ethereumTxType,
    setSupportSignatures,
    setEthereumTxType,
    setTransactionDeadline,
  } = useUserSettings()
  const eip1559Supported = isEIP1559SupportedNetwork

  // Popover open/close state
  const [isPopoverOpen, setPopoverOpen] = useState(false)

  // When the activator is clicked, call the tracking function and toggle the popover.
  const onActivatorClick = () => {
    setPopoverOpen((prev) => !prev)
  }

  return (
    <PopoverWrapper>
      {/* Activator Button */}
      <ActivatorButton
        variant="primary"
        size="sm"
        className="mb-2 icon-spin-anim"
        onClick={onActivatorClick}
        css={{ color: 'gray' }}
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
      </ActivatorButton>

      {/* Popover Content */}
      {isPopoverOpen && (
        <PopoverContent>
          {/* Slippage Tolerance Section */}
          <Box mb={4}>
            <Flex alignItems="baseline">
              <Box as="span" fontWeight="bold" mb={2}>
                Slippage tolerance
              </Box>
              <Tooltip text="Market conditions may change between the time your order is submitted and the time it gets executed on Ethereum. Slippage tolerance is the maximum change in price you are willing to accept. This protects you from front-running bots and miner extractable value (MEV).">
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
              </Tooltip>
            </Flex>
            <Box mt={1}>
              <AppSlippageForm />
            </Box>
          </Box>

          {/* Transaction Type Section (if network supports EIP1559) */}
          {eip1559Supported && (
            <Box mb={4}>
              <Flex alignItems="baseline">
                <Box as="span" fontWeight="bold" mb={2}>
                  Transaction type
                </Box>
                <Tooltip text="Most users will want EIP-1559 Transactions, but there are some instances that may require a Legacy Transaction. For example, some Ledger users have had issues using MetaMask with EIP-1559 Transactions.">
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
                </Tooltip>
              </Flex>
              <Flex mt={1}>
                <BtnGroup value={ethereumTxType} options={ethereumTxTypeOptions} onChange={setEthereumTxType} />
              </Flex>
            </Box>
          )}

          {/* Use Signatures Section */}
          <Box mb={4}>
            <Flex alignItems="baseline">
              <Box as="span" fontWeight="bold" mb={2}>
                Use signatures
              </Box>
              <Tooltip text="It's recommended to turn on signatures for gas-free transactions. However, if your wallet doesn't support the signing of signatures, you can turn it off.">
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
              </Tooltip>
            </Flex>
            <Box mt={1}>
              <Toggle checked={supportSignatures} name="supportSignatures" onToggle={setSupportSignatures} />
            </Box>
          </Box>

          {/* Transaction Deadline Section */}
          {isGassless && (
            <Box>
              <Flex alignItems="baseline">
                <Box as="span" fontWeight="bold" mb={2}>
                  Transaction deadline
                </Box>
                <Tooltip text="Your swap will expire and not execute if it is pending for more than the selected duration. Only executed transactions incur fees for swaps between ERC-20 tokens.">
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
                </Tooltip>
              </Flex>
              <Flex mt={1} alignItems="center">
                <Box
                  px={1}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '8px',
                    border: '1px solid #4b5563',
                    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
                  }}
                >
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={transactionDeadline}
                    onChange={(e) => setTransactionDeadline(Number(e.target.value))}
                    placeholder="20"
                    style={{
                      width: '32px',
                      textAlign: 'right',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                    }}
                  />
                </Box>
                <Box px={2}>minutes</Box>
              </Flex>
            </Box>
          )}
        </PopoverContent>
      )}
    </PopoverWrapper>
  )
}

export default SwapSettingsPopover

const PopoverWrapper = styled(Box)`
  position: relative;
  display: inline-block;
`

const PopoverContent = styled(Box)`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 300px;
`

const ActivatorButton = styled(Button)`
  border-radius: 50%;
  background-color: white;
  color: #6b7280;
`
