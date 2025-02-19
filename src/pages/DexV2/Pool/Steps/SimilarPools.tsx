// SimilarPools.tsx
import React, { useMemo } from 'react'
import { orderBy, take } from 'lodash'
import styled from 'styled-components'
// import { useTranslation } from 'react-i18next'

// // Import your pre-converted components
// import BalCard from '@/components/BalCard'
// import BalStack from '@/components/BalStack'
// import BalIcon from '@/components/BalIcon'
// import BalAssetSet from '@/components/BalAssetSet'
// import TokenPills from '@/components/TokenPills'
// import BalAlert from '@/components/BalAlert'
// import BalBtn from '@/components/BalBtn'

// Import your hooks (assumed to be converted to React)
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import useNumbers, { FNumFormats } from 'hooks/dex-v2/useNumbers'
import useWeb3 from 'hooks/dex-v2/useWeb3'
import useNetwork from 'hooks/dex-v2/useNetwork'

const SimilarPools: React.FC = () => {
  // // HOOKS & STATE
  // const { isWalletReady } = useWeb3()
  // const { networkConfig } = useNetwork()
  // const { similarPools, isLoadingSimilarPools, existingPool, setStep, proceed, resetPoolCreationState, goBack } =
  //   usePoolCreation()
  // const { fNum } = useNumbers()
  // const { t } = useTranslation()

  // // COMPUTED: Title (based on whether a pool already exists)
  // const title = useMemo(() => {
  //   return existingPool ? t('createAPool.poolAlreadyExists') : t('createAPool.similarPoolsExist')
  // }, [existingPool, t])

  // // COMPUTED: Limit the similar pools to the first 4 with the highest total liquidity
  // const relevantSimilarPools = useMemo(() => {
  //   return take(
  //     orderBy(similarPools, (pool) => Number(pool.totalLiquidity), 'desc'),
  //     4
  //   )
  // }, [similarPools])

  // // FUNCTIONS
  // const cancel = () => {
  //   resetPoolCreationState()
  //   setStep(0)
  // }

  return <div>SimilarPools</div>
  // return (
  //   <BalCard shadow="xl" noBorder className={existingPool ? 'border-red-400' : ''}>
  //     <BalStack vertical>
  //       {/* Header */}
  //       <BalStack vertical spacing="xs">
  //         {isWalletReady && <InfoText>{networkConfig?.name}</InfoText>}
  //         <BalStack horizontal align="center" spacing="xs">
  //           <BackButton onClick={goBack}>
  //             <BalIcon name="chevron-left" />
  //           </BackButton>
  //           <HeaderTitle>{title}</HeaderTitle>
  //         </BalStack>
  //       </BalStack>

  //       {/* Info about an existing pool */}
  //       {existingPool && <InfoParagraph>{t('createAPool.existingPoolInfo')}</InfoParagraph>}

  //       {/* Loading similar pools */}
  //       {isLoadingSimilarPools && <div />}

  //       {/* If an existing pool is found, show its details */}
  //       {existingPool ? (
  //         <BalCard shadow="none">
  //           <BalStack vertical>
  //             <BalStack horizontal align="center" spacing="sm">
  //               <div>
  //                 <BalAssetSet width={35} addresses={existingPool.tokensList} />
  //               </div>
  //               <TokenPills tokens={existingPool.tokens} />
  //             </BalStack>
  //             <BalStack horizontal spacing="lg">
  //               <InfoStack>
  //                 <LabelText>{t('poolValue')}</LabelText>
  //                 <ValueText>{fNum(existingPool.totalLiquidity, FNumFormats.fiat)}</ValueText>
  //               </InfoStack>
  //               <InfoStack>
  //                 <LabelText>{t('volume24hShort')}</LabelText>
  //                 <ValueText>{fNum(existingPool.volumeSnapshot || '0', FNumFormats.fiat)}</ValueText>
  //               </InfoStack>
  //               <InfoStack>
  //                 <LabelText>{t('fees')}</LabelText>
  //                 <ValueText>{fNum(existingPool.swapFee, FNumFormats.percent)}</ValueText>
  //               </InfoStack>
  //             </BalStack>
  //           </BalStack>
  //         </BalCard>
  //       ) : (
  //         /* Otherwise, display a list of similar pools */
  //         <BalStack vertical>
  //           {relevantSimilarPools.map((pool) => (
  //             <BalCard key={pool.id} shadow="none">
  //               <BalStack vertical>
  //                 <BalStack horizontal align="center" spacing="sm">
  //                   <div>
  //                     <BalAssetSet width={35} addresses={pool.tokensList} />
  //                   </div>
  //                   <TokenPills tokens={pool.tokens} />
  //                 </BalStack>
  //                 <BalStack horizontal spacing="xl">
  //                   <InfoStack>
  //                     <LabelText>{t('poolValue')}</LabelText>
  //                     <ValueText>{fNum(pool.totalLiquidity, FNumFormats.fiat)}</ValueText>
  //                   </InfoStack>
  //                   <InfoStack>
  //                     <LabelText>{t('volume24hShort')}</LabelText>
  //                     <ValueText>{fNum(pool.volumeSnapshot || '0', FNumFormats.fiat)}</ValueText>
  //                   </InfoStack>
  //                   <InfoStack>
  //                     <LabelText>{t('fees')}</LabelText>
  //                     <ValueText>{fNum(pool.swapFee, FNumFormats.percent)}</ValueText>
  //                   </InfoStack>
  //                 </BalStack>
  //               </BalStack>
  //             </BalCard>
  //           ))}
  //         </BalStack>
  //       )}

  //       {/* Warning alert if no existing pool is found */}
  //       {!existingPool && (
  //         <BalAlert block type="warning" title="Are you sure you want to continue?">
  //           You can continue to create your pool anyway, but you’ll have to pay pool creation gas costs and liquidity
  //           will be fractured which is likely to result in your new pool being less profitable.
  //         </BalAlert>
  //       )}

  //       {/* Action buttons */}
  //       <BalStack horizontal expandChildren>
  //         <BalBtn block outline color="black" onClick={cancel}>
  //           {t('cancel')}
  //         </BalBtn>
  //         {!existingPool && (
  //           <BalBtn block color="gradient" onClick={proceed}>
  //             Continue anyway
  //           </BalBtn>
  //         )}
  //       </BalStack>
  //     </BalStack>
  //   </BalCard>
  // )
}

export default SimilarPools

/* Styled Components to replace some Tailwind classes */

const InfoText = styled.span`
  font-size: 0.75rem;
  color: #4b5563;
`

const BackButton = styled.button`
  display: flex;
  color: #2563eb;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  &:hover {
    color: #1d4ed8;
  }
`

const HeaderTitle = styled.h5`
  font-weight: 600;
  color: #374151;
  margin: 0;
`

const InfoParagraph = styled.p`
  font-size: 0.875rem;
  color: #374151;
`

const InfoStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
`

const LabelText = styled.span`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`

const ValueText = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
`
