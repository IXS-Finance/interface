// WithdrawPreviewModal.tsx
import React, { useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import Modal from 'pages/DexV2/common/modals'
import useExitPool from 'state/dexV2/pool/useExitPool'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNetwork from 'hooks/dex-v2/useNetwork'
import { Pool } from 'services/pool/types'
import TokenAmounts from 'pages/DexV2/common/forms/TokenAmounts'
import WithdrawSummary from './WithdrawSummary'
import WithdrawActions from './WithdrawActions'
import { setDataForSingleAmountOut } from 'state/dexV2/pool'

interface WithdrawPreviewModalProps {
  pool: Pool
  onClose: () => void
}

const WithdrawPreviewModal: React.FC<WithdrawPreviewModalProps> = ({ pool, onClose }) => {
  const history = useHistory()
  const { networkSlug } = useNetwork()
  const { getToken } = useTokens()
  const dispatch = useDispatch()

  // Destructure values from your exit pool hook.
  const {
    bptIn,
    fiatValueIn,
    fiatTotalOut,
    amountsOut,
    priceImpact,
    fiatAmountsOut,
    isSingleAssetExit,
    hasBpt,
    setBptIn,
    setInitialPropAmountsOut,
  } = useExitPool(pool)

  // Local state for whether the withdrawal is confirmed.
  const [withdrawalConfirmed, setWithdrawalConfirmed] = useState(false)

  // Derived values computed inline:
  const title = withdrawalConfirmed ? 'Withdrawal confirmed' : 'Withdrawal preview'

  const showTokensIn = !isSingleAssetExit

  // Create maps from pool address.
  const amountInMap = { [pool.address]: bptIn }
  const tokenInMap = { [pool.address]: getToken(pool.address) }
  const fiatAmountInMap = { [pool.address]: fiatValueIn }

  // Build tokenOutMap and amountsOutMap from amountsOut array.
  const tokenOutMap: { [address: string]: any } = {}
  amountsOut.forEach((item: { address: string; value: string }) => {
    tokenOutMap[item.address] = getToken(item.address)
  })
  const amountsOutMap: { [address: string]: string } = {}
  amountsOut.forEach((item: { address: string; value: string }) => {
    amountsOutMap[item.address] = item.value
  })

  const handleClose = () => {
    if (!hasBpt) {
      history.push(`/pool/${pool.id}?networkSlug=${networkSlug}`)
    } else {
      setBptIn('')
      dispatch(setDataForSingleAmountOut({ key: 'value', value: '' }))
      setInitialPropAmountsOut()
      onClose()
    }
  }

  const onSuccess = () => {
    setWithdrawalConfirmed(true)
  }

  return (
    <Modal onClose={handleClose}>
      <Title>{title}</Title>

      <>
        {showTokensIn && (
          <TokenAmounts
            title="You’re providing"
            amountMap={amountInMap}
            tokenMap={tokenInMap}
            fiatAmountMap={fiatAmountInMap}
            fiatTotal={fiatValueIn}
          />
        )}
        <TokenAmounts
          title="You’re expected to receive"
          className="mt-4"
          amountMap={amountsOutMap}
          tokenMap={tokenOutMap}
          fiatAmountMap={fiatAmountsOut}
          fiatTotal={fiatTotalOut}
        />
        <WithdrawSummary fiatTotal={fiatTotalOut} priceImpact={priceImpact} className="mt-4" />
      </>

      <div className="mt-4">
        <WithdrawActions pool={pool} onError={handleClose} onSuccess={onSuccess} />
      </div>
    </Modal>
  )
}

export default WithdrawPreviewModal

const Title = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`
