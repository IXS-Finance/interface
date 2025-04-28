import React, { useEffect, useState } from 'react'
import { Box, Flex } from 'rebass'
import styled from 'styled-components'
import LockSelect from './LockSelect'

import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { VeSugar } from 'services/balancer/contracts/ve-sugar'
import VotingModal from './VoteModal'
import { PoolsHasGauge } from 'hooks/dex-v2/queries/usePoolsHasGaugeQuery'

interface SelectLockToVoteProps {
  pools: PoolsHasGauge[]
  epochVoteStart: number
  epochVoteEnd: number
}

const SelectLockToVote: React.FC<SelectLockToVoteProps> = ({ pools, epochVoteStart, epochVoteEnd }) => {
  const { account } = useWeb3()

  const [lockedList, setLockedList] = useState<any[]>([])
  const [isOpenVoteingModal, setIsOpenVotingModal] = useState(false)
  const [selectedLock, setSelectedLock] = useState<any>(null)

  const toggleVotingModal = () => {
    setIsOpenVotingModal(!isOpenVoteingModal)
  }

  const handleSelectLock = (lock: any) => {
    setSelectedLock(lock)
  }

  const getData = () => {
    const veSugar = new VeSugar()
    veSugar.byAccount(account).then((data) => {
      setLockedList(data)
    })
  }

  const onSuccess = () => {
    getData()
    setIsOpenVotingModal(false)
    setSelectedLock(null)
  }

  useEffect(() => {
    if (account) {
      getData()
    }
  }, [account])

  return (
    <MainContainer justifyContent="space-between" alignItems="center" alignSelf="stretch" css={{ margin: '0 auto' }}>
      <Flex flexDirection="column" alignItems="flex-start">
        <Box
          color="#292933"
          fontSize="32px"
          fontStyle="normal"
          fontWeight={600}
          lineHeight="120%"
          letterSpacing="-0.96px"
        >
          Liquidity Pools for Voting
        </Box>
        <Box
          color="rgba(41, 41, 51, 0.70)"
          fontFamily="Inter"
          fontSize="18px"
          fontStyle="normal"
          fontWeight={400}
          lineHeight="150%"
          letterSpacing="-0.36px"
          maxWidth="498px"
        >
          Select one of your locks to begin voting and influence where protocol incentives go. You can vote for one or
          multiple pools - your voting power will be split proportionally across your selections. Fees and protocol
          incentives will also be distributed proportionally based on your votes.
        </Box>
      </Flex>
      <Flex
        width="480px"
        p="48px"
        flexDirection="column"
        alignItems="flex-start"
        css={{
          gap: '16px',
          borderRadius: '16px',
          background: '#FFF',
          boxShadow: '0px 30px 48px 0px rgba(63, 63, 132, 0.05)',
        }}
      >
        <Box
          color="rgba(41, 41, 51, 0.90)"
          fontSize="20px"
          fontStyle="normal"
          fontWeight={600}
          lineHeight="normal"
          letterSpacing="-0.6px"
        >
          Select Lock for Voting
        </Box>

        <LockSelect
          options={lockedList}
          epochVoteStart={epochVoteStart}
          epochVoteEnd={epochVoteEnd}
          value={selectedLock}
          onChange={handleSelectLock}
        />

        <BalBtn style={{ width: '100%' }} onClick={toggleVotingModal} disabled={!selectedLock}>
          Vote
        </BalBtn>
      </Flex>

      <VotingModal
        selectedLock={selectedLock}
        isVisible={isOpenVoteingModal}
        pools={pools}
        onClose={toggleVotingModal}
        onSuccess={onSuccess}
      />
    </MainContainer>
  )
}

export default SelectLockToVote

const MainContainer = styled(Flex)`
  width: 1180px;
`
