import { Percent } from '@ixswap1/sdk-core'
import { ALLOWED_PRICE_IMPACT_HIGH, PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN } from '../../constants/misc'

/**
 * Given the price impact, get user confirmation using React modals.
 *
 * @param priceImpactWithoutFee price impact of the trade without the fee.
 * @param confirm function to show confirmation modal
 * @param prompt function to show prompt modal
 */
export default async function confirmPriceImpactWithoutFee(
  priceImpactWithoutFee: Percent,
  confirm: (options: { message: string }) => Promise<boolean>,
  prompt: (options: { message: string; expectedValue: string }) => Promise<string | null>
): Promise<boolean> {
  if (!priceImpactWithoutFee.lessThan(PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN)) {
    const result = await prompt({
      message: `This swap has a price impact of at least ${PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN.toFixed(
        0
      )}%. Please type the word "confirm" to continue with this swap.`,
      expectedValue: 'confirm',
    })
    return result === 'confirm'
  } else if (!priceImpactWithoutFee.lessThan(ALLOWED_PRICE_IMPACT_HIGH)) {
    return await confirm({
      message: `This swap has a price impact of at least ${ALLOWED_PRICE_IMPACT_HIGH.toFixed(
        0
      )}%. Please confirm that you would like to continue with this swap.`,
    })
  }
  return true
}
