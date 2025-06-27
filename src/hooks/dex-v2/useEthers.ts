// useEthers.ts
import { useRef } from 'react'
import { TransactionReceipt, TransactionResponse } from '@ethersproject/providers'
import SafeAppsSDK from '@gnosis.pm/safe-apps-sdk'

import { retryPromiseWithDelay, tryPromiseWithTimeout } from 'lib/utils/promise'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { toJsTimestamp } from './useTime'
import useTransactions from './useTransactions'
import { captureBalancerException } from 'lib/utils/errors'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'

type ConfirmedTxCallback = (receipt: TransactionReceipt) => Promise<void>
type FailedTxCallback = (txData: TransactionResponse) => void

// This hook exposes methods for listening to and confirming Ethereum transactions.
export default function useEthers() {
  const { finalizeTransaction, updateTransaction } = useTransactions()
  const { refetchBalances } = useTokens()

  // Use a ref to store the set of processed transaction hashes.
  const processedTxsRef = useRef<Set<string>>(new Set())

  async function getTxConfirmedAt(receipt: TransactionReceipt): Promise<Date> {
    const block = await rpcProviderService.jsonProvider.getBlock(receipt.blockNumber)

    if (!block) {
      const error = new Error(`Failed to retrieve block ${receipt.blockNumber} when retrieving tx details`)
      captureBalancerException({ error })
      // Return current time as fallback
      return new Date()
    }

    return new Date(toJsTimestamp(block.timestamp))
  }

  async function isTxConfirmed(hash: string): Promise<boolean> {
    const tx = await rpcProviderService.jsonProvider.getTransaction(hash)
    // Wrap the txListener call in a new promise that resolves with true/false.
    const isConfirmed = new Promise<boolean>((resolve) => {
      txListener(
        tx,
        {
          onTxConfirmed: async () => {
            resolve(true)
          },
          onTxFailed: () => {
            resolve(false)
          },
        },
        false, // shouldRefetchBalances
        false // shouldRetry
      )
    })
    return isConfirmed
  }

  async function txListener(
    tx: TransactionResponse,
    callbacks: {
      onTxConfirmed: ConfirmedTxCallback
      onTxFailed: FailedTxCallback
    },
    shouldRefetchBalances = true,
    shouldRetry = true
  ): Promise<boolean> {
    console.log('tx', tx)
    let confirmed = false
    const retries = shouldRetry ? 5 : 1
    processedTxsRef.current.add(tx.hash)

    try {
      // Wait for the transaction receipt using a retry mechanism.
      const receipt = await retryPromiseWithDelay(tx.wait(), retries, 5000)

      let txHash: any = tx.hash
      try {
        // For Gnosis Safe transactions, query the real tx hash.
        const safeAppsSDK = new SafeAppsSDK()
        const realTx = await tryPromiseWithTimeout(safeAppsSDK.txs.getBySafeTxHash(tx.hash), 1000)
        if (realTx && realTx.txHash !== null) {
          txHash = realTx.txHash
          updateTransaction(tx.hash, 'tx', { id: realTx.txHash })
        }
      } catch {
        // Ignore errors from the safe tx lookup.
      }

      // Finalize the transaction so that pending watchers won't check it again.
      if (receipt != null) {
        finalizeTransaction(txHash, 'tx', receipt)
      }
      await callbacks.onTxConfirmed(receipt)
      if (shouldRefetchBalances) {
        await refetchBalances()
      }
      confirmed = true
    } catch (error) {
      console.error(error)
      callbacks.onTxFailed(tx)
    }

    processedTxsRef.current.delete(tx.hash)
    return confirmed
  }

  return { txListener, getTxConfirmedAt, isTxConfirmed }
}
