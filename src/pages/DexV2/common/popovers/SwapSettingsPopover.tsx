import React from 'react'
import styled from 'styled-components'
import { Box, Flex } from 'rebass'

import AppSlippageForm from '../forms/AppSlippageForm'
import BalBtn from './BalBtn'
import { ethereumTxTypeOptions } from 'constants/dexV2/options'
import BalPopover from '../BalPopover'
import useNetwork from 'hooks/dex-v2/useNetwork'
import useUserSettings from 'state/dexV2/userSettings/useUserSettings'
import useFathom from 'hooks/dex-v2/useFathom'
import BalToggle from './BalToggle'
import BalTooltip from '../BalTooltip'
import BtnGroup from '../BtnGroup'

export enum SwapSettingsContext {
  swap,
  invest,
}

type Props = {
  context: SwapSettingsContext
  isGasless?: boolean
}

const SwapSettingsPopover: React.FC<Props> = ({ context, isGasless = false }) => {
  const { trackGoal, Goals } = useFathom()
  const { transactionDeadline, ethereumTxType, setEthereumTxType, setTransactionDeadline } = useUserSettings()
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
      <Container>
        <Title>Transaction settings</Title>
        <Box width="100%">
          <Flex alignItems="center" mb="16px">
            <Box fontWeight={500} fontSize="14px" pb="4px" mr="4px">
              Slippage tolerance
            </Box>
            <BalTooltip
              text="Market conditions may change between the time your order is submitted and the time it gets executed on Ethereum. Slippage tolerance is the maximum change in price you are willing to accept. This protects you from front-running bots and miner extractable value (MEV)."
              width="44px"
              textAlign="center"
              activator={
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                  <path
                    d="M7 7.2V10.2M7 4.806L7.006 4.7994M7 13.5C10.3138 13.5 13 10.8138 13 7.5C13 4.1862 10.3138 1.5 7 1.5C3.6862 1.5 1 4.1862 1 7.5C1 10.8138 3.6862 13.5 7 13.5Z"
                    stroke="#B8B8CC"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
            />
          </Flex>

          <AppSlippageForm />
          <Line />
        </Box>

        {/* Transaction Type (if EIP1559 supported) */}
        {isEIP1559SupportedNetwork && (
          <div>
            <Flex alignItems="center" mb="16px">
              <Box fontWeight={500} fontSize="14px" pb="4px" mr="4px">
                Transaction type
              </Box>
              <BalTooltip
                text="Most users will want EIP-1559 Transactions, but there are some instances that may require a Legacy Transaction. For example, some Ledger users have had issues using MetaMask with EIP-1559 Transactions."
                textAlign="center"
                activator={
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                    <path
                      d="M7 7.2V10.2M7 4.806L7.006 4.7994M7 13.5C10.3138 13.5 13 10.8138 13 7.5C13 4.1862 10.3138 1.5 7 1.5C3.6862 1.5 1 4.1862 1 7.5C1 10.8138 3.6862 13.5 7 13.5Z"
                      stroke="#B8B8CC"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
            </Flex>
            <BtnGroup value={ethereumTxType} options={ethereumTxTypeOptions} onChange={setEthereumTxType} />
          </div>
        )}

        {/* Transaction Deadline (if gassless and swap context) */}
        {isGasless && context === SwapSettingsContext.swap && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Box fontWeight={500} fontSize="14px" pb="4px" mr="4px">
                Transaction deadline
              </Box>
              <BalTooltip
                text="Your swap will expire and not execute if it is pending for more than the selected duration. Only executed transactions incur fees for swaps between ERC-20 tokens."
                textAlign="center"
                activator={
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
                    <path
                      d="M7 7.2V10.2M7 4.806L7.006 4.7994M7 13.5C10.3138 13.5 13 10.8138 13 7.5C13 4.1862 10.3138 1.5 7 1.5C3.6862 1.5 1 4.1862 1 7.5C1 10.8138 3.6862 13.5 7 13.5Z"
                      stroke="#B8B8CC"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />
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
      </Container>
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

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

const Container = styled.div`
  border-radius: 16px;
  border: 1px solid #e6e6ff;
  background: #fff;
  box-shadow: 0px 16px 48px 0px rgba(63, 63, 132, 0.16);
  display: flex;
  width: 384px;
  padding: 32px;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`

const Line = styled.div`
  border-top: 1px solid #e6e6ff;
  margin-top: 16px;
  width: 100%;
`
