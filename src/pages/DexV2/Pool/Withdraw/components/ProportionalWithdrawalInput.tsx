// ProportionalWithdrawalInput.tsx
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { bnum, isSameAddress, selectByAddress } from 'lib/utils'
import ProportionalWithdrawalTokenInfo from './ProportionalWithdrawalTokenInfo'
import { Pool, PoolToken } from 'services/pool/types'
import useExitPool from 'state/dexV2/pool/useExitPool'
import TokenInput from './TokenInput'
import { overflowProtected } from '../../components/helpers'
import { Flex } from 'rebass'

type WithdrawFormProps = {
  pool: Pool
}

const ProportionalWithdrawalInput: React.FC<WithdrawFormProps> = ({ pool }) => {
  // Get exit pool state and methods from your hook.
  const {
    bptIn,
    setBptIn,
    bptInValid,
    bptBalance,
    hasBpt,
    isLoadingQuery,
    exitTokens,
    propAmountsOut,
    exitTokenInfo,
    fiatAmountsOut,
    fiatTotalOut,
  } = useExitPool(pool)

  // // Initialize on mount: set bptIn to bptBalance.
  // useEffect(() => {
  //   setBptIn(bptBalance)
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // When the TokenInput amount changes, update the slider.
  const handleAmountChange = (value: string): void => {
    if (!value) return

    const safeAmount = overflowProtected(value, pool.onchain?.decimals || 18)
    setBptIn(safeAmount)
  }

  // Return the pool token from exitTokens matching the given address.
  const getPoolToken = (address: string): PoolToken | undefined => {
    return exitTokens.find((token: any) => isSameAddress(token.address, address))
  }

  return (
    <Flex flexDirection="column" css={{ gap: '1rem' }} mt="32px">
      <Label>You’re Providing</Label>
      <TokenInput
        // Assume TokenInput is a controlled component with these props.
        amount={bptIn}
        address={pool.address}
        name={pool.address}
        fixedToken
        tokenValue={fiatTotalOut}
        updateAmount={handleAmountChange}
        updateAddress={() => {}}
      />
      <Label>You receive</Label>
      <TokenAmountsContainer>
        {propAmountsOut.map(({ address, value }: any) => (
          <ProportionalWithdrawalTokenInfo
            key={address}
            token={selectByAddress(exitTokenInfo, address)}
            weight={getPoolToken(address)?.weight || '0'}
            address={address}
            fiatAmountOut={selectByAddress(fiatAmountsOut, address)}
            loading={isLoadingQuery}
            pool={pool}
            value={value}
            // className="last:mb-0"
          />
        ))}
      </TokenAmountsContainer>
    </Flex>
  )
}

export default ProportionalWithdrawalInput

// Styled components for labels and token amounts container.
const Label = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const TokenAmountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`
