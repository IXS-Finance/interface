// AddLiquidityForm.tsx
import React, { useState, useEffect, useRef } from 'react'
import { isEqual } from 'lodash'
import styled from 'styled-components'
import { bnum, includesAddress } from 'lib/utils'
import { LOW_LIQUIDITY_THRESHOLD } from 'constants/dexV2/poolLiquidity'
import { Pool } from 'services/pool/types'
import { tokenWeight, usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'

// React component equivalents for your Vue components:
// import WrapStEthLink from '@/components/contextual/pages/pool/add-liquidity/WrapStEthLink'
// import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal'
// import AddLiquidityPreview from './components/AddLiquidityPreview/AddLiquidityPreview'
// import AddLiquidityTotals from './components/AddLiquidityTotals'
// import BalCheckbox from '@/components/BalCheckbox'
import BalAlert from '../../components/BalAlert'
import { ButtonPrimary } from 'pages/DexV2/common'
import TokenInput from '../../components/TokenInput'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { useJoinPool } from 'state/dexV2/pool/useJoinPool'
import ActionSteps from '../../components/ActionSteps'

interface AddLiquidityFormProps {
  pool: Pool
}

const AddLiquidityForm: React.FC<AddLiquidityFormProps> = ({ pool }) => {
  const { join, setAmountsIn, queryJoinQuery } = useJoinPool(pool)

  const [currentActionIndex, setCurrentActionIndex] = useState(0)
  // STATE
  const [showPreview, setShowPreview] = useState(false)
  const [showStakeModal, setShowStakeModal] = useState(false)

  // CUSTOM HOOKS / COMPOSABLES
  const { managedPoolWithSwappingHalted, poolJoinTokens } = usePoolHelpers(pool)
  const { isMismatchedNetwork } = useWeb3()
  const { wrappedNativeAsset, nativeAsset, getToken } = useTokens()
  const {
    isLoadingQuery,
    isSingleAssetJoin,
    amountsIn,
    highPriceImpact,
    highPriceImpactAccepted,
    hasValidInputs,
    hasAmountsIn,
    queryError,
    setTokensIn,
  } = useJoinPool(pool)

  // COMPUTED (recalculated on every render)
  const forceProportionalInputs = managedPoolWithSwappingHalted
  const poolHasLowLiquidity = bnum(pool.totalLiquidity).lt(LOW_LIQUIDITY_THRESHOLD)

  let excludedTokens: string[] = [pool.address]

  // FUNCTIONS
  async function initializeTokensForm(isSingleAsset: boolean) {
    if (isSingleAsset) {
      // For single asset joins, default to the wrapped native asset.
      setTokensIn([wrappedNativeAsset.address])
    } else {
      setTokensIn(poolJoinTokens)
    }
  }

  function getTokenInputLabel(address: string): string | undefined {
    const token = getToken(address)
    return token ? token.symbol : undefined
  }

  function tokenOptions(address: string): string[] {
    if (isSingleAssetJoin) return []
    if (includesAddress([wrappedNativeAsset.address, nativeAsset.address], address)) {
      return [wrappedNativeAsset.address, nativeAsset.address]
    }
    return []
  }

  function onTokenChange() {
    if (isSingleAssetJoin && amountsIn.length > 0) {
      // Clear the amount value for single asset joins.
      amountsIn[0].value = ''
    }
  }

  const onSubmit = async () => {
    const finalAmountsIn = amountsIn.map((amountIn: any) => {
      return { address: amountIn.address, value: '1', valid: true }
    })

    setAmountsIn(finalAmountsIn)

    await join()
  }

  console.log('amountsIn', amountsIn)

  // ON MOUNT: Initialize the tokens form.
  useEffect(() => {
    initializeTokensForm(isSingleAssetJoin)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // WATCH: When isSingleAssetJoin or poolJoinTokens change, reinitialize the tokens form
  // if the preview modal is not open.
  const prevIsSingleAssetRef = useRef(isSingleAssetJoin)
  const prevJoinTokensRef = useRef(poolJoinTokens)

  useEffect(() => {
    if (!showPreview) {
      const prevIsSingleAsset = prevIsSingleAssetRef.current
      const prevJoinTokens = prevJoinTokensRef.current
      const hasTabChanged = prevIsSingleAsset !== isSingleAssetJoin
      const hasUserTokensChanged = !isEqual(prevJoinTokens, poolJoinTokens)
      if (hasTabChanged || hasUserTokensChanged) {
        initializeTokensForm(isSingleAssetJoin)
      }
      prevIsSingleAssetRef.current = isSingleAssetJoin
      prevJoinTokensRef.current = poolJoinTokens
    }
  }, [isSingleAssetJoin, poolJoinTokens, showPreview])

  return (
    <div data-testid="add-liquidity-form">
      {forceProportionalInputs && (
        <BalAlert type="warning" title="Swapping halted - proportional liquidity provision only">
          A swapping halt has been issued by the manager of this pool. For your safety, while the swapping halt is in
          effect, you may only add liquidity in proportional amounts.
        </BalAlert>
      )}

      {poolHasLowLiquidity && (
        <BalAlert type="warning" title="Be careful: This pool has low liquidity">
          Add assets proportionally to the pool weights or the price impact will be high and you will likely get REKT
          and lose money.
        </BalAlert>
      )}

      {amountsIn.map((amountIn: any) => (
        <TokenInput
          key={amountIn.address}
          // isValid={amountIn.valid}
          address={amountIn.address}
          amount={amountIn.value}
          name={amountIn.address}
          weight={tokenWeight(pool, amountIn.address)}
          updateAmount={(value: string) => {
            // Update the amount value
            // (Assuming the join pool provider has a method or state setter for this.)
          }}
          // options={tokenOptions(amountIn.address)}
          // aria-label={`Amount of: ${getTokenInputLabel(amountIn.address)}`}
          // fixedToken={!isSingleAssetJoin}
          // excludedTokens={excludedTokens}
          // onUpdateAddress={onTokenChange}
        />
      ))}

      {/* <AddLiquidityTotals pool={pool} /> */}

      {highPriceImpact && (
        <HighPriceImpactContainer className="p-2 pb-2 mt-5 rounded-lg border dark:border-gray-700">
          I accept the high price impact from , moving the market price based on the depth of the market.
          {/* <BalCheckbox
            value={highPriceImpactAccepted}
            rules={[isRequired(t('priceImpactCheckbox'))]}
            name="highPriceImpactAccepted"
            size="sm"
            label={t('priceImpactAccept', [t('depositing')])}
            onChange={(val: boolean) => {
              // Update the high price impact acceptance.
              // (Assuming the join pool provider has a method or state setter for this.)
            }}
          /> */}
        </HighPriceImpactContainer>
      )}

      {/* <WrapStEthLink pool={pool} className="mt-5" /> */}

      {queryError && (
        <BalAlert type="error" title="There was an error">
          {queryError}
        </BalAlert>
      )}

      <div className="mt-4">
        <ButtonPrimary
          // disabled={!hasAmountsIn || !hasValidInputs || isMismatchedNetwork || isLoadingQuery || Boolean(queryError)}
          onClick={onSubmit}
        >
          Preview
        </ButtonPrimary>
      </div>

      {/* Render modals (using React portals or an equivalent modal manager) */}
      {/* {showPreview && (
        <AddLiquidityPreview
          pool={pool}
          onClose={() => setShowPreview(false)}
          onShowStakeModal={() => setShowStakeModal(true)}
        />
      )}
      {showStakeModal && (
        <StakePreviewModal
          pool={pool}
          isVisible={showStakeModal}
          action="stake"
          onClose={() => setShowStakeModal(false)}
        />
      )} */}
    </div>
  )
}

export default AddLiquidityForm

/* Styled component for the high price impact container */
const HighPriceImpactContainer = styled.div`
  /* If the container has a descendant with an error (for example, a checkbox error),
     apply a red border and background. (The ":has" selector is not widely supported,
     so you may need to adjust this using another approach.) */
  &.high-price-impact:has(.bal-checkbox-error) {
    border-color: #ef4444; /* Tailwind red-500 */
    background-color: rgba(239, 68, 68, 0.1); /* red-50 with opacity */
    transition: border-color 0.2s, background-color 0.2s;
  }
`
