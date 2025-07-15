'use client'

import { Numberish, bn, fNum } from '../utils/numbers'

type CurrencyOpts = { withSymbol?: boolean; abbreviated?: boolean }

export function useCurrency() {
  // Converts a USD value to the user's currency value.
  function toUserCurrency(usdVal: Numberish): string {
    const amount = usdVal.toString()
    const fxRate = 1

    return bn(amount).times(fxRate).toString()
  }

  function formatCurrency(value: string | undefined) {
    const symbol = '$'
    return `${symbol}${value ?? '0'}`
  }

  function parseCurrency(value: string) {
    return value.replace(/^\$/, '')
  }

  // Converts a USD value to the user's currency and formats in fiat style.
  function toCurrency(
    usdVal: Numberish,
    { withSymbol = true, abbreviated = true }: CurrencyOpts = {}
  ): string {
    const symbol = '$'
    const convertedAmount = toUserCurrency(usdVal)
    const formattedAmount = fNum('fiat', convertedAmount, { abbreviated })

    if (formattedAmount.startsWith('<')) {
      return withSymbol ? '<' + symbol + formattedAmount.substring(1) : formattedAmount
    }

    return withSymbol ? symbol + formattedAmount : formattedAmount
  }

  return { toCurrency, formatCurrency, parseCurrency }
}
