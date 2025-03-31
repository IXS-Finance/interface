import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import Modal from 'pages/DexV2/common/modals'

import { bnum } from 'lib/utils'
import { Pool } from 'services/pool/types'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNumbers from 'hooks/dex-v2/useNumbers'
import { useJoinPool } from 'state/dexV2/pool/useJoinPool'
import { TokenInfoMap } from 'types/TokenList'
import { oneSecondInMs } from 'hooks/dex-v2/useTime'
import Summary from './components/Summary'
import BalAlert from 'pages/DexV2/Pool/components/BalAlert'
import TokenAmounts from 'pages/DexV2/common/forms/TokenAmounts'
import { Flex } from 'rebass'
import BalCircle from 'pages/DexV2/common/BalCircle'
import AddLiquidityActions from './components/AddLiquidityActions'

// import Summary from './components/Summary';
// import TokenAmounts from '@/components/forms/pool_actions/shared/TokenAmounts';
// import BalModal from '@/components/BalModal';
// import BalCircle from '@/components/BalCircle';
// import BalIcon from '@/components/BalIcon';
// import BalAlert from '@/components/BalAlert';

type AmountMap = {
  [address: string]: string
}

interface AddLiquidityModalProps {
  isLoadingQuery: boolean
  queryJoinQuery: any
  pool: Pool
  onClose: () => void
}

const AddLiquidityPreview: React.FC<AddLiquidityModalProps> = ({ isLoadingQuery, queryJoinQuery, pool, onClose }) => {
  // Local state
  const [confirmed, setConfirmed] = useState(false)

  // Hooks / Providers
  const { allowances, getToken } = useTokens()
  const { toFiat } = useNumbers()
  const {
    isSingleAssetJoin,
    amountsIn, // assumed to be an array of objects { address: string, value: string }
    bptOut,
    fiatValueIn,
    fiatValueOut,
    priceImpact,
    highPriceImpact,
    rektPriceImpact,
    txInProgress,
    missingPricesIn,
    resetAmounts,
  } = useJoinPool(pool)

  // Derived values (computed inline)

  // Title
  const title = confirmed ? 'Add liquidity confirmed' : 'Add liquidity preview'

  // Build amountInMap from amountsIn array
  const amountInMap: AmountMap = {}
  amountsIn.forEach((amountIn: any) => {
    amountInMap[amountIn.address] = amountIn.value
  })

  // Amount out map: the pool’s address maps to bptOut
  const amountOutMap: AmountMap = {
    [pool.address]: bptOut,
  }

  console.log('bptOut', bptOut)

  // Build token maps using getToken()
  const tokenInMap: TokenInfoMap = {}
  Object.keys(amountInMap).forEach((address) => {
    tokenInMap[address] = getToken(address)
  })
  const tokenOutMap: TokenInfoMap = {
    [pool.address]: getToken(pool.address),
  }

  // Build fiat amount maps
  const fiatAmountInMap: AmountMap = {}
  Object.keys(amountInMap).forEach((address) => {
    fiatAmountInMap[address] = toFiat(amountInMap[address], address)
  })
  const fiatAmountOutMap: AmountMap = fiatValueOut ? { [pool.address]: fiatValueOut } : {}

  // Compute total fiat amount out by summing the fiat amounts (using bnum)
  const fiatTotalOut = Object.values(fiatAmountOutMap).reduce(
    (total, amount) => bnum(total).plus(amount).toString(),
    '0'
  )

  // Determine whether to show tokens-out section based on tokenOutMap keys
  const showTokensOut = Object.keys(tokenOutMap).length > 0

  // Methods
  const handleClose = () => {
    if (confirmed) {
      resetAmounts()
      setConfirmed(false)
    }
    onClose()
  }

  // // Periodically refetch join pool query every 10 seconds if conditions allow
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (!isLoadingQuery && !txInProgress) {
  //       queryJoinQuery.refetch()
  //     }
  //   }, oneSecondInMs * 10)
  //   return () => clearInterval(interval)
  // }, [isLoadingQuery, txInProgress, JSON.stringify(allowances)])

  return (
    <Modal onClose={handleClose}>
      <Title>{title}</Title>

      <TokenAmounts
        title="You’re providing"
        amountMap={amountInMap}
        tokenMap={tokenInMap}
        fiatAmountMap={fiatAmountInMap}
        fiatTotal={fiatValueIn}
        hideAmountShare={isSingleAssetJoin}
      />

      <TokenAmounts
        showZeroAmounts
        title="You’re expected to receive"
        className="mt-4"
        amountMap={amountOutMap}
        tokenMap={tokenOutMap}
        fiatAmountMap={fiatAmountOutMap}
        fiatTotal={fiatTotalOut}
        hideAmountShare
      />

      {missingPricesIn ? (
        <BalAlert
          v-if=""
          type="warning"
          title="Price information is missing for this pool, since it contains a token not found by our price provider."
          className="mt-4"
          block
        />
      ) : null}
      <Summary
        pool={pool}
        fiatTotal={missingPricesIn ? '-' : fiatValueIn}
        priceImpact={priceImpact}
        highPriceImpact={highPriceImpact}
        className="mt-4"
      />

      {rektPriceImpact ? (
        <BalAlert
          v-if=""
          type="error"
          title="This price impact is too high. You cannot proceed"
          description="The likelihood of you losing money is too high. For your protection, you can’t perform this transaction on this interface."
          className="mt-6 mb-2"
        />
      ) : null}

      <AddLiquidityActions pool={pool} onSuccess={() => setConfirmed(true)} />
    </Modal>
  )
}

export default AddLiquidityPreview

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`
