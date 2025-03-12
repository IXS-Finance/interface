// AddLiquidityForm.tsx
import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import debounce from 'debounce-promise'
import { useQuery } from '@tanstack/react-query'

import { bnum, includesAddress } from 'lib/utils'
import { LOW_LIQUIDITY_THRESHOLD } from 'constants/dexV2/poolLiquidity'
import { Pool } from 'services/pool/types'
import { tokenWeight, usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'

// React component equivalents for your Vue components:
// import WrapStEthLink from '@/components/contextual/pages/pool/add-liquidity/WrapStEthLink'
// import StakePreviewModal from '@/components/contextual/pages/pool/staking/StakePreviewModal'
// import AddLiquidityPreview from './components/AddLiquidityPreview/AddLiquidityPreview'
import AddLiquidityTotals from './components/AddLiquidityTotals'
// import BalCheckbox from '@/components/BalCheckbox'
import BalAlert from '../../components/BalAlert'
import { ButtonPrimary } from 'pages/DexV2/common'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { AmountIn, useJoinPool } from 'state/dexV2/pool/useJoinPool'
import StakePreviewModal from './components/StakePreviewModal'
import AddLiquidityPreview from './components/AddLiquidityPreview'
import { useDispatch } from 'react-redux'
import { setValueOfAmountIn } from 'state/dexV2/pool'
import TokenInput from './components/TokenInput'
import { Flex } from 'rebass'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import BalCheckbox from 'pages/DexV2/common/BalCheckbox'
import { isRequired } from 'lib/utils/validations'

interface AddLiquidityFormProps {
  pool: Pool
}

const AddLiquidityForm: React.FC<AddLiquidityFormProps> = ({ pool }) => {
  const dispatch = useDispatch()
  const {
    highPriceImpactAccepted,
    txInProgress,
    isSingleAssetJoin,
    amountsIn,
    highPriceImpact,
    hasValidInputs,
    hasAmountsIn,
    setTokensIn,
    queryJoin,
    setHighPriceImpactAccepted,
  } = useJoinPool(pool)

  // Create a debounced version of queryJoin.
  // --- React Query ---
  const queryEnabled = !txInProgress
  // @ts-ignore
  const queryJoinQuery = useQuery({
    queryKey: QUERY_KEYS.Pools.Joins.QueryJoin(amountsIn, isSingleAssetJoin),
    queryFn: queryJoin,
    enabled: queryEnabled,
    refetchOnWindowFocus: false,
  })

  const queryError = queryJoinQuery.error ? queryJoinQuery.error.message : undefined
  const isLoadingQuery = queryJoinQuery.isFetching

  // Local state
  const [showPreview, setShowPreview] = useState(false)
  const [showStakeModal, setShowStakeModal] = useState(false)

  // Get composables / hooks
  const { managedPoolWithSwappingHalted, poolJoinTokens } = usePoolHelpers(pool)
  const { isWalletReady, startConnectWithInjectedProvider, isMismatchedNetwork } = useWeb3()
  const { wrappedNativeAsset, nativeAsset, getToken } = useTokens()

  // COMPUTED (recalculated on every render)
  const forceProportionalInputs: boolean = !!managedPoolWithSwappingHalted
  const poolHasLowLiquidity: boolean = bnum(pool.totalLiquidity).lt(LOW_LIQUIDITY_THRESHOLD)
  const excludedTokens: string[] = (() => {
    const tokens = [pool.address]

    return tokens
  })()

  // Initialize token inputs based on join type
  function initializeTokensForm(isSingle: boolean) {
    if (isSingle) {
      // For single asset joins, default to wrapped native asset
      setTokensIn([wrappedNativeAsset.address])
    } else {
      if (poolJoinTokens) {
        setTokensIn(poolJoinTokens)
      }
    }
  }

  // Return the token symbol for a given address.
  function getTokenInputLabel(address: string): string | undefined {
    const token = getToken(address)
    return token?.symbol
  }

  // If the address is the wrapped native asset, give an option for the native asset.
  function tokenOptions(address: string): string[] {
    if (isSingleAssetJoin) return []
    return includesAddress([wrappedNativeAsset.address, nativeAsset.address], address)
      ? [wrappedNativeAsset.address, nativeAsset.address]
      : []
  }

  function setAmount(index: number, value: string) {
    dispatch(setValueOfAmountIn({ index, value }))
  }

  useEffect(() => {
    initializeTokensForm(isSingleAssetJoin)
  }, [pool.address])

  const disabled = !hasAmountsIn || !hasValidInputs || isMismatchedNetwork || isLoadingQuery || !!queryError

  return (
    <Container>
      {forceProportionalInputs && (
        <BalAlert type="warning" title="Swapping halted - proportional liquidity provision only">
          A swapping halt has been issued by the manager of this pool. For your safety, while the swapping halt is in
          effect, you may only add liquidity in proportional amounts.
        </BalAlert>
      )}

      {amountsIn.length > 0 && poolHasLowLiquidity ? (
        <BalAlert type="warning" title="Be careful: This pool has low liquidity">
          Add assets proportionally to the pool weights or the price impact will be high and you will likely get REKT
          and lose money.
        </BalAlert>
      ) : null}

      <Flex flexDirection="column" css={{ gap: '1rem' }} mt={2} mb={3}>
        {amountsIn.length === 0 ? (
          <>
            <LoadingBlock className="h-30" />
            <LoadingBlock className="h-30" />
          </>
        ) : (
          <>
            {amountsIn.map((amountIn: AmountIn, index: number) => (
              <TokenInput
                key={amountIn.address}
                address={amountIn.address}
                amount={amountIn.value}
                name={amountIn.address}
                weight={tokenWeight(pool, amountIn.address)}
                updateAddress={() => {}}
                fixedToken
                updateAmount={(value: string) => {
                  setAmount(index, value)
                }}
              />
            ))}
          </>
        )}
      </Flex>

      {!disabled ? <AddLiquidityTotals isLoadingQuery={isLoadingQuery} pool={pool} /> : null}

      {highPriceImpact && (
        <HighPriceImpactContainer className="p-2 pb-2 mt-5 rounded-lg border dark:border-gray-700">
          <BalCheckbox
            modelValue={highPriceImpactAccepted}
            rules={[isRequired('Price impact acknowledgement')]}
            name="highPriceImpactAccepted"
            size="sm"
            label={`I accept the high price impact from depositing, moving the market price based on the depth of the market.`}
            onChange={(val: boolean) => {
              setHighPriceImpactAccepted(val)
            }}
          />
        </HighPriceImpactContainer>
      )}

      {/* <WrapStEthLink pool={pool} className="mt-5" /> */}

      {queryError && (
        <BalAlert type="error" title="There was an error">
          {queryError}
        </BalAlert>
      )}

      <div className="mt-4">
        <ButtonPrimary disabled={!!disabled} onClick={() => setShowPreview(true)}>
          Preview
        </ButtonPrimary>
      </div>

      {pool && showPreview ? (
        <AddLiquidityPreview
          isLoadingQuery={isLoadingQuery}
          queryJoinQuery={queryJoinQuery}
          pool={pool}
          onClose={() => setShowPreview(false)}
          onShowStakeModal={() => setShowStakeModal(true)}
        />
      ) : null}

      {/* <StakePreviewModal onClose={() => setShowStakeModal(false)} /> */}

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
    </Container>
  )
}

export default AddLiquidityForm

const Container = styled.div`
  width: 100%;

  .mt-4 {
    margin-top: 1rem;
  }
`
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
