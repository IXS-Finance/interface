import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import { merge, orderBy } from 'lodash'
import React from 'react'

import LS_KEYS from 'constants/local-storage.keys'
import { lsGet, lsSet } from 'lib/utils'
import { configService } from 'services/config/config.service'
import useNumbers, { FNumFormats } from './useNumbers'
import { isPolygon } from './useNetwork'
import useWeb3 from './useWeb3'
import { toast } from 'react-toastify'
import { getWeb3Provider } from 'dependencies/wallets/Web3Provider'
import ErrorContent from 'pages/DexV2/common/ToastContent/Error'
import SuccessContent from 'pages/DexV2/common/ToastContent/Success'
import InfoContent from 'pages/DexV2/common/ToastContent/Info'
import PendingContent from 'pages/DexV2/common/ToastContent/Pending'

const WEEK_MS = 86_400_000 * 7
// Please update the schema version when making changes to the transaction structure.
const TRANSACTIONS_SCHEMA_VERSION = '1.1.3'
const MAX_CACHED_TRANSACTIONS = 10

export type TransactionStatus = 'pending' | 'fulfilled' | 'expired' | 'cancelling' | 'cancelled' | 'failed'

export type TransactionAction =
  | 'drip'
  | 'claim'
  | 'approve'
  | 'swap'
  | 'wrap'
  | 'unwrap'
  | 'invest'
  | 'withdraw'
  | 'createPool'
  | 'fundPool'
  | 'migratePool'
  | 'createLock'
  | 'extendLock'
  | 'increaseLock'
  | 'unlock'
  | 'voteForGauge'
  | 'unstake'
  | 'stake'
  | 'restake'
  | 'sync'
  | 'userGaugeCheckpoint'
  | 'claimSubmission'
  | 'vote'

export type TransactionType = 'order' | 'tx'

export type TxReceipt = Pick<
  TransactionReceipt,
  'blockHash' | 'blockNumber' | 'contractAddress' | 'from' | 'status' | 'to' | 'transactionHash' | 'transactionIndex'
>

export type ReplacementReason = 'txSpeedUp' | 'txCancel'

export type Transaction = {
  id: string
  originalId?: string
  replacementReason?: ReplacementReason
  action: TransactionAction
  type: TransactionType
  receipt?: TxReceipt
  details?: Record<string, any>
  summary: string
  addedTime: number
  finalizedTime?: number
  from: string
  lastCheckedBlockNumber?: number
  status: TransactionStatus
}

export type NewTransaction = Pick<Transaction, 'id' | 'type' | 'summary' | 'receipt' | 'action' | 'details'>

const networkId = configService.network.chainId

export type TransactionsMap = Record<string, Transaction>

export type TransactionState = {
  [networkId: number]: TransactionsMap
}

// TODO: What happens if the structure changes? Either keep a version or schema validator.
export const transactionsState = lsGet(LS_KEYS.Transactions, {}, TRANSACTIONS_SCHEMA_VERSION)

// COMPUTED
const transactions = orderBy(Object.values(getTransactions()), 'addedTime', 'desc').filter(isTransactionRecent)

const pendingTransactions = transactions.filter((transaction: any) => isPendingTransactionStatus(transaction.status))

const finalizedTransactions = transactions.filter((transaction: any) =>
  isFinalizedTransactionStatus(transaction.status)
)

const pendingTxActivity = pendingTransactions.filter(({ type }) => type === 'tx')
// METHODS
function normalizeTxReceipt(receipt: TransactionReceipt) {
  return {
    blockHash: receipt.blockHash,
    blockNumber: receipt.blockNumber,
    contractAddress: receipt.contractAddress,
    from: receipt.from,
    status: receipt.status,
    to: receipt.to,
    transactionHash: receipt.transactionHash,
    transactionIndex: receipt.transactionIndex,
  }
}

function isTransactionRecent(transaction: Transaction): boolean {
  return Date.now() - transaction.addedTime < WEEK_MS
}

function clearAllTransactions() {
  setTransactions({})
}

function getId(id: string, type: TransactionType) {
  return `${type}_${id}`
}

function getTransactions(): TransactionsMap {
  const transactionsMap = transactionsState[networkId] ?? {}

  return transactionsMap
}

