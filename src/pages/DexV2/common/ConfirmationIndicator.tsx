import React from 'react'
import styled from 'styled-components'
import { useQuery } from '@tanstack/react-query'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

import QUERY_KEYS from 'constants/dexV2/queryKeys'
import useEthers from 'hooks/dex-v2/useEthers'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useConfig from 'hooks/dex-v2/useConfig'
import { dateTimeLabelFor } from 'hooks/dex-v2/useTime'
import LoadingBlock from './LoadingBlock'

type ConfirmationData = {
  confirmedAt: string
  explorerLink: string
}

type Props = {
  txReceipt: TransactionReceipt
}

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem; /* equivalent to text-sm */
  color: #9ca3af; /* text-gray-400 */
`

const LeftContainer = styled.div`
  display: flex;
  align-items: center;
  color: #b8b8d2;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const RightContainer = styled.div`
  display: flex;
  align-items: center;
`

const ConfirmationIndicator: React.FC<Props> = ({ txReceipt }) => {
  const { getTxConfirmedAt } = useEthers()
  const { explorerLinks } = useWeb3()
  const { networkConfig } = useConfig()

  // Enable the query only if a transaction hash exists.
  const isQueryEnabled = !!txReceipt?.transactionHash

  const {
    data: confirmationData,
    isLoading: isFetchingConfirmationDate,
    error,
  } = useQuery<ConfirmationData>({
    queryKey: QUERY_KEYS.Transaction.ConfirmationDate(txReceipt),
    queryFn: async () => {
      const confirmedAt = await getTxConfirmedAt(txReceipt)
      const explorerLink = explorerLinks.txLink(txReceipt.transactionHash)
      return {
        confirmedAt: dateTimeLabelFor(confirmedAt),
        explorerLink,
      }
    },
    enabled: isQueryEnabled,
  })

  const isLoading = isFetchingConfirmationDate || !!error

  if (isLoading) {
    return <LoadingBlock style={{ height: '1.5rem' }} />
  }

  return (
    <Container>
      <LeftContainer>
        <svg
          stroke="currentColor"
          fill="currentColor"
          strokeWidth="0"
          viewBox="0 0 512 512"
          height="1em"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8zm0 448c-110.5 0-200-89.5-200-200S145.5 56 256 56s200 89.5 200 200-89.5 200-200 200zm61.8-104.4l-84.9-61.7c-3.1-2.3-4.9-5.9-4.9-9.7V116c0-6.6 5.4-12 12-12h32c6.6 0 12 5.4 12 12v141.7l66.8 48.6c5.4 3.9 6.5 11.4 2.6 16.8L334.6 349c-3.9 5.3-11.4 6.5-16.8 2.6z"></path>
        </svg>
        <span style={{ marginLeft: '0.5rem' }}>{confirmationData?.confirmedAt}</span>
      </LeftContainer>
      <RightContainer>
        <ExploreLink href={confirmationData?.explorerLink} target='_blank' rel='noopener noreferrer'>
          {networkConfig.explorerName}
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M3 1H9M9 1V7M9 1L1 9"
              stroke="#6666FF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ExploreLink>
      </RightContainer>
    </Container>
  )
}

export default ConfirmationIndicator

const ExploreLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: #66f;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`
