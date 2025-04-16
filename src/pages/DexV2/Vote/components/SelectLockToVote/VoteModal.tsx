/* eslint-disable react/no-unescaped-entities */
import React, { useState } from 'react'
import styled from 'styled-components'
import Portal from '@reach/portal'
import { parseUnits } from '@ethersproject/units'

import { ReactComponent as CrossIcon } from 'assets/launchpad/svg/close.svg'
import { Box, Flex } from 'rebass'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import PoolWeightInput from './PoolWeightInput'
import { PoolsHasGauge } from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'
import SelectPoolModal from './SelectPoolModal'
import useVote from 'state/dexV2/vote/useVote'
import { PoolToken } from 'state/dexV2/vote'
import { Voter } from 'services/balancer/contracts/voter'
import useWeb3 from 'hooks/dex-v2/useWeb3'

interface Props {
  selectedLock: any
  pools: PoolsHasGauge[]
  isVisible: boolean
  onClose: () => void
  onSuccess: () => void
}

const VotingModal: React.FC<Props> = ({ pools, selectedLock, isVisible, onClose, onSuccess }) => {
  const voter = new Voter()
  const { isWalletReady } = useWeb3()

  const { seedTokens, updateTokenWeight, updateLockedWeight, removeTokenWeights } = useVote()
  const [isOpenSelectPoolModal, setIsOpenSelectPoolModal] = useState(false)
  const totalAllocatedWeight = seedTokens.reduce((acc: number, pool: PoolToken) => acc + Number(pool.weight), 0)

  const isProceedDisabled = (() => {
    if (!isWalletReady) return true
    if (totalAllocatedWeight !== 100) return true
    if (seedTokens.length === 0) return true
    return false
  })()

  const onCloseSelectPoolModal = () => {
    setIsOpenSelectPoolModal(false)
  }

  function handleWeightChange(weight: string, id: number) {
    updateTokenWeight(id, Number(weight))
  }

  function handleLockedWeight(isLocked: boolean, id: number) {
    updateLockedWeight(id, isLocked)
  }

  function handleRemoveToken(index: number) {
    removeTokenWeights(index)
  }

  const handleClose = () => {
    onClose()
  }

  const handleSuccess = () => {
    onSuccess()
  }

  const handleVote = async () => {
    try {
      const poolVote = seedTokens.map((pool: PoolToken) => pool.tokenAddress)
      const poolWeights = seedTokens.map((pool: PoolToken) => parseUnits(pool.weight.toString(), 18).toString())
      console.log('poolVote', poolVote)
      console.log('poolWeights', poolWeights)

      const res = await voter.vote(selectedLock?.id, poolVote, poolWeights)
      console.log('Vote Response:', res)
    } catch (error) {
      console.error('Error during voting:', error)
    }
  }

  if (!isVisible) return null

  console.log('seedTokens', seedTokens)
  return (
    <Portal>
      <ModalBackdrop>
        <ModalContainer>
          <Flex
            justifyContent="space-between"
            alignItems="center"
            bg="#F5F5FF"
            p="32px"
            css={{ borderRadius: '16px 16px 0 0' }}
          >
            <Box color="#B8B8D2" fontSize="14px" fontWeight={500}>
              Lock #{selectedLock?.id}
            </Box>

            <ExitIconContainer onClick={onClose}>
              <CrossIcon />
            </ExitIconContainer>
          </Flex>

          <Flex flexDirection="column" p="32px" css={{ gap: '16px' }}>
            <Box color="rgba(41, 41, 51, 0.90)" fontSize="20px" fontWeight={600}>
              Your Allocations
            </Box>

            {!seedTokens || seedTokens.length === 0 ? (
              <Box>No pools selected. Let choose "Add pool"!</Box>
            ) : (
              <Flex flexDirection="column" css={{ gap: '16px' }}>
                {seedTokens?.map((pool: PoolToken, i: number) => (
                  <PoolWeightInput
                    key={pool.id}
                    tokensList={pool.tokensList}
                    weight={pool.weight}
                    label={pool.name}
                    updateWeight={(data) => handleWeightChange(data, i)}
                    updateLocked={(data) => handleLockedWeight(data, i)}
                    deleteItem={() => handleRemoveToken(i)}
                  />
                ))}
              </Flex>
            )}

            {false ? (
              <Box color="#B8B8D2" fontSize="14px" fontWeight={500}>
                Total weight must equal 100%
              </Box>
            ) : null}

            <Flex alignSelf="stretch" css={{ gap: '8px' }}>
              <BalBtn block outline onClick={() => setIsOpenSelectPoolModal(true)}>
                Add Pool
              </BalBtn>
              <BalBtn block disabled={isProceedDisabled} onClick={handleVote}>
                Submit
              </BalBtn>
            </Flex>
          </Flex>
          {isOpenSelectPoolModal && (
            <SelectPoolModal
              pools={pools}
              excludedTokens={seedTokens.map((pool: PoolToken) => pool.tokenAddress)}
              updateAddress={() => {}}
              onClose={onCloseSelectPoolModal}
              ignoreBalances
            />
          )}
        </ModalContainer>
      </ModalBackdrop>
    </Portal>
  )
}

export default VotingModal

const ModalBackdrop = styled.div<{ width?: string; height?: string }>`
  display: grid;
  place-content: center;
  width: 100vw;
  height: 100vh;
  background: rgba(143, 143, 204, 0.2);
  backdrop-filter: blur(5px);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 10;
`

const ModalContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  position: relative;
  width: 480px;
  background: ${(props) => props.theme.launchpad.colors.background};
  border-radius: 16px;
`

export const ExitIconContainer = styled.div`
  cursor: pointer;

  svg {
    fill: ${(props) => props.theme.launchpad.colors.text.body};
  }
`
