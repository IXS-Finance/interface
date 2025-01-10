import { buildRelayerCalls, SubgraphPoolBase, SwapInfo, SwapTypes } from '@ixswap1/dex-v2-sdk'
import { BigNumber, parseFixed } from '@ethersproject/bignumber'
import OldBigNumber from 'bignumber.js'
import { formatUnits } from '@ethersproject/units'
import { WeiPerEther as ONE, Zero } from '@ethersproject/constants'
import { bnum } from 'lib/utils'

import { getBalancerSDK } from 'dependencies/balancer-sdk'
// import useWeb3 from '@/services/web3/useWeb3'
import { TokenInfo } from 'types/TokenList'

import { useTokens } from '../tokens/hooks/useTokens'
// import useTransactions from '../useTransactions'
// import useRelayerApproval, { RelayerType } from '@/composables/approvals/useRelayerApproval'
// import { configService } from 'services/config/config.service'

import { SwapQuote } from './types'
// import useEthers from '../useEthers'
// import useRelayerApprovalQuery from '@/composables/queries/useRelayerApprovalQuery'
// import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder'
// import BatchRelayerAbi from 'lib/abi/BatchRelayer.json'
import { captureBalancerException, isUserError } from 'lib/utils/errors'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'

type JoinExitState = {
  validationErrors: {
    highPriceImpact: boolean
  }
  submissionError: string | null
}

type Props = {
  exactIn: boolean
  tokenInAddressInput: string
  tokenInAmountInput: string
  tokenOutAddressInput: string
  tokenOutAmountInput: string
  tokenInAmountScaled: BigNumber
  tokenOutAmountScaled: BigNumber
  tokenIn: TokenInfo
  tokenOut: TokenInfo
  slippageBufferRate: number
  pools: SubgraphPoolBase[]
  setTokenInAmountInput: (amount: string) => void
  setTokenOutAmountInput: (amount: string) => void
}

export type useJoinExit = ReturnType<typeof useJoinExit>

