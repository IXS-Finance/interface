import { Currency, WETH9 } from '@ixswap1/sdk-core'
import { useMemo, useState } from 'react'
import { tryParseAmount } from '../state/swap/helpers'
import { useTransactionAdder } from '../state/transactions/hooks'
import { useCurrencyBalance } from '../state/wallet/hooks'
import { useActiveWeb3React } from './web3'
import { useWETHContract } from './useContract'

export enum WrapType {
  NOT_APPLICABLE,
  WRAP,
  UNWRAP,
}

const NOT_APPLICABLE = { wrapType: WrapType.NOT_APPLICABLE }
/**
 * Given the selected input and output currency, return a wrap callback
 * @param inputCurrency the selected input currency
 * @param outputCurrency the selected output currency
 * @param typedValue the user input value
 */
export default function useWrapCallback(
  inputCurrency: Currency | undefined,
  outputCurrency: Currency | undefined,
  typedValue: string | undefined
): { wrapType: WrapType; isWrapping?: boolean; execute?: undefined | (() => Promise<void>); inputError?: string } {
  const { chainId, account } = useActiveWeb3React()
  const wethContract = useWETHContract()
  const balance = useCurrencyBalance(account ?? undefined, inputCurrency)
  // we can always parse the amount typed as the input currency, since wrapping is 1:1
  const inputAmount = useMemo(() => tryParseAmount(typedValue, inputCurrency), [inputCurrency, typedValue])
  const addTransaction = useTransactionAdder()
  const [isWrapping, setIsWrapping] = useState(false)

  return useMemo(() => {
    if (!wethContract || !chainId || !inputCurrency || !outputCurrency) return NOT_APPLICABLE
    const weth = WETH9[chainId]
    if (!weth) return NOT_APPLICABLE

    const hasInputAmount = Boolean(inputAmount?.greaterThan('0'))
    const sufficientBalance = inputAmount && balance && !balance.lessThan(inputAmount)
    const inputSymbol = inputCurrency.symbol
    const outputSymbol = outputCurrency.symbol

    if (inputCurrency.isNative && weth.equals(outputCurrency)) {
      return {
        wrapType: WrapType.WRAP,
        isWrapping,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  setIsWrapping(true)
                  const txReceipt = await wethContract.deposit({ value: `0x${inputAmount.quotient.toString(16)}` })
                  addTransaction(txReceipt, {
                    summary: `Wrap ${inputAmount.toSignificant(6)} ${inputSymbol} to ${outputSymbol}`,
                  })
                  await txReceipt.wait()
                } catch (error) {
                  console.error('Could not deposit', error)
                } finally {
                  setIsWrapping(false)
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : hasInputAmount
          ? `Insufficient ${inputSymbol} balance`
          : `Enter ${inputSymbol} amount`,
      }
    } else if (weth.equals(inputCurrency) && outputCurrency.isNative) {
      return {
        wrapType: WrapType.UNWRAP,
        isWrapping,
        execute:
          sufficientBalance && inputAmount
            ? async () => {
                try {
                  setIsWrapping(true)
                  const txReceipt = await wethContract.withdraw(`0x${inputAmount.quotient.toString(16)}`)
                  addTransaction(txReceipt, {
                    summary: `Unwrap ${inputAmount.toSignificant(6)} ${inputSymbol} to ${outputSymbol}`,
                  })
                  await txReceipt.wait()
                } catch (error) {
                  console.error('Could not withdraw', error)
                } finally {
                  setIsWrapping(false)
                }
              }
            : undefined,
        inputError: sufficientBalance
          ? undefined
          : hasInputAmount
          ? `Insufficient ${inputSymbol} balance`
          : `Enter ${inputSymbol} amount`,
      }
    } else {
      return NOT_APPLICABLE
    }
  }, [wethContract, chainId, inputCurrency, outputCurrency, inputAmount, balance, addTransaction])
}