function setTransactions(transactionsMap: TransactionsMap) {
  transactionsState[networkId] = transactionsMap

  // lsSet(LS_KEYS.Transactions, transactionsState, TRANSACTIONS_SCHEMA_VERSION)
}

function getTransaction(id: string, type: TransactionType) {
  const transactionsMap = getTransactions()
  const txId = getId(id, type)

  return transactionsMap[txId] ?? null
}

function updateTransaction(id: string, type: TransactionType, updates: Partial<Transaction>) {
  const transactionsMap = getTransactions()
  const txId = getId(id, type)
  const transaction = transactionsMap[txId]

  if (transaction != null) {
    // id change requires a replacement of the transaction
    if (updates.id != null) {
      const newTxId = getId(updates.id, type)

      transactionsMap[newTxId] = merge({}, transaction, updates, {
        originalId: id,
      })
      delete transactionsMap[txId]
    } else {
      transactionsMap[txId] = merge({}, transaction, updates)
    }

    setTransactions(transactionsMap)

    return true
  }

  return false
}

function isSuccessfulTransaction(transaction: Transaction) {
  return transaction.status === 'fulfilled'
}

function isPendingTransactionStatus(status: TransactionStatus) {
  return !isFinalizedTransactionStatus(status)
}

function isFinalizedTransactionStatus(status: TransactionStatus) {
  return ['fulfilled', 'cancelled', 'failed', 'expired'].includes(status)
}

// Adapted from Uniswap code
function shouldCheckTx(transaction: Transaction, lastBlockNumber: number) {
  // if (processedTxs.has(transaction.id) || isFinalizedTransactionStatus(transaction.status)) {
  //   return false
  // }

  if (!transaction.lastCheckedBlockNumber) {
    return true
  }

  const blocksSinceCheck = lastBlockNumber - transaction.lastCheckedBlockNumber
  if (blocksSinceCheck < 1) {
    return false
  }

  const minutesPending = (Date.now() - transaction.addedTime) / 1000 / 60
  if (minutesPending > 60) {
    // every 10 blocks if pending for longer than an hour
    return blocksSinceCheck > 9
  } else if (minutesPending > 5) {
    // every 3 blocks if pending more than 5 minutes
    return blocksSinceCheck > 2
  } else {
    // otherwise every block
    return true
  }
}

/**
 * postConfirmationDelay
 *
 * Delay in N confirmations before a transaction is considered finalized for
 * specific networks.
 *
 * @param {TransactionResponse} tx - The transaction to wait N confirmations for.
 */
export async function postConfirmationDelay(tx: TransactionResponse): Promise<TransactionReceipt> {
  if (isPolygon) return tx.wait(7)

  return tx.wait(1)
}

