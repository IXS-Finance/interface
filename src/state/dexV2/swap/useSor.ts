import { useSelector } from 'react-redux'
import { BigNumber, formatFixed } from '@ethersproject/bignumber'
import { AddressZero, WeiPerEther as ONE, Zero } from '@ethersproject/constants'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { parseFixed, SwapType, SubgraphPoolBase, SwapTypes } from '@ixswap1/dex-v2-sdk'

import { getWrapOutput, unwrap, wrap, WrapType } from 'lib/utils/balancer/wrapper'
import { TokenInfo } from 'types/TokenList'
import { GAS_PRICE, MAX_POOLS } from 'config'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { SorManager, SorReturn } from 'lib/utils/balancer/helpers/sor/sorManager'
import { useEffect, useState } from 'react'
import { bnum } from 'lib/utils'
import { useTokens } from '../tokens/hooks/useTokens'
import { overflowProtected } from 'pages/DexV2/Pool/components/helpers'
import { configService } from 'services/config/config.service'
import useNumbers from 'hooks/dex-v2/useNumbers'
import { NATIVE_ASSET_ADDRESS } from 'constants/dexV2/tokens'
import { getBalancerSDK } from 'dependencies/balancer-sdk'
import { isUserError } from 'lib/utils/errors'
import { TransactionAction } from 'pages/DexV2/types'
import { useAccount } from 'wagmi'
import { SwapQuote } from './types'
import { useSwapper } from './useSwapper'

const MIN_PRICE_IMPACT = 0.0001
const HIGH_PRICE_IMPACT_THRESHOLD = 0.05
type SorState = {
  validationErrors: {
    highPriceImpact: boolean
    noSwaps: boolean
  }
  submissionError: string | null
}

type Props = {
  exactIn: boolean
  tokenInAddressInput: string
  tokenInAmountInput: string
  tokenOutAddressInput: string
  tokenOutAmountInput: string
  wrapType: WrapType
  tokenInAmountScaled?: BigNumber
  tokenOutAmountScaled?: BigNumber
  sorConfig?: {
    handleAmountsOnFetchPools: boolean
  }
  tokenIn: TokenInfo
  tokenOut: TokenInfo
  slippageBufferRate: number
  setTokenInAmountInput: (amount: string) => void
  setTokenOutAmountInput: (amount: string) => void
}

/**
 * Calculates the difference between the price the user is receiving
 * and the market price of the token.
 * The variable token is the token has it's amount calculated by SOR
 *  - If the swap type is ExactIn, this is the output token
 *  - If the swap type is ExactOut, this is the input token
 * The fixed token is the token that has a fixed amount the user set.
 * This is the opposite of the variable token.
 * @param sellTokenAmount - The amount of the token being sold in native amounts (so 25 USDC = 25000000)
 * @param sellTokenDecimals - The number of decimals the sell token has
 * @param buyTokenAmount - The amount of the token being bought in native amounts (so 25 USDC = 25000000)
 * @param buyTokenDecimals - The number of decimals the buy token has
 * @param swapType - The type of swap we are doing
 * @param marketSp - The market spot price of the token pair
 * @returns
 */
