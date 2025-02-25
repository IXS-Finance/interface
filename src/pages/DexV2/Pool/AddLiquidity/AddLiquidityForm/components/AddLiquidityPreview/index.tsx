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
import Actions from './components/Actions'

// import Summary from './components/Summary';
// import TokenAmounts from '@/components/forms/pool_actions/shared/TokenAmounts';
// import Actions from './components/Actions';
// import BalModal from '@/components/BalModal';
// import BalCircle from '@/components/BalCircle';
// import BalIcon from '@/components/BalIcon';
// import BalAlert from '@/components/BalAlert';

type AmountMap = {
  [address: string]: string
}

interface AddLiquidityModalProps {
  pool: Pool
  onClose: () => void
  onShowStakeModal: () => void
}

const AddLiquidityPreview: React.FC<AddLiquidityModalProps> = ({ pool, onClose, onShowStakeModal }) => {
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
    isLoadingQuery,
    txInProgress,
    queryJoinQuery,
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

  const handleShowStakeModal = () => {
    handleClose()
    onShowStakeModal()
  }

  // Periodically refetch join pool query every 10 seconds if conditions allow
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoadingQuery && !txInProgress) {
        queryJoinQuery.refetch()
      }
    }, oneSecondInMs * 10)
    return () => clearInterval(interval)
  }, [isLoadingQuery, txInProgress, JSON.stringify(allowances)])

  return (
    <Modal onClose={onClose}>
      <Flex alignItems="center">
        {confirmed ? (
          <BalCircle size="8" color="green" className="mr-2 text-white">
            <svg
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 512 512"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path>
            </svg>
          </BalCircle>
        ) : null}

        <h4>{title}</h4>
      </Flex>

      <TokenAmounts
        title="You’re providing"
        amountMap={amountInMap}
        tokenMap={tokenInMap}
        fiatAmountMap={fiatAmountInMap}
        fiatTotal={fiatValueIn}
        hideAmountShare={isSingleAssetJoin}
      />
      {showTokensOut ? (
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
      ) : null}

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

      <Actions
        pool={pool}
        className="mt-4"
        onSuccess={() => setConfirmed(true)}
        onShowStakeModal={handleShowStakeModal}
      />
    </Modal>
  )
}

export default AddLiquidityPreview

// A styled header container for the modal
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
`
