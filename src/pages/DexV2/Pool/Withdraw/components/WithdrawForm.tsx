import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { Pool } from 'services/pool/types'
import { isLessThanOrEqualTo, isRequired } from 'lib/utils/validations'
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
import { overflowProtected } from '../../components/helpers'
import { setDataForSingleAmountOut } from 'state/dexV2/pool'
import SingleTokenInput from './SingleTokenInput'
import { Box } from 'rebass'

type WithdrawFormProps = {
  pool: Pool
}

const WithdrawForm: React.FC<WithdrawFormProps> = ({ pool }) => {
  const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } = useWeb3()
  const { wrappedNativeAsset, nativeAsset } = useTokens()
  const dispatch = useDispatch()

  console.log('WithdrawForm pool:', pool)
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
    setBptIn,
  } = useExitPool(pool)

  const poolHelpers = usePoolHelpers(pool)
  const { isWrappedNativeAssetPool } = poolHelpers

  // Local state to control preview modal.
  const [showPreview, setShowPreview] = useState(false)

  // Compute validation rules for single asset exit.
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

  const excludedTokens = React.useMemo(() => {
    const tokens = [pool.address]

    return tokens
  }, [pool.address])

  const handleAmountChange = (value: string): void => {
    if (!value) return

    const safeAmount = overflowProtected(value, pool.onchain?.decimals || 18)

    dispatch(setDataForSingleAmountOut({ key: 'value', value: safeAmount }))
  }

  const updateSingleAmountOut = (address: string): void => {
    dispatch(setDataForSingleAmountOut({ key: 'address', value: address }))
  }

  useEffect(() => {
    dispatch(
      setDataForSingleAmountOut({
        key: 'address',
        value: subsetTokens.length === 0 ? wrappedNativeAsset.address : tokensList[0],
      })
    )
  }, [pool.id])

  return (
    <div data-testid="withdraw-form">
      {!isSingleAssetExit ? (
        <ProportionalWithdrawalInput pool={pool} />
      ) : (
        <Box mt="32px">
          <SingleTokenInput
            address={singleAmountOut.address}
            amount={singleAmountOut.value}
            name={singleAmountOut.address}
            customBalance={singleAmountOut.max || '0'}
            balanceLabel="Max"
            balanceLoading={isLoadingMax}
            disableNativeAssetBuffer
            ignoreWalletBalance
            updateAmount={handleAmountChange}
            updateAddress={updateSingleAmountOut}
            tokensList={tokensList}
          />
        </Box>
      )}

      <WithdrawTotals pool={pool} style={{ marginTop: '1rem' }} />

      {highPriceImpact && (
        <BalCheckbox
          modelValue={highPriceImpactAccepted}
          rules={[isRequired('Price impact acknowledgement')]}
          name="highPriceImpactAccepted"
          size="sm"
          label="I accept the high price impact from withdrawing, moving the market price based on the depth of the market"
        />
      )}

      {(queryError || maxError) && (
        <Box mt="1rem">
          <BalAlert
            type="error"
            title="There was an error"
            description={queryError || maxError}
            style={{ marginTop: '1rem' }}
            block
          />
        </Box>
      )}

      <div style={{ marginTop: '1rem' }}>
        {!isWalletReady ? (
          <BalBtn label="Connect Wallet" block onClick={startConnectWithInjectedProvider} />
        ) : (
          <BalBtn label="Preview" disabled={!!disabled} block onClick={() => setShowPreview(true)} />
        )}
      </div>

      {showPreview && <WithdrawPreviewModal pool={pool} onClose={() => setShowPreview(false)} />}
    </div>
  )
}

export default WithdrawForm
