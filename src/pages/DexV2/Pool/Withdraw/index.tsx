import React, { useEffect, FC } from 'react'
import styled from 'styled-components'
import { useParams } from 'react-router-dom'

// import WithdrawPage from '@/components/contextual/pages/pool/withdraw/WithdrawPage';
import { usePool } from 'state/dexV2/pool/usePool'
import LoadingBlock from 'pages/DexV2/common/LoadingBlock'
import { oneSecondInMs } from 'hooks/dex-v2/useTime'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import BalCard from 'pages/DexV2/common/BalCard'
import { Flex } from 'rebass'
import { SwapSettingsContext } from 'pages/DexV2/common/SwapSettingsPopover'
import SwapSettingsPopover from 'pages/DexV2/common/popovers/SwapSettingsPopover'
import WithdrawForm from './components/WithdrawForm'
import { isRecoveryExitsOnly } from 'hooks/dex-v2/usePoolHelpers'
import WithdrawTabs from './components/WithdrawTabs'
import useWithdrawPageTabs from 'state/dexV2/pool/useWithdrawPageTabs'
import { setPoolState } from 'state/dexV2/pool'
import { useDispatch } from 'react-redux'
import DexV2Layout from 'pages/DexV2/common/Layout'

function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return
    const id = setInterval(callback, delay)
    return () => clearInterval(id)
  }, [callback, delay])
}

const Withdraw: FC = () => {
  const params = useParams<any>()
  const poolId = (params.id as string).toLowerCase()
  const { pool, isLoadingPool, refetchOnchainPoolData } = usePool(poolId)
  useInterval(refetchOnchainPoolData, oneSecondInMs * 20)
  const { balanceQueryLoading } = useTokens()
  const { resetTabs } = useWithdrawPageTabs()
  const dispatch = useDispatch()

  const isLoading = isLoadingPool || !pool || balanceQueryLoading

  useEffect(() => {
    resetTabs()
    dispatch(setPoolState({ bptIn: '' }))
  }, [isLoading])

  return (
    <DexV2Layout>
      <Container>
        {isLoading ? (
          <LoadingBlock style={{ height: '24rem' }} />
        ) : (
          <BalCard shadow="xl" exposeOverflow noBorder>
            <div className="w-full">
              <Flex justifyContent="space-between" alignItems="center">
                <div>Withdraw from pool</div>
                <SwapSettingsPopover context={SwapSettingsContext.invest} />
              </Flex>

              <WithdrawTabs pool={pool} />
            </div>

            {pool.address ? <WithdrawForm pool={pool} /> : null}
          </BalCard>
        )}
      </Container>
    </DexV2Layout>
  )
}

export default Withdraw

// Styled container similar to "px-4 sm:px-0 mx-auto max-w-md"
const Container = styled.div`
  padding: 0 1rem;
  margin: 0 auto;
  width: 100%;
  max-width: 480px;
`
