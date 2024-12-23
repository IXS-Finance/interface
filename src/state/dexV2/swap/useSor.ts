import { useSelector } from 'react-redux'
import { BigNumber, formatFixed } from '@ethersproject/bignumber'
import { AddressZero, WeiPerEther as ONE, Zero } from '@ethersproject/constants'
 // @ts-ignore
import { parseFixed, SwapType } from '@ixswap1/dex-v2-sdk'

import { WrapType } from 'lib/utils/wrapper'
import { TokenInfo } from 'types/TokenList'
import { GAS_PRICE, MAX_POOLS } from 'config'
import { rpcProviderService } from 'services/rpc-provider/rpc-provider.service'
import { SorManager } from 'utils/balancer/helpers/sorManager'

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

export default function useSor({}: Props) {
  const state = useSelector((state: any) => state.swap)

  return {}
}