export function calcPriceImpact(
  sellTokenAmount: BigNumber,
  sellTokenDecimals: number,
  buyTokenAmount: BigNumber,
  buyTokenDecimals: number,
  swapType: SwapType,
  marketSp: string
): BigNumber {
  // Scale the sellToken by the buyToken decimals and vice versa so they are both the same scale
  const sellTokenScaled = parseFixed(sellTokenAmount.toString(), buyTokenDecimals)
  const buyTokenScaled = parseFixed(buyTokenAmount.toString(), sellTokenDecimals)

  const SCALE = 18
  const scalingFactor = BigNumber.from(10).pow(SCALE)

  const effectivePrice = sellTokenScaled.mul(scalingFactor).div(buyTokenScaled)
  const marketSpScaled = parseFixed(marketSp, SCALE)

  let priceRatio
  if (swapType == SwapType.SwapExactIn) {
    // If we are swapping exact in the buy token is the variable one so we need
    // to divide the market spot price by it to get the ratio of expectedPrice:actualPrice
    priceRatio = marketSpScaled.mul(scalingFactor).div(effectivePrice)
  } else {
    // If we are swapping exact out the sell token is the variable one so we need
    // to divide it by the market spot price to get the ratio of expectedPrice:actualPrice
    priceRatio = effectivePrice.mul(scalingFactor).div(marketSpScaled)
  }

  // We don't care about > 4 decimal places for price impacts and sometimes
  // there are rounding errors with repeating numbers so we round to 4 decimal places
  const maxDecimalPlaces = 4
  const priceRatioRounded = Math.round(priceRatio.div(BigNumber.from(10).pow(SCALE - maxDecimalPlaces)).toNumber())
  priceRatio = BigNumber.from(priceRatioRounded).mul(BigNumber.from(10).pow(SCALE - maxDecimalPlaces))

  const priceImpact = ONE.sub(priceRatio)
  return priceImpact
}

// @ts-ignore
const sorManager = new SorManager(rpcProviderService.jsonProvider, BigNumber.from(GAS_PRICE), Number(MAX_POOLS))