export default function useJoinExit({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  tokenIn,
  tokenOut,
  slippageBufferRate,
  pools,
  setTokenInAmountInput,
  setTokenOutAmountInput,
}: Props) {
  const [swapInfo, setSwapInfo] = useState<any>(null)
  const [swapping, setSwapping] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [priceImpact, setPriceImpact] = useState(0)
  const [latestTxHash, setLatestTxHash] = useState('')
  const [swapInfoLoading, setSwapInfoLoading] = useState(false)
  const [state, setState] = useState<JoinExitState>({
    validationErrors: {
      highPriceImpact: false,
    },
    submissionError: null,
  })

  // COMPOSABLES
  const { address: account } = useAccount()
  const { getToken } = useTokens()
  // const { relayerSignature } = useRelayerApproval(RelayerType.BATCH)
  // const relayerApprovalQuery = useRelayerApprovalQuery(configService.network.addresses.batchRelayer) // Todo handle set relayer address
  // const { addTransaction } = useTransactions()
  // const { txListener } = useEthers()
  const { fNum } = useNumbers()

  const hasValidationError = state.validationErrors.highPriceImpact != false

  function resetState() {
    state.validationErrors.highPriceImpact = false

    state.submissionError = null
  }

  function resetInputAmounts(amount: string): void {
    setTokenInAmountInput(amount)
    setTokenOutAmountInput(amount)
    setPriceImpact(0)
  }

  async function getSwapInfo(): Promise<void> {
    setSwapInfoLoading(true)
    const swapInfoValue = await getBalancerSDK().sor.getSwaps(
      tokenInAddressInput,
      tokenOutAddressInput,
      exactIn ? SwapTypes.SwapExactIn : SwapTypes.SwapExactOut,
      exactIn
        ? parseFixed(tokenInAmountInput || '0', tokenIn.decimals)
        : parseFixed(tokenOutAmountInput || '0', tokenOut.decimals),
      undefined,
      true
    )
    setSwapInfo(swapInfoValue)
    setSwapInfoLoading(false)
  }

  async function handleAmountChange(): Promise<void> {
    // Prevent quering undefined input amounts
    if ((exactIn && !tokenInAmountInput) || (!exactIn && !tokenOutAmountInput)) {
      return
    }

    if (pools.length === 0) return

    const amountToExchange = exactIn ? tokenInAmountScaled : tokenOutAmountScaled

    if (amountToExchange === undefined) {
      return
    }

    await getSwapInfo()

    const tokenInDecimals = getTokenDecimals(tokenInAddressInput)
    const tokenOutDecimals = getTokenDecimals(tokenOutAddressInput)

    const returnAmount = swapInfo?.returnAmount || BigNumber.from('0')

    if (returnAmount.isZero()) return

    if (exactIn) {
      const tokenOutAmountInputValue = bnum(formatUnits(returnAmount, tokenOutDecimals)).toFixed(
        6,
        OldBigNumber.ROUND_DOWN
      )
      setTokenInAmountInput(tokenOutAmountInputValue)
    } else {
      const tokenInAmountInputValue = bnum(formatUnits(returnAmount, tokenInDecimals)).toFixed(
        6,
        OldBigNumber.ROUND_DOWN
      )
      setTokenInAmountInput(tokenInAmountInputValue)
    }
  }

  async function swap(successCallback?: () => void) {
    const balancer = getBalancerSDK()
    let tx
    try {
      setConfirming(true)
      state.submissionError = null

      if (!swapInfo) {
        return
      }

      // const relayerCallData = buildRelayerCalls(
      //   swapInfo,
      //   pools,
      //   account,
      //   balancer.contracts.relayer?.address ?? '',
      //   balancer.networkConfig.addresses.tokens.wrappedNativeAsset,
      //   String(slippageBufferRate * 1e4),
      //   relayerSignature || undefined
      // )

      // const txBuilder = new TransactionBuilder(getSigner())
      // tx = await txBuilder.contract.sendTransaction({
      //   contractAddress: balancer.contracts.relayer?.address ?? '',
      //   abi: BatchRelayerAbi,
      //   action: 'multicall',
      //   params: [relayerCallData.rawCalls],
      // })
      // console.log(tx)

      // const tokenInAmountFormatted = fNum(tokenInAmountInput, {
      //   ...FNumFormats.token,
      //   maximumSignificantDigits: 6,
      // })
      // const tokenOutAmountFormatted = fNum(tokenOutAmountInput, {
      //   ...FNumFormats.token,
      //   maximumSignificantDigits: 6,
      // })

      // addTransaction({
      //   id: tx.hash,
      //   type: 'tx',
      //   action: 'swap',
      //   summary: `${tokenInAmountFormatted} ${tokenIn.symbol} -> ${tokenOutAmountFormatted} ${tokenOut.symbol}`,
      //   details: {
      //     tokenIn: tokenIn,
      //     tokenOut: tokenOut,
      //     tokenInAddress: tokenInAddressInput,
      //     tokenOutAddress: tokenOutAddressInput,
      //     tokenInAmount: tokenInAmountInput,
      //     tokenOutAmount: tokenOutAmountInput,
      //     exactIn: exactIn,
      //     quote: getQuote(),
      //     priceImpact: priceImpact,
      //     slippageBufferRate: slippageBufferRate,
      //   },
      // })

      // if (successCallback != null) {
      //   successCallback()
      // }

      // await txListener(tx, {
      //   onTxConfirmed: async () => {
      //     confirming.value = false
      //     relayerApprovalQuery.refetch()
      //   },
      //   onTxFailed: () => {
      //     confirming.value = false
      //   },
      // })
    } catch (error) {
      const msg = 'swapException Relayer'

      // captureBalancerException({
      //   error,
      //   action: 'swap',
      //   msgPrefix: msg,
      //   context: {
      //     level: 'fatal',
      //     extra: {
      //       sender: account.value,
      //       swapInfo: swapInfo,
      //       tx,
      //     },
      //   },
      // })

      if (!isUserError(error)) {
        state.submissionError = 'swapException Relayer'
      }

      setSwapping(false)
      setConfirming(false)
      throw error
    }
  }

  function getMaxIn(amount: BigNumber) {
    return amount.mul(parseFixed(String(1 + slippageBufferRate), 18)).div(ONE)
  }

  function getMinOut(amount: BigNumber) {
    return amount.mul(ONE).div(parseFixed(String(1 + slippageBufferRate), 18))
  }

  function getQuote(): SwapQuote {
    const maximumInAmount = tokenInAmountScaled != null ? getMaxIn(tokenInAmountScaled) : Zero

    const minimumOutAmount = tokenOutAmountScaled != null ? getMinOut(tokenOutAmountScaled) : Zero

    return {
      feeAmountInToken: '0',
      feeAmountOutToken: '0',
      maximumInAmount,
      minimumOutAmount,
    }
  }

  function getTokenDecimals(tokenAddress: string) {
    return getToken(tokenAddress)?.decimals
  }

  useEffect(() => {
    async function init() {
      const unknownAssets: string[] = []
      if (tokenInAddressInput && !getToken(tokenInAddressInput)) {
        unknownAssets.push(tokenInAddressInput)
      }
      if (tokenOutAddressInput && !getToken(tokenOutAddressInput)) {
        unknownAssets.push(tokenOutAddressInput)
      }
      // await injectTokens(unknownAssets)
    }

    init()
  }, [])

  useEffect(() => {
    handleAmountChange()
  }, [pools])

  return {
    ...state,
    pools,
    hasValidationError,
    handleAmountChange,
    exactIn,
    swap,
    swapInfo,
    swapping,
    priceImpact,
    latestTxHash,
    getQuote,
    resetState,
    confirming,
    swapInfoLoading,
    resetInputAmounts,
  }
}