export default function useTransactions() {
  // COMPOSABLES
  const { account, explorerLinks, blockNumber } = useWeb3()
  // const { addNotification } = useNotifications()
  const { fNum } = useNumbers()
  const provider: any = getWeb3Provider()

  // COMPUTED

  // METHODS
  function addTransaction(newTransaction: NewTransaction) {
    const transactionsMap = getTransactions()
    const txId = getId(newTransaction.id, newTransaction.type)

    if (transactionsMap[txId]) {
      throw new Error(`The transaction ${newTransaction.id} already exists.`)
    }

    transactionsMap[txId] = {
      ...newTransaction,
      from: account,
      addedTime: Date.now(),
      status: 'pending',
    }

    const filteredTxs = Object.entries(transactionsMap)
      .sort(([, transactionA], [, transactionB]) => transactionB.addedTime - transactionA.addedTime)
      .filter((_, index) => index < MAX_CACHED_TRANSACTIONS)

    setTransactions(Object.fromEntries(filteredTxs))
    addNotificationForTransaction(newTransaction.id, newTransaction.type)
  }

  function finalizeTransaction(id: string, type: TransactionType, receipt: Transaction['receipt']) {
    if (receipt != null) {
      const transaction = getTransaction(id, type)

      if (transaction != null) {
        const updates: Partial<Transaction> = {
          finalizedTime: Date.now(),
        }

        if (type === 'tx') {
          const txReceipt = receipt as TransactionReceipt

          updates.receipt = normalizeTxReceipt(txReceipt)
          if (transaction.replacementReason === 'txCancel') {
            updates.status = 'cancelled'
          } else {
            updates.status = txReceipt?.status === 1 ? 'fulfilled' : 'failed'
          }
        }

        const updateSuccessful = updateTransaction(id, type, updates)

        if (updateSuccessful) {
          addNotificationForTransaction(id, type)
          return true
        }
      }
    }

    return false
  }

  function addTransactionNotification(transaction: any) {
    const transactionAction: any = {
      stake: 'Stake',
      unstake: 'Unstake',
      approve: 'Approve',
      claim: 'Claim',
      createPool: 'Create pool',
      drip: 'Drip',
      fundPool: 'Fund pool',
      migratePool: 'Migrate pool',
      invest: 'Add liquidity',
      swap: 'Swap',
      unwrap: 'Unwrap',
      voteForGauge: 'Vote',
      withdraw: 'Withdraw',
      wrap: 'Wrap',
      createLock: 'Lock',
      extendLock: 'Extend lock',
      increaseLock: 'Increase lock',
      unlock: 'Unlock',
      sync: 'Sync',
      userGaugeCheckpoint: 'Pool gauge veBAL update',
      claimSubmission: 'Claim submission',
      vote: 'Vote',
    }
    const transactionStatus: any = {
      cancelled: 'Cancelled',
      cancelling: 'Cancelling',
      expired: 'Expired',
      failed: 'Failed',
      fulfilled: 'Confirmed',
      pending: 'Pending',
    }

    let type: 'success' | 'error' | 'info' | 'pending'

    switch (transaction.status) {
      case 'fulfilled':
      case 'cancelled':
      case 'failed':
      case 'expired':
        type = isSuccessfulTransaction(transaction) ? 'success' : 'error'
        break
      case 'pending':
        type = 'pending'
        break
      default:
        type = 'info'
    }

    const title = `${transactionAction[transaction.action]} ${transactionStatus[transaction.status]}`
    const message = transaction.summary
    const explorerLink = getExplorerLink(transaction.id, transaction.type)

    switch (type) {
      case 'success':
        toast.success(<SuccessContent title={title} message={message} explorerLink={explorerLink} />, {
          style: {
            background: '#fff',
            border: '1px solid rgba(40, 194, 92, 0.5)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
        break

      case 'error':
        toast.error(<ErrorContent title={title} message={message} explorerLink={explorerLink} />, {
          style: {
            background: '#fff',
            border: '1px solid rgba(255, 101, 101, 0.50)',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
        break

      case 'pending':
        toast.info(<PendingContent title={title} message={message} explorerLink={explorerLink} />, {
          style: {
            background: '#fff',
            border: '1px solid #E6E6FF',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 30000,
        })
        break

      default:
        toast.info(<InfoContent title={title} message={message} explorerLink={explorerLink} />, {
          style: {
            background: '#fff',
            border: '1px solid #E6E6FF',
            boxShadow: '0px 24px 32px 0px rgba(41, 41, 63, 0.08)',
            borderRadius: '8px',
          },
          icon: false,
          hideProgressBar: true,
          autoClose: 3000,
        })
    }
  }

  function addNotificationForTransaction(id: string, type: TransactionType) {
    const transaction = getTransaction(id, type)

    if (transaction != null) {
      addTransactionNotification(transaction)
    }
  }

  function checkTxActivity(transaction: Transaction) {
    if (provider != null) {
      provider
        .getTransactionReceipt(transaction.id)
        .then((tx: any) => {
          if (tx != null) {
            finalizeTransaction(transaction.id, 'tx', tx)
          }
        })
        .catch((e: any) => console.log('[Transactions]: Failed to fetch tx information', transaction, e))
        .finally(() =>
          updateTransaction(transaction.id, 'tx', {
            lastCheckedBlockNumber: blockNumber,
          })
        )
    }
  }

  async function handlePendingTransactions() {
    pendingTxActivity.filter((transaction: any) => shouldCheckTx(transaction, blockNumber)).forEach(checkTxActivity)
  }

  function getExplorerLink(id: string, type: TransactionType) {
    if (type === 'tx') {
      return explorerLinks.txLink(id)
    }
  }

  return {
    // methods
    getTransaction,
    getTransactions,
    addTransaction,
    clearAllTransactions,
    handlePendingTransactions,
    finalizeTransaction,
    getExplorerLink,
    isSuccessfulTransaction,
    isPendingTransactionStatus,
    updateTransaction,

    // computed
    pendingTransactions,
    finalizedTransactions,
    transactions,
  }
}
