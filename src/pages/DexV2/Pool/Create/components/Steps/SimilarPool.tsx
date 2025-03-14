// SimilarPool.tsx
import React from 'react'
import { orderBy, take } from 'lodash'

import BalCard from 'pages/DexV2/common/Card'
import BalStack from 'pages/DexV2/common/BalStack'
import AssetSet from 'pages/DexV2/common/AssetSet'
import TokenPills from 'pages/DexV2/common/TokenPills'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import BalAlert from 'pages/DexV2/Pool/components/BalAlert'
import BalBtn from 'pages/DexV2/common/popovers/BalBtn'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'

interface SimilarPoolProps {}

const SimilarPool: React.FC<SimilarPoolProps> = () => {
  const { fNum } = useNumbers()
  const { similarPools, isLoadingSimilarPools, existingPool, resetPoolCreationState, setStep, proceed, goBack } =
    usePoolCreation()

  // Compute the title: if an existing pool is found, notify user; otherwise, show similar pools exist.
  const title = existingPool ? 'This pool already exists' : 'Similar pools exist'

  // Compute relevant similar pools: sort by totalLiquidity descending, then take the first 4.
  const relevantSimilarPools = take(
    orderBy(similarPools, (p) => Number(p.totalLiquidity), 'desc'),
    4
  )

  // Cancel function: reset pool creation state and go back to step 0.
  const cancel = () => {
    resetPoolCreationState()
    setStep(0)
  }

  return (
    <BalCard shadow="xl" noBorder className={existingPool ? 'border-red-400' : ''}>
      <BalStack vertical>
        <BalStack vertical spacing="xs">
          <BalStack horizontal align="center" spacing="xs">
            <button className="flex text-blue-600 hover:text-blue-700 transition-colors" onClick={goBack}>
              <svg
                viewBox="0 0 24 24"
                width="24"
                height="24"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <h5 className="font-semibold">{title}</h5>
          </BalStack>
        </BalStack>
        {existingPool && (
          <p>
            There’s already another pool with exactly the same tokens and fee structure. It’s recommended to add your
            liquidity to the other pool or to go back and change your Pool Creation parameters in a material way to
            avoid fractured liquidity and lower profits for both pools.
          </p>
        )}
        {isLoadingSimilarPools ? (
          <div /> // You might render a loader here.
        ) : existingPool ? (
          <BalCard shadow="none">
            <BalStack vertical>
              <BalStack horizontal spacing="sm" align="center">
                <div>
                  <AssetSet width={35} addresses={existingPool.tokensList} />
                </div>
                <TokenPills tokens={existingPool.tokens} />
              </BalStack>
              <BalStack horizontal spacing="lg">
                <BalStack vertical spacing="none">
                  <span className="font-medium text-secondary">Pool value</span>
                  <span className="font-semibold">{fNum(existingPool.totalLiquidity, FNumFormats.fiat)}</span>
                </BalStack>
                <BalStack vertical spacing="none">
                  <span className="font-medium text-secondary">Vol (24h)</span>
                  <span className="font-semibold">{fNum(existingPool.volumeSnapshot || '0', FNumFormats.fiat)}</span>
                </BalStack>
                <BalStack vertical spacing="none">
                  <span className="font-medium capitalize text-secondary">fees</span>
                  <span className="font-semibold">{fNum(existingPool.swapFee, FNumFormats.percent)}</span>
                </BalStack>
              </BalStack>
            </BalStack>
          </BalCard>
        ) : (
          <BalStack vertical>
            {relevantSimilarPools.map((p) => (
              <BalCard key={p.id} shadow="none">
                <BalStack vertical>
                  <BalStack horizontal spacing="sm" align="center">
                    <div>
                      <AssetSet width={35} addresses={p.tokensList} />
                    </div>
                    <TokenPills tokens={p.tokens} />
                  </BalStack>
                  <BalStack horizontal spacing="xl">
                    <BalStack vertical spacing="none">
                      <span className="font-medium text-secondary">Pool value</span>
                      <span className="font-semibold">{fNum(p.totalLiquidity, FNumFormats.fiat)}</span>
                    </BalStack>
                    <BalStack vertical spacing="none">
                      <span className="font-medium text-secondary">Vol (24h)</span>
                      <span className="font-semibold">{fNum(p.volumeSnapshot || '0', FNumFormats.fiat)}</span>
                    </BalStack>
                    <BalStack vertical spacing="none">
                      <span className="font-medium capitalize text-secondary">fees</span>
                      <span className="font-semibold">{fNum(p.swapFee, FNumFormats.percent)}</span>
                    </BalStack>
                  </BalStack>
                </BalStack>
              </BalCard>
            ))}
          </BalStack>
        )}
        {!existingPool && (
          <BalAlert type="warning" block title="Are you sure you want to continue?">
            You can continue to create your pool anyway, but you’ll have to pay pool creation gas costs and liquidity
            will be fractured which is likely to result in your new pool being less profitable.
          </BalAlert>
        )}
        <BalStack horizontal expandChildren>
          <BalBtn block outline color="black" onClick={cancel}>
            Cancel
          </BalBtn>
          {!existingPool && (
            <BalBtn block color="gradient" onClick={proceed}>
              Continue anyway
            </BalBtn>
          )}
        </BalStack>
      </BalStack>
    </BalCard>
  )
}

export default SimilarPool
