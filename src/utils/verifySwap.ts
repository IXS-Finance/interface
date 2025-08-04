/* eslint-disable @typescript-eslint/no-var-requires */
import { FACTORY_ROUTER_ADDRESS, SWAP_ROUTER_ADDRESS } from 'constants/addresses'
import { BigNumber, utils } from 'ethers'
import { Trade as V2Trade } from '@ixswap1/v2-sdk'
import { Currency, TradeType } from '@ixswap1/sdk-core'

// //  -----------------------------------------     PARAMETERS, CONSTANTS, HELPER FUNCTIONS   ------------------------------------------------------------------

// // abis
let PERIPHERY_LP_ABI = require('abis/IxsV2LiquidityRouter.json')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
PERIPHERY_LP_ABI = PERIPHERY_LP_ABI.abi

let SWAP_ROUTER_ABI = require('abis/IxsV2SwapRouter.json')
SWAP_ROUTER_ABI = SWAP_ROUTER_ABI.abi

let FACTORY_ABI = require('abis/IxsV2Factory.json')
FACTORY_ABI = FACTORY_ABI.abi

let PAIR_ABI = require('abis/IxsV2Pair.json')
PAIR_ABI = PAIR_ABI.abi

let ERC20_FAUCET_ABI = require('abis/Erc20Custom.json')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
ERC20_FAUCET_ABI = ERC20_FAUCET_ABI.abi

const Web3Global = require('web3')

