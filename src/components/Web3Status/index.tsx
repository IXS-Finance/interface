import { useMemo } from 'react'
import { Trans } from '@lingui/macro'
import styled from 'styled-components'
import { ChevronDown } from 'react-feather'
import { isMobile } from 'react-device-detect'

import useENSName from '../../hooks/useENSName'
import { useWalletModalToggle } from '../../state/application/hooks'
import { isTransactionRecent, useAllTransactions } from '../../state/transactions/hooks'
import { TransactionDetails } from '../../state/transactions/reducer'
import { shortenAddress } from '../../utils'
import { ButtonSecondary } from '../Button'
import Loader from '../Loader'
import { RowBetween } from '../Row'
import WalletModal from '../WalletModal'
import { useETHBalances } from 'state/wallet/hooks'
import { formatAmount } from 'utils/formatCurrencyAmount'
import { useAccount } from 'hooks/useAccount'
import { CONNECTOR_ICON_OVERRIDE_MAP } from 'components/Web3Provider/constants'
import { useWeb3React } from 'hooks/useWeb3React'
import { useNativeCurrency } from 'hooks/useNativeCurrency'

function newTransactionsFirst(a: TransactionDetails, b: TransactionDetails) {
  return b.addedTime - a.addedTime
}

export function StatusIcon() {
  const { connector } = useAccount()
  const icon = connector ? CONNECTOR_ICON_OVERRIDE_MAP[connector?.id] ?? connector?.icon : undefined

  return (
    <>
      {icon ? (
        <IconWrapper size={20}>
          <img src={icon} alt={'Icon'} style={{ borderRadius: 12 }} />
        </IconWrapper>
      ) : null}
    </>
  )
}

function Web3StatusInner() {
  const { account } = useWeb3React()
  const { ENSName } = useENSName(account ?? undefined)
  const allTransactions = useAllTransactions()
  const userEthBalance = useETHBalances(account ? [account] : [])?.[account ?? '']
  const nativeCurrency = useNativeCurrency()
  const toggleWalletModal = useWalletModalToggle()

  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst)
  }, [allTransactions])
  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const hasPendingTransactions = !!pending.length

  return (
    <>
      {account ? (
        <Web3StatusConnected id="web3-status-connected" onClick={toggleWalletModal} pending={hasPendingTransactions}>
          {!hasPendingTransactions && <StatusIcon />}
          {hasPendingTransactions ? (
            <RowBetween>
              <Text style={{ margin: '4px 13px 4px 0' }}>
                <Trans>{pending?.length} Pending</Trans>
              </Text>{' '}
              <Loader stroke="white" />
            </RowBetween>
          ) : (
            <Text style={{ margin: '4px 13px 4px 5px', width: '100%' }}>{ENSName || shortenAddress(account)}</Text>
          )}

          {!isMobile ? (
            <AccountElement style={{ pointerEvents: 'auto' }}>
              {account && userEthBalance ? (
                <Trans>
                  {formatAmount(+(userEthBalance?.toSignificant(4) || 0))} {nativeCurrency?.symbol}
                </Trans>
              ) : null}
            </AccountElement>
          ) : null}

          <ChevronElement />
        </Web3StatusConnected>
      ) : null}
    </>
  )
}

export default function Web3Status() {
  const { account } = useWeb3React()

  const { ENSName } = useENSName(account ?? undefined)

  return (
    <>
      <Web3StatusInner />
      <WalletModal ENSName={ENSName ?? undefined} />
    </>
  )
}

const IconWrapper = styled.div<{ size?: number }>`
  ${({ theme }) => theme.flexColumnNoWrap};
  align-items: center;
  justify-content: center;
  & > * {
    height: ${({ size }) => (size ? size + 'px' : '32px')};
    width: ${({ size }) => (size ? size + 'px' : '32px')};
  }
`

const Web3StatusGeneric = styled(ButtonSecondary)`
  ${({ theme }) => theme.flexRowNoWrap}
  width: 100%;
  align-items: center;
  padding: 0;
  border: none;
  opacity: unset;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  outline: none;
`

const Web3StatusConnected = styled(Web3StatusGeneric)<{ pending?: boolean }>`
  background: ${({ theme }) => theme.bg25};
  opacity: ${({ pending }) => (pending ? '0.7' : '1')};
  padding: 9px 5px 9px 10px;
  color: ${({ theme }) => theme.black};
  // font-weight: 600;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #e6e6ff;

  ${({ theme }) => theme.mediaWidth.upToMedium`
     z-index: 0;
  `};
`

const Text = styled.p`
  flex: 1 1 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  width: fit-content;
  font-weight: 600;
  line-height: 18px;
`

const AccountElement = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 12px;
  white-space: nowrap;
  width: fit-content;
  cursor: pointer;
  :focus {
    border: 1px solid blue;
  }
`

const ChevronElement = styled(ChevronDown)`
  margin-left: 10px;
  height: 20px;
  min-width: 20px;
  color: ${({ theme }) => theme.text1};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin-left: 0;
  `};

  > svg {
    height: 20px;
    min-width: 20px;
    fill: none;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
`
