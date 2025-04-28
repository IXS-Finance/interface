import { getAddress } from '@ethersproject/address'
import { BigNumber } from '@ethersproject/bignumber'
import { formatUnits, parseUnits } from '@ethersproject/units'
import { bnum, isSameAddress, selectByAddress } from 'lib/utils'
import { configService } from 'services/config/config.service'
import { OnchainTokenDataMap, Pool } from 'services/pool/types'
import { TokenInfoMap } from 'types/TokenList'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { AmountIn } from 'state/dexV2/pool/useJoinPool'

export default function usePropMaxJoin(pool: Pool, tokensIn: TokenInfoMap, useNativeAsset: boolean = false) {
  const config = configService
  const { balanceFor } = useTokens()

  // Calculate token addresses from tokensIn.
  const tokenAddresses: string[] = (() => {
    const tokensList = Object.keys(tokensIn)
    if (useNativeAsset) {
      return tokensList.map((address) => {
        if (isSameAddress(address, config.network.tokens.Addresses.wNativeAsset))
          return config.network.nativeAsset.address
        return address
      })
    }
    return tokensList
  })()

  // Get pool tokens from the pool object.
  const poolTokens: OnchainTokenDataMap = pool.onchain?.tokens || {}

  // Calculate pool token balances.
  const poolTokenBalances: Record<string, BigNumber> = (() => {
    if (!pool.onchain?.tokens) return {}

    const wNativeAsset = selectByAddress(poolTokens, config.network.tokens.Addresses.wNativeAsset)

    // Set pool native asset balance to be the same as its wrapped asset balance.
    const balancesMap: Record<string, BigNumber> = {
      [config.network.nativeAsset.address]: parseUnits(wNativeAsset?.balance || '0', wNativeAsset?.decimals || 18),
    }

    Object.keys(poolTokens).forEach((item) => {
      const address = getAddress(item)
      const poolToken = selectByAddress(poolTokens, address)
      if (poolToken) {
        balancesMap[address] = parseUnits(poolToken.balance, poolToken.decimals || 18)
      }
    })

    return balancesMap
  })()

  // Calculates the proportional value for a given token address.
  function calcProportionalValue(address: string, fixedAmountIn: AmountIn): string {
    if (isSameAddress(address, fixedAmountIn.address)) return fixedAmountIn.value

    // Token to calculate proportional amount for.
    const token = selectByAddress(tokensIn, address)
    const poolTokenBalance = selectByAddress(poolTokenBalances, address) || parseUnits('0')
    // Token with fixed amount.
    const fixedTokenData = selectByAddress(tokensIn, fixedAmountIn.address)
    const evmFixedAmount = parseUnits(fixedAmountIn.value, fixedTokenData?.decimals)
    const fixedTokenPoolBalance = selectByAddress(poolTokenBalances, fixedAmountIn.address) || parseUnits('0')

    const amount = evmFixedAmount.mul(poolTokenBalance).div(fixedTokenPoolBalance)
    return formatUnits(amount, token?.decimals)
  }

  // Calculates proportional amounts for all tokens given a fixed amount.
  function propAmountsGiven(amountIn: AmountIn): AmountIn[] {
    if (amountIn.value.trim() === '') return []

    return tokenAddresses.map((address) => ({
      address,
      valid: true,
      value: calcProportionalValue(address, amountIn),
    }))
  }

  // Calculates the proportional maximum amounts the user can provide.
  function getPropMax(): AmountIn[] {
    let maxAmounts: AmountIn[] = tokenAddresses.map((address) => ({
      address,
      valid: true,
      value: '0',
    }))

    tokenAddresses.forEach((address) => {
      let hasBalance = true
      let balance: string

      // For the native asset, subtract the minimum transaction buffer.
      if (isSameAddress(address, config.network.nativeAsset.address)) {
        const _balance = balanceFor(address)
        balance = _balance ? bnum(_balance).minus(config.network.nativeAsset.minTransactionBuffer).toString() : '0'
      } else {
        balance = balanceFor(address)
      }

      // Calculate proportional amounts with the current token as fixed.
      const proportionalAmountsIn: AmountIn[] = propAmountsGiven({
        address,
        value: balance,
        valid: true,
      })

      // Check if for the calculated amounts, the user has sufficient balance.
      proportionalAmountsIn.forEach((proportionalAmountIn) => {
        const greaterThanBalance = bnum(proportionalAmountIn.value).gt(balanceFor(proportionalAmountIn.address))
        if (greaterThanBalance) hasBalance = false
      })

      // If sufficient balance exists, compare and update the max amounts.
      if (hasBalance) {
        const currentMaxAmount = maxAmounts.find((amountIn) => isSameAddress(amountIn.address, address))?.value || '0'
        const thisAmount =
          proportionalAmountsIn.find((amountIn) => isSameAddress(amountIn.address, address))?.value || '0'

        if (bnum(thisAmount).gt(currentMaxAmount)) {
          maxAmounts = proportionalAmountsIn
        }
      }
    })

    return maxAmounts
  }

  // Calculates the proportional maximum amounts the user can provide.
  function calcAmountsIn(amountIn: any): AmountIn[] {
    let maxAmounts: AmountIn[] = tokenAddresses.map((address) => ({
      address,
      valid: true,
      value: '0',
    }))

    tokenAddresses.forEach((address) => {
      let hasBalance = true

      // Calculate proportional amounts with the current token as fixed.
      const proportionalAmountsIn: AmountIn[] = propAmountsGiven(amountIn)

      // Check if for the calculated amounts, the user has sufficient balance.
      proportionalAmountsIn.forEach((proportionalAmountIn) => {
        const greaterThanBalance = bnum(proportionalAmountIn.value).gt(balanceFor(proportionalAmountIn.address))
        if (greaterThanBalance) hasBalance = false
      })

      // If sufficient balance exists, compare and update the max amounts.
      if (hasBalance) {
        const currentMaxAmount = maxAmounts.find((amountIn) => isSameAddress(amountIn.address, address))?.value || '0'
        const thisAmount =
          proportionalAmountsIn.find((amountIn) => isSameAddress(amountIn.address, address))?.value || '0'

        if (bnum(thisAmount).gt(currentMaxAmount)) {
          maxAmounts = proportionalAmountsIn
        }
      }
    })

    return maxAmounts
  }

  return { getPropMax, calcAmountsIn }
}
