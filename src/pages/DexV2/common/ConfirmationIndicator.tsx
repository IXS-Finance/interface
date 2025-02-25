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
        <a href={confirmationData?.explorerLink}>
          {networkConfig.explorerName}
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="1em"
            width="1em"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z"></path>
          </svg>
        </a>
      </RightContainer>
    </Container>
  )
}

export default ConfirmationIndicator
