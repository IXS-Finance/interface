import { useSelector } from 'react-redux'
import { BigNumber, formatFixed } from '@ethersproject/bignumber'
import { AddressZero, WeiPerEther as ONE, Zero } from '@ethersproject/constants'
import { formatUnits, parseUnits } from '@ethersproject/units'
// @ts-ignore
import { parseFixed, SwapType, SubgraphPoolBase } from '@ixswap1/dex-v2-sdk'

import { WrapType } from 'lib/utils/wrapper'
import { TokenInfo } from 'types/TokenList'
import { GAS_PRICE, MAX_POOLS } from 'config'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { SorManager, SorReturn } from 'utils/balancer/helpers/sorManager'
import { useState } from 'react'
import { bnum } from 'lib/utils'

const MIN_PRICE_IMPACT = 0.0001
const HIGH_PRICE_IMPACT_THRESHOLD = 0.05

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
  isCowswapSwap: boolean
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
  isCowswapSwap,
  setTokenInAmountInput,
  setTokenOutAmountInput,
}: Props) {
  const state = useSelector((state: any) => state.swap)
  const [pools, setPools] = useState<SubgraphPoolBase[]>([])
  const [poolsLoading, setPoolsLoading] = useState<boolean>(true)
  const [priceImpact, setPriceImpact] = useState<number>(0)
  const [sorReturn, setSorReturn] = useState<any>({})

  // async function fetchPools(): Promise<void> {
  //   if (!sorManager) {
  //     return
  //   }

  //   console.time('[SOR] fetchPools')
  //   await sorManager.fetchPools()
  //   console.timeEnd('[SOR] fetchPools')
  //   setPoolsLoading(false)
  //   // Updates any swaps with up to date pools/balances
  //   if (sorConfig.handleAmountsOnFetchPools) {
  //     handleAmountChange()
  //   }
  // }

  // function resetInputAmounts(amount: string): void {
  //   if (exactIn && bnum(amount).isZero()) {
  //     setTokenOutAmountInput('')
  //   } else if (!exactIn && bnum(amount).isZero()) {
  //     setTokenInAmountInput('')
  //   } else {
  //     setTokenInAmountInput(amount)
  //     setTokenOutAmountInput(amount)
  //   }

  //   setPriceImpact(0)
  //   setSorReturn((old: any) => ({ ...old, returnAmount: Zero, hasSwaps: false }))
  // }

  // async function handleAmountChange(): Promise<void> {
  //   if (isCowswapSwap) {
  //     return
  //   }

  //   let amount = exactIn ? tokenInAmountInput : tokenOutAmountInput
  //   // Avoid using SOR if querying a zero value or (un)wrapping swap
  //   const zeroValueSwap = amount === '' || bnum(amount).isZero()
  //   if (zeroValueSwap) {
  //     resetInputAmounts(amount)
  //     return
  //   }

  //   const tokenInAddress = tokenInAddressInput
  //   const tokenOutAddress = tokenOutAddressInput

  //   if (!tokenInAddress || !tokenOutAddress) {
  //     if (exactIn) tokenOutAmountInput = ''
  //     else tokenInAmountInput = ''
  //     return
  //   }

  //   const tokenInDecimals = getTokenDecimals(tokenInAddressInput)
  //   const tokenOutDecimals = getTokenDecimals(tokenOutAddressInput)

  //   const inputAmountDecimals = exactIn ? tokenInDecimals : tokenOutDecimals
  //   amount = overflowProtected(amount, inputAmountDecimals)

  //   if (wrapType.value !== WrapType.NonWrap) {
  //     const wrapper = wrapType.value === WrapType.Wrap ? tokenOutAddress : tokenInAddress

  //     if (exactIn) {
  //       setTokenInAmountInput(amount)

  //       const outputAmount = await getWrapOutput(wrapper, wrapType.value, parseFixed(amount, tokenInDecimals))
  //       setTokenOutAmountInput(formatFixed(outputAmount, tokenInDecimals))
  //     } else {
  //       setTokenOutAmountInput(amount)

  //       const inputAmount = await getWrapOutput(
  //         wrapper,
  //         wrapType.value === WrapType.Wrap ? WrapType.Unwrap : WrapType.Wrap,
  //         parseFixed(amount, tokenOutDecimals)
  //       )
  //       setTokenInAmountInput(formatFixed(inputAmount, tokenOutDecimals))
  //     }

  //     setSorReturn((old: any) => ({ ...old, hasSwaps: false }))
  //     setPriceImpact(0)
  //     return
  //   }

  //   if (!sorManager || !sorManager.hasPoolData()) {
  //     if (exactIn) setTokenOutAmountInput('')
  //     else setTokenInAmountInput('')
  //     return
  //   }

  //   if (exactIn) {
  //     await setSwapCost(tokenOutAddressInput, tokenOutDecimals, sorManager)

  //     let tokenInAmountScaled = parseUnits(amount, tokenInDecimals)

  //     console.log('[SOR Manager] swapExactIn')

  //     const swapReturn: SorReturn = await sorManager.getBestSwap(
  //       tokenInAddress,
  //       tokenOutAddress,
  //       tokenInDecimals,
  //       tokenOutDecimals,
  //       SwapTypes.SwapExactIn,
  //       tokenInAmountScaled
  //     )

  //     setSorReturn(swapReturn)
  //     let tokenOutAmount = swapReturn.returnAmount

  //     setTokenOutAmountInput(tokenOutAmount.gt(0) ? formatAmount(formatUnits(tokenOutAmount, tokenOutDecimals)) : '')

  //     if (!sorReturn.hasSwaps) {
  //       setPriceImpact(0)
  //       state.validationErrors.noSwaps = true
  //     } else {
  //       // If either in/out address is stETH we should mutate the value for the
  //       // priceImpact calculation.
  //       tokenInAmountScaled = await mutateAmount({
  //         amount: tokenInAmountScaled,
  //         address: tokenInAddress,
  //         isInputToken: true,
  //       })
  //       tokenOutAmount = await mutateAmount({
  //         amount: tokenOutAmount,
  //         address: tokenOutAddress,
  //         isInputToken: false,
  //       })
  //       const priceImpactCalc = calcPriceImpact(
  //         tokenInAmountScaled,
  //         tokenInDecimals,
  //         tokenOutAmount,
  //         tokenOutDecimals,
  //         SwapType.SwapExactIn,
  //         swapReturn.marketSpNormalised
  //       )

  //       setPriceImpact(Math.max(Number(formatUnits(priceImpactCalc)), MIN_PRICE_IMPACT))
  //     }
  //   } else {
  //     // Notice that outputToken is tokenOut if swapType == 'swapExactIn' and tokenIn if swapType == 'swapExactOut'
  //     await setSwapCost(tokenInAddressInput, tokenInDecimals, sorManager)

  //     let tokenOutAmountScaled = parseUnits(amount, tokenOutDecimals)

  //     console.log('[SOR Manager] swapExactOut')

  //     const swapReturn: SorReturn = await sorManager.getBestSwap(
  //       tokenInAddress,
  //       tokenOutAddress,
  //       tokenInDecimals,
  //       tokenOutDecimals,
  //       SwapTypes.SwapExactOut,
  //       tokenOutAmountScaled
  //     )

  //     setSorReturn(swapReturn) // TO DO - is it needed?

  //     let tokenInAmount = swapReturn.returnAmount
  //     setTokenInAmountInput(tokenInAmount.gt(0) ? formatAmount(formatUnits(tokenInAmount, tokenInDecimals)) : '')

  //     if (!sorReturn.hasSwaps) {
  //       setPriceImpact(0)
  //       state.validationErrors.noSwaps = true
  //     } else {
  //       // If either in/out address is stETH we should mutate the value for the
  //       // priceImpact calculation.
  //       tokenOutAmountScaled = await mutateAmount({
  //         amount: tokenOutAmountScaled,
  //         address: tokenOutAddress,
  //         isInputToken: true,
  //       })
  //       tokenInAmount = await mutateAmount({
  //         amount: tokenInAmount,
  //         address: tokenInAddress,
  //         isInputToken: false,
  //       })
  //       const priceImpactCalc = calcPriceImpact(
  //         tokenInAmount,
  //         tokenInDecimals,
  //         tokenOutAmountScaled,
  //         tokenOutDecimals,
  //         SwapType.SwapExactIn,
  //         swapReturn.marketSpNormalised
  //       )

  //       setPriceImpact(Math.max(Number(formatUnits(priceImpactCalc)), MIN_PRICE_IMPACT))
  //     }
  //   }

  //   setPools(sorManager.selectedPools)

  //   state.validationErrors.highPriceImpact = priceImpact >= HIGH_PRICE_IMPACT_THRESHOLD
  // }

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
  }: // address,
  // isInputToken,
  {
    amount: BigNumber
    address: string
    isInputToken: boolean
  }): Promise<BigNumber> {
    // if (isStEthAddress(address) && isMainnet.value) {
    //   return convertStEthWrap({ amount, isWrap: isInputToken });
    // }
    return amount
  }

  return {
    sorManager,
    pools,
    // fetchPools,
  }
}
