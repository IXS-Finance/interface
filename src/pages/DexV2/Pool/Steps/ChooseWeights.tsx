import React, { useEffect } from 'react'
import styled from 'styled-components'
import { uniqueId } from 'lodash'

import TokenWeightInput from '../components/TokenWeightInput'
import BalProgressBar from '../components/ProgressBar'
import { Line } from '../Create'
import { usePoolCreationState } from 'state/dexV2/poolCreation/hooks'
import { usePoolCreation } from 'state/dexV2/poolCreation/hooks/usePoolCreation'
import { PoolSeedToken } from '../types'
import { useDispatch } from 'react-redux'
import { distributeWeights } from 'state/dexV2/poolCreation'

const emptyTokenWeight: PoolSeedToken = {
  tokenAddress: '',
  weight: 0,
  id: '0',
  isLocked: false,
  amount: '0',
}

const ChooseWeights: React.FC = () => {
  const dipatch = useDispatch()
  const { updateTokenWeights, updateTokenWeight, updateLockedWeight } = usePoolCreation()
  const { seedTokens } = usePoolCreationState()

  const totalAllocatedWeight = 70

  const progressBarColor = () => {
    if (Number(totalAllocatedWeight) > 100 || Number(totalAllocatedWeight) <= 0) {
      return 'red'
    }
    return '#66F'
  }

  async function addTokenToPool() {
    const newWeights: PoolSeedToken[] = [...seedTokens, { ...emptyTokenWeight, id: uniqueId() } as PoolSeedToken]

    updateTokenWeights(newWeights)
    // distributeWeights();
  }

  function handleWeightChange(weight: string, id: number) {
    updateTokenWeight(id, Number(weight))
  }

  function handleLockedWeight(isLocked: boolean, id: number) {
    updateLockedWeight(id, isLocked)
  }

  async function handleRemoveToken(index: number) {
    updateTokenWeights(seedTokens.filter((_, i) => i !== index))
  }

  useEffect(() => {
    if (!seedTokens.length) {
      const newWeights: PoolSeedToken[] = [
        { ...emptyTokenWeight, id: uniqueId() } as PoolSeedToken,
        { ...emptyTokenWeight, id: uniqueId() } as PoolSeedToken,
      ]

      updateTokenWeights(newWeights)
      dipatch(distributeWeights())
    }
  }, [])

  return (
    <div>
      {seedTokens.map((token, i) => {
        return (
          <TokenWeightInput
            key={`tokenweight-${token.id}`}
            weight={token.weight}
            address={token.tokenAddress}
            updateWeight={(data) => handleWeightChange(data, i)}
            updateLocked={(data) => handleLockedWeight(data, i)}
            deleteItem={() => handleRemoveToken(i)}
          />
        )
      })}

      <AddTokenButton>Add a Token</AddTokenButton>

      <Line />

      <WrapProgressBar>
        <TitleProgressBar>
          <LeftContentProgressBar>Total Allocated</LeftContentProgressBar>
          <RightContentProgressBar>{totalAllocatedWeight}%</RightContentProgressBar>
        </TitleProgressBar>
        <BalProgressBar width={70} color={progressBarColor()} />
      </WrapProgressBar>

      <Line />

      <ButtonPrimary>Connect Wallet</ButtonPrimary>
    </div>
  )
}

export default ChooseWeights

const AddTokenButton = styled.button`
  border-radius: 8px;
  border: 1px solid #e6e6ff;
  background: #fff;
  display: flex;
  height: 36px;
  padding: 8px 12px;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 16px;
  color: rgba(102, 102, 255, 0.9);
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  line-height: 0;
  cursor: pointer;
`

const ButtonPrimary = styled.button`
  display: flex;
  height: 48px;
  padding: 12px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  color: #fff;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.28px;
  border-radius: 8px;
  background: #66f;
  border: none;
  width: 100%;

  &:hover {
    background: #4dabf7;
  }

  &:active {
    background: #3a8de3;
  }

  &:disabled {
    background: #e6e6ff;
    color: #b8b8d2;
  }
`

const LeftContentProgressBar = styled.div`
  color: #b8b8d2;
  font-family: Inter;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  letter-spacing: -0.42px;
`

const RightContentProgressBar = styled.div`
  color: rgba(41, 41, 51, 0.9);
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  letter-spacing: -0.6px;
`

const TitleProgressBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 32px;
`

const WrapProgressBar = styled.div`
  margin-bottom: 32px;
`
