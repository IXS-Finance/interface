import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useQuery } from '@tanstack/react-query'

import { bnum, isSameAddress } from 'lib/utils'
import { LOW_LIQUIDITY_THRESHOLD } from 'constants/dexV2/poolLiquidity'
import { Pool } from 'services/pool/types'
import { tokenWeight, usePoolHelpers } from 'hooks/dex-v2/usePoolHelpers'

import AddLiquidityTotals from './components/AddLiquidityTotals'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import { AmountIn, useJoinPool } from 'state/dexV2/pool/useJoinPool'
import AddLiquidityPreview from './components/AddLiquidityPreview'
import { useDispatch } from 'react-redux'
import { setPoolState, setValueOfAmountIn } from 'state/dexV2/pool'
import TokenInput from './components/TokenInput'
import { Flex } from 'rebass'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import QUERY_KEYS from 'constants/dexV2/queryKeys'
import BalCheckbox from 'pages/DexV2/common/BalCheckbox'
import { isRequired } from 'lib/utils/validations'
import BalAlert from 'pages/DexV2/common/BalAlert'
import { ButtonPrimary } from 'pages/DexV2/common'
import Switch from 'pages/DexV2/Pool/components/Switch'
import usePropMaxJoin from 'hooks/dex-v2/pools/usePropMaxJoin'

interface AddLiquidityFormProps {
  pool: Pool
}

const AddLiquidityForm: React.FC<AddLiquidityFormProps> = ({ pool }) => {
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
    tokensIn,
    setAmountsIn,
  } = useJoinPool(pool)
  const { account, startConnectWithInjectedProvider } = useWeb3()
  const queryJoinQuery = useQuery({
    queryKey: QUERY_KEYS.Pools.Joins.QueryJoin(amountsIn, isSingleAssetJoin),
    queryFn: queryJoin,
    enabled: !txInProgress,
    refetchOnWindowFocus: false,
  })

  const queryError = queryJoinQuery.error ? queryJoinQuery.error.message : undefined
  const isLoadingQuery = queryJoinQuery.isFetching

  const [showPreview, setShowPreview] = useState(false)
  const [autoOptimise, setAutoOptimise] = useState(true)
  const [typingIndex, setTypingIndex] = useState(0)

  const dispatch = useDispatch()
  const { managedPoolWithSwappingHalted, poolJoinTokens } = usePoolHelpers(pool)
  const { isMismatchedNetwork } = useWeb3()
  const { wrappedNativeAsset, nativeAsset } = useTokens()
  const useNativeAsset = amountsIn.some((amount: any) => isSameAddress(amount.address, nativeAsset.address))
  const { calcAmountsIn } = usePropMaxJoin(pool, tokensIn, useNativeAsset)

  const forceProportionalInputs: boolean = !!managedPoolWithSwappingHalted
  const poolHasLowLiquidity: boolean = bnum(pool.totalLiquidity).lt(LOW_LIQUIDITY_THRESHOLD)

  // Create an array of refs for the TokenInputs

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

  function setAmount(index: number, value: string, address: string) {
    dispatch(setValueOfAmountIn({ index, value }))
    if (autoOptimise) {
      const amountsIn = calcAmountsIn({
        address,
        valid: true,
        value,
      })

      if (amountsIn.every((item) => Number(item.value) > 0)) {
        setAmountsIn(amountsIn)
      }

      if (value === '') {
        setAmountsIn(amountsIn.map((item) => ({ ...item, value: '' })))
      }
      setTypingIndex(index)
    } else {
      if (!value) {
        dispatch(setPoolState({ bptOut: '0', priceImpact: 0 }))
      }
    }
  }

  function toggleAutoOptimise() {
    setAutoOptimise(!autoOptimise)
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

      {poolHasLowLiquidity ? (
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
                noRules={!account}
                fixedToken
                autoFocus={index === typingIndex}
                updateAmount={(value: string) => {
                  setAmount(index, value, amountIn.address)
                }}
              />
            ))}
          </>
        )}
      </Flex>

      <Flex alignItems="center" style={{ gap: 8 }} my={16}>
        <Switch checked={autoOptimise} onChange={toggleAutoOptimise} />
        <SwitchText>Auto optimize liquidity</SwitchText>
      </Flex>

      {hasAmountsIn && account ? <AddLiquidityTotals isLoadingQuery={isLoadingQuery} pool={pool} /> : null}

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

      {account && queryError && (
        <div>
          <BalAlert type="error" title="There was an error" block>
            {queryError}
          </BalAlert>
        </div>
      )}

      <div className="mt-4">
        {!account ? (
          <ButtonPrimary onClick={startConnectWithInjectedProvider}>Connect Wallet</ButtonPrimary>
        ) : (
          <ButtonPrimary disabled={!!disabled} onClick={() => setShowPreview(true)}>
            Preview
          </ButtonPrimary>
        )}
      </div>

      {pool && showPreview ? (
        <AddLiquidityPreview
          isLoadingQuery={isLoadingQuery}
          queryJoinQuery={queryJoinQuery}
          pool={pool}
          onClose={() => setShowPreview(false)}
        />
      ) : null}
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

const SwitchText = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`