export default function useSor({
  exactIn,
  tokenInAddressInput,
  tokenInAmountInput,
  tokenOutAddressInput,
  tokenOutAmountInput,
  wrapType,
  tokenInAmountScaled,
  tokenOutAmountScaled,
  sorConfig = {
    handleAmountsOnFetchPools: true,
  },
  tokenIn,
  tokenOut,
  slippageBufferRate,
  setTokenInAmountInput,
  setTokenOutAmountInput,
}: Props) {
  const state = useSelector((state: any) => state.swap)
  const { priceFor, getToken } = useTokens()
  const { fNum } = useNumbers()
  const { address: account } = useAccount()
  const { swapIn, swapOut } = useSwapper()

  const [pools, setPools] = useState<SubgraphPoolBase[]>([])
  const [poolsLoading, setPoolsLoading] = useState<boolean>(true)
  const [priceImpact, setPriceImpact] = useState<number>(0)
  const [sorReturn, setSorReturn] = useState<any>({})
  const [confirming, setConfirming] = useState<boolean>(false)
  const [swapping, setSwapping] = useState<boolean>(false)
  const [validationErrors, setValidationErrors] = useState<any>({ highPriceImpact: false, noSwaps: false })
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  async function fetchPools(): Promise<void> {
    if (!sorManager) {
      return
    }

    console.time('[SOR] fetchPools')
    await sorManager.fetchPools()
    console.timeEnd('[SOR] fetchPools')
    setPoolsLoading(false)
    // Updates any swaps with up to date pools/balances
    if (sorConfig.handleAmountsOnFetchPools) {
      handleAmountChange()
    }
  }

  async function updateSwapAmounts(): Promise<void> {
    if (!sorManager) {
      return
    }
    if (sorReturn.hasSwaps && !confirming) {
      const { result } = sorReturn

      const swapType: SwapType = exactIn ? SwapType.SwapExactIn : SwapType.SwapExactOut

      const deltas = await getBalancerSDK().swaps.queryBatchSwap({
        kind: swapType,
        swaps: result.swaps,
        assets: result.tokenAddresses,
      })

      if (result !== sorReturn.result) {
        // sorReturn was updated while we were querying, abort to not show stale data.
        return
      }

      if (deltas.length >= 2) {
        const tokenInDecimals = getTokenDecimals(tokenInAddressInput)
        const tokenOutDecimals = getTokenDecimals(tokenOutAddressInput)

        let tokenInAddress = tokenInAddressInput === NATIVE_ASSET_ADDRESS ? AddressZero : tokenInAddressInput
        let tokenOutAddress = tokenOutAddressInput === NATIVE_ASSET_ADDRESS ? AddressZero : tokenOutAddressInput

        const tokenInPosition = result.tokenAddresses.indexOf(tokenInAddress.toLowerCase())
        const tokenOutPosition = result.tokenAddresses.indexOf(tokenOutAddress.toLowerCase())

        if (swapType === SwapType.SwapExactOut) {
          let tokenInAmount = deltas[tokenInPosition]
            ? BigNumber.from(deltas[tokenInPosition]).abs()
            : BigNumber.from(0)
          tokenInAmount = await mutateAmount({
            amount: tokenInAmount,
            address: tokenInAddressInput,
            isInputToken: false,
          })

          const tokenInAmountInputValue = tokenInAmount.gt(0)
            ? formatAmount(formatUnits(tokenInAmount, tokenInDecimals))
            : ''
          setTokenInAmountInput(tokenInAmountInputValue)
        }

        if (swapType === SwapType.SwapExactIn) {
          let tokenOutAmount = deltas[tokenOutPosition]
            ? BigNumber.from(deltas[tokenOutPosition]).abs()
            : BigNumber.from(0)
          tokenOutAmount = await mutateAmount({
            amount: tokenOutAmount,
            address: tokenOutAddressInput,
            isInputToken: false,
          })

          const tokenOutAmountInputValue = tokenOutAmount.gt(0)
            ? formatAmount(formatUnits(tokenOutAmount, tokenOutDecimals))
            : ''
          setTokenOutAmountInput(tokenOutAmountInputValue)
        }
      }
    }
  }

  function resetInputAmounts(amount: string): void {
    if (exactIn && bnum(amount).isZero()) {
      setTokenOutAmountInput('')
    } else if (!exactIn && bnum(amount).isZero()) {
      setTokenInAmountInput('')
    } else {
      setTokenInAmountInput(amount)
      setTokenOutAmountInput(amount)
    }

    setPriceImpact(0)
    setSorReturn((old: any) => ({ ...old, returnAmount: Zero, hasSwaps: false }))
  }

  async function handleAmountChange(): Promise<void> {
    let amount = exactIn ? tokenInAmountInput : tokenOutAmountInput
    // Avoid using SOR if querying a zero value or (un)wrapping swap
    const zeroValueSwap = amount === '' || bnum(amount).isZero()
    if (zeroValueSwap) {
      resetInputAmounts(amount)
      return
    }

    const tokenInAddress = tokenInAddressInput
    const tokenOutAddress = tokenOutAddressInput

    if (!tokenInAddress || !tokenOutAddress) {
      if (exactIn) tokenOutAmountInput = ''
      else tokenInAmountInput = ''
      return
    }

    const tokenInDecimals = getTokenDecimals(tokenInAddressInput)
    const tokenOutDecimals = getTokenDecimals(tokenOutAddressInput)

    const inputAmountDecimals = exactIn ? tokenInDecimals : tokenOutDecimals
    amount = overflowProtected(amount, inputAmountDecimals)

    if (wrapType !== WrapType.NonWrap) {
      const wrapper = wrapType === WrapType.Wrap ? tokenOutAddress : tokenInAddress

      if (exactIn) {
        setTokenInAmountInput(amount)

        const outputAmount = await getWrapOutput(wrapper, wrapType, parseFixed(amount, tokenInDecimals))
        setTokenOutAmountInput(formatFixed(outputAmount, tokenInDecimals))
      } else {
        setTokenOutAmountInput(amount)

        const inputAmount = await getWrapOutput(
          wrapper,
          wrapType === WrapType.Wrap ? WrapType.Unwrap : WrapType.Wrap,
          parseFixed(amount, tokenOutDecimals)
        )
        setTokenInAmountInput(formatFixed(inputAmount, tokenOutDecimals))
      }

      setSorReturn((old: any) => ({ ...old, hasSwaps: false }))
      setPriceImpact(0)
      return
    }

    if (!sorManager || !sorManager.hasPoolData()) {
      if (exactIn) setTokenOutAmountInput('')
      else setTokenInAmountInput('')
      return
    }

    if (exactIn) {
      await setSwapCost(tokenOutAddressInput, tokenOutDecimals, sorManager)

      let tokenInAmountScaled = parseUnits(amount, tokenInDecimals)

      console.log('[SOR Manager] swapExactIn')

      const swapReturn: SorReturn = await sorManager.getBestSwap(
        tokenInAddress,
        tokenOutAddress,
        tokenInDecimals,
        tokenOutDecimals,
        SwapTypes.SwapExactIn,
        tokenInAmountScaled
      )

      console.log('swapReturn', swapReturn)

      setSorReturn(swapReturn)
      let tokenOutAmount = swapReturn.returnAmount

      setTokenOutAmountInput(tokenOutAmount.gt(0) ? formatAmount(formatUnits(tokenOutAmount, tokenOutDecimals)) : '')

      if (!sorReturn.hasSwaps) {
        setPriceImpact(0)
        setValidationErrors((old: any) => ({ ...old, noSwaps: true }))
      } else {
        // If either in/out address is stETH we should mutate the value for the
        // priceImpact calculation.
        tokenInAmountScaled = await mutateAmount({
          amount: tokenInAmountScaled,
          address: tokenInAddress,
          isInputToken: true,
        })
        tokenOutAmount = await mutateAmount({
          amount: tokenOutAmount,
          address: tokenOutAddress,
          isInputToken: false,
        })
        const priceImpactCalc = calcPriceImpact(
          tokenInAmountScaled,
          tokenInDecimals,
          tokenOutAmount,
          tokenOutDecimals,
          SwapType.SwapExactIn,
          swapReturn.marketSpNormalised
        )

        setPriceImpact(Math.max(Number(formatUnits(priceImpactCalc)), MIN_PRICE_IMPACT))
      }
    } else {
      // Notice that outputToken is tokenOut if swapType == 'swapExactIn' and tokenIn if swapType == 'swapExactOut'
      await setSwapCost(tokenInAddressInput, tokenInDecimals, sorManager)

      let tokenOutAmountScaled = parseUnits(amount, tokenOutDecimals)

      console.log('[SOR Manager] swapExactOut')

      const swapReturn: SorReturn = await sorManager.getBestSwap(
        tokenInAddress,
        tokenOutAddress,
        tokenInDecimals,
        tokenOutDecimals,
        SwapTypes.SwapExactOut,
        tokenOutAmountScaled
      )

      setSorReturn(swapReturn) // TO DO - is it needed?

      let tokenInAmount = swapReturn.returnAmount

      setTokenInAmountInput(tokenInAmount.gt(0) ? formatAmount(formatUnits(tokenInAmount, tokenInDecimals)) : '')

      if (!sorReturn.hasSwaps) {
        setPriceImpact(0)
        setValidationErrors((old: any) => ({ ...old, noSwaps: true }))
      } else {
        // If either in/out address is stETH we should mutate the value for the
        // priceImpact calculation.
        tokenOutAmountScaled = await mutateAmount({
          amount: tokenOutAmountScaled,
          address: tokenOutAddress,
          isInputToken: true,
        })
        tokenInAmount = await mutateAmount({
          amount: tokenInAmount,
          address: tokenInAddress,
          isInputToken: false,
        })
        const priceImpactCalc = calcPriceImpact(
          tokenInAmount,
          tokenInDecimals,
          tokenOutAmountScaled,
          tokenOutDecimals,
          SwapType.SwapExactIn,
          swapReturn.marketSpNormalised
        )

        setPriceImpact(Math.max(Number(formatUnits(priceImpactCalc)), MIN_PRICE_IMPACT))
      }
    }

    setPools(sorManager.selectedPools)

    setValidationErrors((old: any) => ({ ...old, highPriceImpact: priceImpact >= HIGH_PRICE_IMPACT_THRESHOLD }))
  }

  function txHandler(tx: any, action: TransactionAction): void {
    //   confirming.value = false;
    //   let summary = '';
    //   const tokenInAmountFormatted = fNum(tokenInAmountInput.value, {
    //     ...FNumFormats.token,
    //     maximumSignificantDigits: 6,
    //   });
    //   const tokenOutAmountFormatted = fNum(tokenOutAmountInput.value, {
    //     ...FNumFormats.token,
    //     maximumSignificantDigits: 6,
    //   });
    //   const tokenInSymbol = tokenIn.value.symbol;
    //   const tokenOutSymbol = tokenOut.value.symbol;
    //   if (['wrap', 'unwrap'].includes(action)) {
    //     summary = t('transactionSummary.wrapUnwrap', [
    //       tokenInAmountFormatted,
    //       tokenInSymbol,
    //       tokenOutSymbol,
    //     ]);
    //   } else {
    //     summary = `${tokenInAmountFormatted} ${tokenInSymbol} -> ${tokenOutAmountFormatted} ${tokenOutSymbol}`;
    //   }
    //   addTransaction({
    //     id: tx.hash,
    //     type: 'tx',
    //     action,
    //     summary,
    //     details: {
    //       tokenIn: tokenIn.value,
    //       tokenOut: tokenOut.value,
    //       tokenInAddress: tokenInAddressInput.value,
    //       tokenOutAddress: tokenOutAddressInput.value,
    //       tokenInAmount: tokenInAmountInput.value,
    //       tokenOutAmount: tokenOutAmountInput.value,
    //       exactIn: exactIn.value,
    //       quote: getQuote(),
    //       priceImpact: priceImpact.value,
    //       slippageBufferRate: slippageBufferRate.value,
    //     },
    //   });
    //   const swapUSDValue =
    //     toFiat(tokenInAmountInput.value, tokenInAddressInput.value) || '0';
    //   txListener(tx, {
    //     onTxConfirmed: async () => {
    //       trackGoal(Goals.Swapped, bnum(swapUSDValue).times(100).toNumber() || 0);
    //       swapping.value = false;
    //       latestTxHash.value = tx.hash;
    //     },
    //     onTxFailed: () => {
    //       swapping.value = false;
    //     },
    //   });
  }

  // Uses stored market prices to calculate price of native asset in terms of token

  async function swap(successCallback?: () => void) {
    setSwapping(true)
    setConfirming(true)
    // state.submissionError = null

    const tokenInAddress = tokenInAddressInput
    const tokenOutAddress = tokenOutAddressInput
    const tokenInDecimals = getToken(tokenInAddress).decimals
    const tokenOutDecimals = getToken(tokenOutAddress).decimals
    const tokenInAmountScaled = parseFixed(tokenInAmountInput, tokenInDecimals)

    if (wrapType == WrapType.Wrap) {
      try {
        const tx = await wrap(configService.network.chainName, account, tokenOutAddress, tokenInAmountScaled)
        console.log('Wrap tx', tx)

        txHandler(tx, 'wrap')

        if (successCallback != null) {
          successCallback()
        }
      } catch (error) {
        handleSwapException(error as Error, tokenInAddress, tokenOutAddress)
      }
      return
    } else if (wrapType == WrapType.Unwrap) {
      try {
        const tx = await unwrap(configService.network.chainName, account, tokenInAddress, tokenInAmountScaled)
        console.log('Unwrap tx', tx)

        txHandler(tx, 'unwrap')

        if (successCallback != null) {
          successCallback()
        }
      } catch (error) {
        handleSwapException(error as Error, tokenInAddress, tokenOutAddress)
      }
      return
    }

    if (exactIn) {
      const tokenOutAmount = parseFixed(tokenOutAmountInput, tokenOutDecimals)
      const minAmount = getMinOut(tokenOutAmount)
      const sr: SorReturn = sorReturn as SorReturn

      try {
        const tx = await swapIn(sr, tokenInAmountScaled, minAmount)
        console.log('Swap in tx', tx)

        txHandler(tx, 'swap')

        if (successCallback != null) {
          successCallback()
        }
      } catch (error) {
        handleSwapException(error as Error, tokenInAddress, tokenOutAddress)
      }
    } else {
      const tokenInAmountMax = getMaxIn(tokenInAmountScaled)
      const sr: SorReturn = sorReturn as SorReturn
      const tokenOutAmountScaled = parseFixed(tokenOutAmountInput, tokenOutDecimals)

      try {
        const tx = await swapOut(sr, tokenInAmountMax, tokenOutAmountScaled)
        console.log('Swap out tx', tx)

        // txHandler(tx, 'swap');

        if (successCallback != null) {
          successCallback()
        }
      } catch (error) {
        handleSwapException(error as Error, tokenInAddress, tokenOutAddress)
      }
    }
  }

  function calculateEthPriceInToken(tokenAddress: string): number {
    const ethPriceFiat = priceFor(configService.network.nativeAsset.address)
    const tokenPriceFiat = priceFor(tokenAddress)
    if (tokenPriceFiat === 0) return 0
    const ethPriceToken = ethPriceFiat / tokenPriceFiat
    return ethPriceToken
  }

  // Sets SOR swap cost for more efficient routing
  async function setSwapCost(tokenAddress: string, tokenDecimals: number, sorManager: SorManager): Promise<void> {
    await sorManager.setCostOutputToken(tokenAddress, tokenDecimals, calculateEthPriceInToken(tokenAddress).toString())
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

  function formatAmount(amount: string) {
    return fNum(amount, {
      maximumSignificantDigits: 6,
      useGrouping: false,
      fixedFormat: true,
    })
  }

  function getTokenDecimals(tokenAddress: string) {
    return getToken(tokenAddress)?.decimals
  }
  /**
   * mutateAmount
   *
   * Handles any conditions where the token in or out needs to be mutated for
   * display purposes. The only case we have so far is if the token in or out
   * is stETH, the actual return amount from the SOR is wstETH. So we need to
   * convert the wstETH amount to stETH using the exchange rate.
   *
   * @param {BigNumber} amount - Amount to parse (could be tokenIn or tokenOut amount).
   * @param {string} address - Token address for amount.
   * @param {boolean} isInputToken - Is this the token being specified?
   * @returns {BigNumber} A new amount if conditions are met or the same amount
   * as passed in.
   */
  async function mutateAmount({
    amount,
  }: {
    amount: BigNumber
    address: string
    isInputToken: boolean
  }): Promise<BigNumber> {
    return amount
  }

  function handleSwapException(error: Error, tokenIn: string, tokenOut: string) {
    if (!isUserError(error)) {
      console.trace(error)
      // state.submissionError = t('swapException', ['Balancer'])

      //   captureBalancerException({
      //     error,
      //     action: 'swap',
      //     msgPrefix: state.submissionError,
      //     context: {
      //       extra: {
      //         sender: account.value,
      //         tokenIn,
      //         tokenOut,
      //       },
      //       tags: {
      //         swapType: 'balancer',
      //       },
      //     },
      //   })
    }

    setConfirming(false)
    setSwapping(false)
    throw error
  }

  function resetState() {}

  useEffect(() => {
    const getData = async () => {
      const unknownAssets: string[] = []
      if (tokenInAddressInput && !getToken(tokenInAddressInput)) {
        unknownAssets.push(tokenInAddressInput)
      }
      if (tokenOutAddressInput && !getToken(tokenOutAddressInput)) {
        unknownAssets.push(tokenOutAddressInput)
      }
      // await injectTokens(unknownAssets);
      await fetchPools()
      await handleAmountChange()
    }

    getData()
  }, [])

  return {
    ...state,
    validationErrors,
    submissionError,
    sorManager,
    sorReturn,
    pools,
    handleAmountChange,
    exactIn,
    swap,
    swapping,
    priceImpact,
    // latestTxHash,
    fetchPools,
    poolsLoading,
    getQuote,
    resetState,
    confirming,
    updateSwapAmounts,
    resetInputAmounts,
    // For Tests
    setSwapCost,
  }
}