class Web3 {
  getUrl(chainId: number): any {
    const getAlchemyUrl = (network: string) =>
      process.env.REACT_APP_ALCHEMY_KEY ? `https://${network}.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_KEY}` : ''

    let rpcUrl = ''
    switch (chainId) {
    case 1: // Ethereum Mainnet
      rpcUrl = getAlchemyUrl('eth-mainnet')
      break
    case 137: // Polygon
      rpcUrl = getAlchemyUrl('polygon-mainnet')
      break
    case 80002: // Polygon Amoy
      rpcUrl = getAlchemyUrl('polygon-amoy')
      break
    case 8453: // Base
      rpcUrl = getAlchemyUrl('base-mainnet')
      break
    case 84532: // Base Sepolia
      rpcUrl = getAlchemyUrl('base-sepolia')
      break
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`)
    }

    if (!rpcUrl) {
      throw new Error('REACT_APP_ALCHEMY_KEY environment variable is not set')
    }

    return new Web3Global(rpcUrl)
  }
}

const PRICE_TOLLERANCE_THRESHOLD = BigNumber.from('98')

const min = (first: BigNumber, second: BigNumber): BigNumber => {
  return first.lt(second) ? first : second
}

/**
 * get biggest number out of two given
 * @param first first number
 * @param second second number
 * @returns biggest of two numbers
 */
const max = (first: BigNumber, second: BigNumber): BigNumber => {
  return first.gt(second) ? first : second
}

/**
 * calculate square root of given BigNumber
 * @param value value for which square root is required to find
 * @returns square root of given BigNumber
 */
const sqrt = (value: BigNumber): BigNumber => {
  const x: BigNumber = value
  let z: BigNumber = x.add('1').div('2')
  let y: BigNumber = x

  while (z.sub(y).lt('0')) {
    //  check value not to be negative
    y = z
    z = x.div(z).add(z).div('2')
  }
  return y
}

// // ---------------------------------------------------- MITIGATION -----------------------------------------------------------------

interface VerifySingleSwapOptions {
  amountIn: BigNumber
  amountOut: BigNumber
  reserveOut: BigNumber
  canConsult: boolean
  oracleAmountOut: BigNumber
  isTokenInSec: boolean
  mitigationEnabled: boolean
}

const verifyMitigation = (
  amountIn: BigNumber,
  amountOut: BigNumber,
  reserveOutFinal: BigNumber,
  oracleAmountOut: BigNumber
) => {
  if (amountIn.lte('0')) return

  const sliceFactor = reserveOutFinal.gt(amountOut)
    ? BigNumber.from('100').sub(reserveOutFinal.sub(amountOut).div(reserveOutFinal.div('100')))
    : BigNumber.from('100') //todo: double check

  let outAmountsDiff

  if (oracleAmountOut.eq(amountOut)) {
    outAmountsDiff = BigNumber.from('0')
  } else {
    const biggerAmount = max(oracleAmountOut, amountOut)
    const smallerAmount = min(oracleAmountOut, amountOut)

    outAmountsDiff = biggerAmount.sub(smallerAmount).mul('100').div(biggerAmount.add(smallerAmount).div('2'))
  }

  if (outAmountsDiff.lte('0')) return

  let sliceFactorCurve = sliceFactor.mul(sqrt(sliceFactor))

  if (sliceFactorCurve.gt(PRICE_TOLLERANCE_THRESHOLD)) {
    sliceFactorCurve = PRICE_TOLLERANCE_THRESHOLD
  }

  if (outAmountsDiff.gt(BigNumber.from('100').sub(sliceFactorCurve))) throw new Error(`Out value too far from Oracle`)
}

const getTokenReserve = async (
  token: string,
  pairContract: any,
  token0: string,
  token1: string
): Promise<BigNumber> => {
  const reserves = await pairContract.methods.getReserves().call()

  if (utils.getAddress(token) == utils.getAddress(token0))
    return BigNumber.from(reserves['0']) // todo: toLowerCase may be redundant, check
  else if (utils.getAddress(token) == utils.getAddress(token1)) return BigNumber.from(reserves['1'])

  // shoudn't happen if passed correct params
  throw new Error(`Token ${token} not inside pair`)
}

const isPairTokenSec = async (token: string, pairContract: any, token0: string, token1: string): Promise<boolean> => {
  let isTokenSec = false

  if (utils.getAddress(token) == utils.getAddress(token0)) {
    isTokenSec = await pairContract.methods.isToken0Sec().call()
  } else if (utils.getAddress(token) == utils.getAddress(token1)) {
    isTokenSec = await pairContract.methods.isToken1Sec().call()
  } else {
    // shoudn't happen if passed correct params
    throw new Error(`Token ${token} not inside pair`)
  }

  return isTokenSec
}

const verifySingleSwap = ({
  amountIn,
  amountOut,
  reserveOut,
  canConsult,
  oracleAmountOut,
  isTokenInSec,
  mitigationEnabled,
}: VerifySingleSwapOptions) => {
  reserveOut = reserveOut.sub(amountOut)

  // substract system fee in case token_in is SEC token
  const reserveOutFinal = isTokenInSec ? reserveOut.sub(amountOut.mul('40').div('10000')) : reserveOut

  if (reserveOutFinal.lte('0')) {
    throw new Error('Insufficient liquidity')
  }

  if (!mitigationEnabled || !canConsult) return

  verifyMitigation(amountIn, amountOut, reserveOutFinal, oracleAmountOut)
}

export async function verifySwap(trade: V2Trade<Currency, Currency, TradeType>, chainID: number) {
  try {
    const web3 = new Web3().getUrl(chainID)

    const factoryAddress = web3.utils.toChecksumAddress(FACTORY_ROUTER_ADDRESS[chainID])
    const factoryContract = new web3.eth.Contract(FACTORY_ABI, factoryAddress)

    const swapRouterAddress = web3.utils.toChecksumAddress(SWAP_ROUTER_ADDRESS[chainID])
    const routerContract = new web3.eth.Contract(SWAP_ROUTER_ABI, swapRouterAddress)



    const path = [] // from addresses
    const isSecs = []
    const pairContracts = []

    for (let i = 0; i < trade.route.path.length; i++) {
      const tokenAddress = utils.getAddress(trade.route.path[i].address)
      const poolIndex = i < trade.route.path.length - 1 ? i : trade.route.path.length - 2 // last 2 tokens inside the same pool
      const poolAddress = web3.utils.toChecksumAddress(trade.route.pairs[poolIndex].liquidityToken.address)
      const poolContract = new web3.eth.Contract(PAIR_ABI, poolAddress)

      const isTokenInSec = await isPairTokenSec(
        tokenAddress,
        poolContract,
        trade.route.pairs[poolIndex].token0.address,
        trade.route.pairs[poolIndex].token1.address
      )

      pairContracts.push(poolContract)
      isSecs.push(isTokenInSec)
      path.push(tokenAddress)
    }

    const amountsOut: Array<BigNumber> = (
      await routerContract.methods
        .getAmountsOut(utils.parseUnits(trade.inputAmount.toExact(), trade.inputAmount.currency.decimals), path)
        .call()
    ).map((x: string) => BigNumber.from(x))

    // call verifySingleSwap for each pair inside the path
    for (let i = 0; i < trade.route.pairs.length; i++) {
      const tokenIn = utils.getAddress(trade.route.path[i].address)
      const tokenOut = utils.getAddress(trade.route.path[i + 1].address)
      const token0 = utils.getAddress(trade.route.pairs[i].token0.address)
      const token1 = utils.getAddress(trade.route.pairs[i].token1.address)
      const pairContract = pairContracts[i]
      const amountIn = amountsOut[i]
      const amountOut = amountsOut[i + 1]

      const canConsult = await factoryContract.methods.oracleCanConsult(tokenIn, tokenOut).call()
      let oracleAmountOut = BigNumber.from('0')

      if (canConsult) {
        oracleAmountOut = BigNumber.from(
          await factoryContract.methods.oracleConsult(tokenIn, amountIn, tokenOut).call()
        )
      }

      const mitigationEnabled = await pairContract.methods.mitigationEnabled().call()
      const reserveOut = await getTokenReserve(tokenOut, pairContract, token0, token1)

      verifySingleSwap({
        amountIn: amountIn,
        amountOut: amountOut,
        reserveOut: reserveOut,
        canConsult: canConsult,
        oracleAmountOut: oracleAmountOut,
        isTokenInSec: isSecs[i],
        mitigationEnabled: mitigationEnabled,
      })
    }
  } catch (err) {
    console.error(err)
  }
}
