// WithdrawPreviewModal.tsx
import React, { useState } from 'react'
import styled from 'styled-components'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// import WithdrawSummary from './components/WithdrawSummary'
// import WithdrawActions from './components/WithdrawActions'
import Modal from 'pages/DexV2/common/modals'
import useExitPool from 'state/dexV2/pool/useExitPool'
import { useTokens } from 'state/dexV2/tokens/hooks/useTokens'
import useNetwork from 'hooks/dex-v2/useNetwork'
import { Pool } from 'services/pool/types'
import BalCircle from 'pages/DexV2/common/BalCircle'
import TokenAmounts from 'pages/DexV2/common/forms/TokenAmounts'
import WithdrawSummary from './WithdrawSummary'
import WithdrawActions from './WithdrawActions'
import { setDataForSingleAmountOut } from 'state/dexV2/pool'
import BalAlert from 'pages/DexV2/common/BalAlert'

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
    shouldExitViaInternalBalance,
    hasBpt,
    setBptIn,
  } = useExitPool(pool)

  // Local state for whether the withdrawal is confirmed.
  const [withdrawalConfirmed, setWithdrawalConfirmed] = useState(false)

  // Derived values computed inline:
  const title = withdrawalConfirmed ? 'Withdrawal confirmed' : 'Withdrawal preview'

  const showTokensIn = !isSingleAssetExit

  // Create maps from pool address.
  const amountInMap = { [pool.address]: bptIn }
  console.log('amountInMap', amountInMap)
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

  // Close handler: if no BPT, navigate to the pool page; else call onClose callback.
  const handleClose = () => {
    if (!hasBpt) {
      history.push(`/pool/${pool.id}?networkSlug=${networkSlug}`)
    } else {
      onClose()
    }
  }

  const onSuccess = () => {
    setWithdrawalConfirmed(true)
    if (showTokensIn) {
      setBptIn('')
    } else {
      dispatch(setDataForSingleAmountOut({ key: 'value', value: '' }))
    }
  }

  return (
    <Modal onClose={onClose}>
      <ModalHeader>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {withdrawalConfirmed && (
            <BalCircle size="8" color="green" style={{ marginRight: '0.5rem' }}>
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
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </BalCircle>
          )}
          <div>{title}</div>
        </div>
      </ModalHeader>

      {shouldExitViaInternalBalance && (
        <BalAlert type="warning" title="Withdraw to Vault balance" style={{ marginBottom: '1rem' }}>
          This transaction will withdraw your tokens from this pool to your Balancer Vault balance. \n\nYou will then be
          able to withdraw the relevant tokens from the Vault using the{' '}
          <a
            href={`/balances?networkSlug=${networkSlug}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            Vault balances page
          </a>
        </BalAlert>
      )}

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

      <div className="mt-4">
        <WithdrawActions pool={pool} onError={handleClose} onSuccess={onSuccess} />
      </div>
    </Modal>
  )
}

export default WithdrawPreviewModal

const ModalHeader = styled.div`
  width: 100%;
  /* Omit dark mode; you can adjust text colors as needed */
  color: #6b7280;

  .mt-4 {
    margin-top: 1rem;
  }
`
