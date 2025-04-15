import React, { useState } from 'react'
import styled from 'styled-components'
import Portal from '@reach/portal'

import { ReactComponent as CrossIcon } from 'assets/launchpad/svg/close.svg'
import { Box, Flex } from 'rebass'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import PoolWeightInput from './PoolWeightInput'
import { PoolsHasGauge } from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'
import SelectPoolModal from './SelectPoolModal'

interface Props {
  pools: PoolsHasGauge[]
  isVisible: boolean
  onClose: () => void
  onSuccess: () => void
}

const VotingModal: React.FC<Props> = ({ pools, isVisible, onClose, onSuccess }) => {
  const [isOpenSelectPoolModal, setIsOpenSelectPoolModal] = useState(false)

  const onCloseSelectPoolModal = () => {
    setIsOpenSelectPoolModal(false)
  }

  const handleClose = () => {
    onClose()
  }

  const handleSuccess = () => {
    onSuccess()
  }

  if (!isVisible) return null

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
              Lock #63492
            </Box>

            <ExitIconContainer onClick={onClose}>
              <CrossIcon />
            </ExitIconContainer>
          </Flex>

          <Flex flexDirection="column" p="32px" css={{ gap: '16px' }}>
            <Box color="rgba(41, 41, 51, 0.90)" fontSize="20px" fontWeight={600}>
              Your Allocations
            </Box>

            <Flex flexDirection="column" css={{ gap: '16px' }}>
              {pools?.map((pool) => (
                <PoolWeightInput
                  key={pool.id}
                  tokensList={pool.tokensList}
                  label={pool.name}
                  weight={0}
                  updateWeight={() => {}}
                  updateLocked={() => {}}
                  deleteItem={() => {}}
                  updateAddress={() => {}}
                  excludedTokens={[]}
                />
              ))}
            </Flex>

            <Box color="#B8B8D2" fontSize="14px" fontWeight={500}>
              Total weight must equal 100%
            </Box>

            <Flex alignSelf="stretch" css={{ gap: '8px' }}>
              <BalBtn block outline onClick={() => setIsOpenSelectPoolModal(true)}>
                Add Pool
              </BalBtn>
              <BalBtn block>Submit</BalBtn>
            </Flex>
          </Flex>
          {isOpenSelectPoolModal && (
            <SelectPoolModal
              pools={pools}
              excludedTokens={[]}
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
