import React, { useState, useEffect } from 'react'
import { Pool } from 'services/pool/types'
import { isLessThanOrEqualTo, isRequired } from 'lib/utils/validations'
// import WithdrawTotals from './components/WithdrawTotals'
// import BalAlert from '@/components/BalAlert'
// import BalBtn from '@/components/BalBtn'
// import WithdrawPreviewModal from './components/WithdrawPreviewModal/WithdrawPreviewModal'
import { tokensListExclBpt, usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'
import BalCheckbox from 'pages/DexV2/common/BalCheckbox'
import ProportionalWithdrawalInput from './ProportionalWithdrawalInput'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useExitPool from 'state/dexV2/pool/useExitPool'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useNetwork from 'hooks/dex-v2/useNetwork'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import BalAlert from '../../components/BalAlert'
import WithdrawTotals from './WithdrawTotals'
import WithdrawPreviewModal from './WithdrawPreviewModal'
import TokenInput from './TokenInput'
import { overflowProtected } from '../../components/helpers'
import { useDispatch } from 'react-redux'
import { setDataForSingleAmountOut } from 'state/dexV2/pool'

type WithdrawFormProps = {
  pool: Pool
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({ pool }) => {
  const { networkSlug } = useNetwork()
  const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } = useWeb3()
  const { wrappedNativeAsset, nativeAsset } = useTokens()
  const dispatch = useDispatch()

  // Exit pool hook provides state and methods for handling the exit.
  const {
    isSingleAssetExit,
    singleAmountOut,
    isLoadingMax,
    queryError,
    maxError,
    isLoadingQuery,
    highPriceImpact,
    highPriceImpactAccepted,
    hasAcceptedHighPriceImpact,
    hasAmountsOut,
    validAmounts,
    hasBpt,
    shouldUseRecoveryExit,
    canSwapExit,
  } = useExitPool(pool)

  const poolHelpers = usePoolHelpers(pool)
  const { isWrappedNativeAssetPool } = poolHelpers

  // Local state to control preview modal.
  const [showPreview, setShowPreview] = useState(false)

  // Compute validation rules for single asset exit.
  const singleAssetRules = [isLessThanOrEqualTo(singleAmountOut.max, 'Exceeds pool balance for this token')]
  const hasValidInputs = !!(validAmounts && hasAcceptedHighPriceImpact)
  const disabled = !hasAmountsOut || !hasValidInputs || isMismatchedNetwork || isLoadingQuery || isLoadingMax

  // Compute tokens list (excluding BPT).
  const tokensList = tokensListExclBpt(pool)

  // Limit token select modal to a subset.
  const subsetTokens = (() => {
    if (!shouldUseRecoveryExit && canSwapExit) return []
    if (isWrappedNativeAssetPool) return [nativeAsset.address, ...tokensList]
    return tokensList
  })()

  // Excluded tokens include the pool's address and veBal token if available.
  const excludedTokens = (() => {
    const tokens = [pool.address]

    return tokens
  })()

  const handleAmountChange = (value: string): void => {
    if (!value) return

    const safeAmount = overflowProtected(value, pool.onchain?.decimals || 18)

    dispatch(setDataForSingleAmountOut({ key: 'value', value: safeAmount }))
  }

  // On mount, check if the user holds BPT. If not, redirect back to pool page.
  // Also, initialize the single asset exit input.
  useEffect(() => {
    // if (!hasBpt) {
    //   router.push({ name: 'pool', params: { networkSlug, id: pool.id } })
    // }
    // If subsetTokens is empty, default to wrappedNativeAsset; otherwise, use the first token in tokensList.
    dispatch(
      setDataForSingleAmountOut({
        key: 'address',
        value: subsetTokens.length === 0 ? wrappedNativeAsset.address : tokensList[0],
      })
    )
  }, [hasBpt, networkSlug, pool.id])

  console.log('singleAmountOut', singleAmountOut)
  return (
    <div data-testid="withdraw-form">
      {!isSingleAssetExit ? (
        <ProportionalWithdrawalInput pool={pool} />
      ) : (
        // Single asset exit input
        <TokenInput
          // These props assume that TokenInput is a controlled component.
          // isValid={singleAmountOut.valid}
          address={singleAmountOut.address}
          amount={singleAmountOut.value}
          name={singleAmountOut.address}
          rules={singleAssetRules}
          customBalance={singleAmountOut.max || '0'}
          balanceLabel="Max"
          balanceLoading={isLoadingMax}
          disableNativeAssetBuffer
          excludedTokens={excludedTokens}
          // tokenSelectProps={{ ignoreBalances: true, subsetTokens }}
          ignoreWalletBalance
          updateAmount={handleAmountChange}
          updateAddress={() => {}}
        />
      )}

      <WithdrawTotals pool={pool} style={{ marginTop: '1rem' }} />

      {highPriceImpact && (
        <div
          style={{
            padding: '0.5rem',
            paddingBottom: '0.5rem',
            marginTop: '1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
          }}
        >
          <BalCheckbox
            modelValue={highPriceImpactAccepted}
            rules={[isRequired('Price impact acknowledgement')]}
            name="highPriceImpactAccepted"
            size="sm"
            label="I accept the high price impact from withdrawing, moving the market price based on the depth of the market"
          />
        </div>
      )}

      {(queryError || maxError) && (
        <BalAlert
          type="error"
          title="There was an error"
          description={queryError || maxError}
          style={{ marginTop: '1rem' }}
          block
        />
      )}

      <div style={{ marginTop: '1rem' }}>
        {!isWalletReady ? (
          <BalBtn label="Connect Wallet" color="gradient" block onClick={startConnectWithInjectedProvider} />
        ) : (
          <BalBtn label="Preview" color="gradient" disabled={!!disabled} block onClick={() => setShowPreview(true)} />
        )}
      </div>

      {showPreview && <WithdrawPreviewModal pool={pool} onClose={() => setShowPreview(false)} />}
    </div>
  )
}

export default WithdrawForm
